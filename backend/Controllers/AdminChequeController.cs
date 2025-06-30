using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using backend.Enums;
using backend.ViewModel;
using backend.enums;

[ApiController]
[Route("backend/[controller]")]
public class AdminChequeController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly EmailHelper _emailHelper;

    public AdminChequeController(ApplicationDbContext context, EmailHelper emailHelper)
    {
        _context = context;
        _emailHelper = emailHelper;
    }

    private bool IsAdmin()
    {
        var email = User.Claims.FirstOrDefault(c => c.Type == "email")?.Value;
        return email != null && email.ToLower().Contains("admin");
    }

    [Authorize]
    [HttpGet("all-requests")]
    public async Task<IActionResult> GetAllChequeBookRequests()
    {
        if (!IsAdmin())
            return Unauthorized();

        var requests = await _context.Service_requests
            .Include(r => r.customer)
            .Where(r => r.RequestType == RequestTypeEnum.IssueChequeBook)
            .OrderByDescending(r => r.RequestDate)
            .ToListAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Tất cả yêu cầu cấp sổ séc",
            Data = requests.Select(r =>
            {
                var detail = JsonSerializer.Deserialize<ChequeBookRequestModel>(
                    r.RequestDetail,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                return new
                {
                    r.RequestId,
                    r.RequestDate,
                    r.Status,
                    r.CustomerId,
                    Email = r.customer.email,
                    r.Reason,
                    Detail = detail
                };
            })
        });
    }

    [Authorize]
    [HttpPost("approve/{requestId}")]
    public async Task<IActionResult> ApproveRequest(int requestId)
    {
        if (!IsAdmin())
            return Unauthorized();

        var request = await _context.Service_requests
            .Include(r => r.customer)
            .FirstOrDefaultAsync(r => r.RequestId == requestId);

        if (request == null || request.Status != ChequeStatusEnum.Pending)
            return BadRequest(new ApiError { Status = 400, Error = "InvalidRequest", Message = "Yêu cầu không hợp lệ." });

        var detail = JsonSerializer.Deserialize<ChequeBookRequestModel>(
            request.RequestDetail,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (detail == null || (detail.Quantity != 25 && detail.Quantity != 50))
            return BadRequest(new ApiError { Status = 400, Error = "MalformedDetail", Message = "Chi tiết yêu cầu không hợp lệ." });

        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == detail.AccountId);
        if (account == null)
            return NotFound(new ApiError { Status = 404, Error = "AccountNotFound", Message = "Tài khoản không tồn tại." });

        int quantity = detail.Quantity;
        int latestSerial = await _context.Cheques.OrderByDescending(c => c.ChequeId).Select(c => c.ChequeId).FirstOrDefaultAsync();

        for (int i = 1; i <= quantity; i++)
        {
            _context.Cheques.Add(new Cheque
            {
                AccountId = detail.AccountId,
                Amount = 0,
                Status = ChequeStatusEnum.Pending,
                IssuedDate = DateTime.Now,
                SerialNumber = $"CHQ{latestSerial + i:D6}"
            });
        }

        request.Status = ChequeStatusEnum.Approved;
        await _context.SaveChangesAsync();

        // Gửi email thông báo
        var subject = "Yêu cầu cấp sổ séc đã được chấp thuận";
        var body = $"Xin chào {request.customer.full_name},\n\nYêu cầu cấp {quantity} séc của bạn đã được phê duyệt.\nSố tài khoản: {account.CardNumber}\nNgày duyệt: {DateTime.Now:dd/MM/yyyy}.";

        await _emailHelper.SendEmailAsync(request.customer.email, subject, body);

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Yêu cầu đã được duyệt và séc đã được cấp.",
            Data = new { request.RequestId, Quantity = quantity }
        });
    }

    [Authorize]
    [HttpPost("reject/{requestId}")]
    public async Task<IActionResult> RejectRequest(int requestId)
    {
        if (!IsAdmin())
            return Unauthorized();

        var request = await _context.Service_requests
            .Include(r => r.customer)
            .FirstOrDefaultAsync(r => r.RequestId == requestId);

        if (request == null || request.Status != ChequeStatusEnum.Pending)
            return BadRequest(new ApiError { Status = 400, Error = "InvalidRequest", Message = "Yêu cầu không hợp lệ." });

        var detail = JsonSerializer.Deserialize<ChequeBookRequestModel>(
            request.RequestDetail,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (detail == null || (detail.Quantity != 25 && detail.Quantity != 50))
            return BadRequest(new ApiError { Status = 400, Error = "MalformedDetail", Message = "Chi tiết yêu cầu không hợp lệ." });

        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == detail.AccountId);
        if (account == null)
            return NotFound(new ApiError { Status = 404, Error = "AccountNotFound", Message = "Tài khoản không tồn tại." });

        string feeKey = "IssueChequeBook_" + detail.Quantity;
        var fee = await _context.ChequeFees.FindAsync(feeKey);
        decimal refund = fee?.FeeAmount ?? (detail.Quantity == 25 ? 25000m : 40000m);

        account.Balance += refund;
        request.Status = ChequeStatusEnum.Rejected;
        await _context.SaveChangesAsync();

        // Gửi email thông báo từ chối
        var subject = "Yêu cầu cấp sổ séc đã bị từ chối";
        var body = $"Xin chào {request.customer.full_name},\n\nYêu cầu cấp sổ séc của bạn đã bị từ chối. Phí yêu cầu đã được hoàn lại: {refund:#,##0} VND.";

        await _emailHelper.SendEmailAsync(request.customer.email, subject, body);

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Yêu cầu đã bị từ chối và hoàn tiền.",
            Data = new { request.RequestId, RefundAmount = refund }
        });
    }

    [Authorize]
    [HttpPost("update-status/{chequeId}")]
    public async Task<IActionResult> UpdateChequeStatus(int chequeId, [FromQuery] string newStatus)
    {
        if (!IsAdmin())
            return Unauthorized();

        var cheque = await _context.Cheques.Include(c => c.Account).ThenInclude(a => a.customer)
            .FirstOrDefaultAsync(c => c.ChequeId == chequeId);

        if (cheque == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy séc." });

        if (newStatus != ChequeStatusEnum.Paid && newStatus != ChequeStatusEnum.Cancelled)
            return BadRequest(new ApiError { Status = 400, Error = "InvalidStatus", Message = "Trạng thái không hợp lệ." });

        cheque.Status = newStatus;
        cheque.PaidDate = newStatus == ChequeStatusEnum.Paid ? DateTime.Now : cheque.PaidDate;

        await _context.SaveChangesAsync();

        // Gửi email xác nhận trạng thái thay đổi
        string subject = $"Trạng thái séc {cheque.SerialNumber} đã cập nhật";
        string body = $"Xin chào {cheque.Account.customer.full_name},\n\nSéc có số hiệu {cheque.SerialNumber} đã được cập nhật trạng thái thành: {newStatus}.";

        await _emailHelper.SendEmailAsync(cheque.Account.customer.email, subject, body);

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Đã cập nhật trạng thái séc.",
            Data = new { cheque.ChequeId, cheque.SerialNumber, cheque.Status, cheque.PaidDate }
        });
    }


    [Authorize]
    [HttpGet("usage-report")]
    public async Task<IActionResult> GetChequeUsageReport([FromQuery] int accountId)
    {
        if (!IsAdmin())
            return Unauthorized();

        var account = await _context.Accounts.Include(a => a.customer)
            .FirstOrDefaultAsync(a => a.account_id == accountId);

        if (account == null)
            return NotFound(new ApiError { Status = 404, Error = "AccountNotFound", Message = "Không tìm thấy tài khoản." });

        var totalIssued = await _context.Cheques.CountAsync(c => c.AccountId == accountId);
        var totalPaid = await _context.Cheques.CountAsync(c => c.AccountId == accountId && c.Status == ChequeStatusEnum.Paid);
        var totalCancelled = await _context.Cheques.CountAsync(c => c.AccountId == accountId && c.Status == ChequeStatusEnum.Cancelled);
        var totalPending = totalIssued - totalPaid - totalCancelled;

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Báo cáo sử dụng séc",
            Data = new
            {
                Account = account.CardNumber,
                Customer = account.customer.full_name,
                TotalIssued = totalIssued,
                TotalPaid = totalPaid,
                TotalCancelled = totalCancelled,
                TotalPending = totalPending
            }
        });
    }

    [Authorize]
    [HttpGet("cheques/filter")]
    public async Task<IActionResult> FilterCheques([FromQuery] string? status, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? cardNumber)
    {
        if (!IsAdmin())
            return Unauthorized();

        var query = _context.Cheques
            .Include(c => c.Account)
            .ThenInclude(a => a.customer)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(c => c.Status == status);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(c => c.IssuedDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(c => c.IssuedDate <= toDate.Value);
        }

        if (!string.IsNullOrEmpty(cardNumber))
        {
            query = query.Where(c => c.Account.CardNumber == cardNumber);
        }

        var result = await query
            .OrderByDescending(c => c.IssuedDate)
            .Select(c => new
            {
                c.ChequeId,
                c.SerialNumber,
                c.Status,
                c.IssuedDate,
                c.PaidDate,
                AccountNumber = c.Account.CardNumber,
                Customer = c.Account.customer.full_name
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Danh sách séc đã lọc",
            Data = result
        });
    }

    [Authorize]
    [HttpGet("search-by-serial")]
    public async Task<IActionResult> SearchChequeBySerial([FromQuery] string serial)
    {
        if (!IsAdmin())
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(serial))
        {
            return BadRequest(new ApiError
            {
                Status = 400,
                Error = "MissingSerial",
                Message = "Vui lòng nhập số Serial cần tìm."
            });
        }

        var cheque = await _context.Cheques
            .Include(c => c.Account)
            .ThenInclude(a => a.customer)
            .FirstOrDefaultAsync(c => c.SerialNumber == serial);

        if (cheque == null)
        {
            return NotFound(new ApiError
            {
                Status = 404,
                Error = "ChequeNotFound",
                Message = $"Không tìm thấy séc với SerialNumber: {serial}."
            });
        }

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Thông tin séc tìm thấy.",
            Data = new
            {
                cheque.ChequeId,
                cheque.SerialNumber,
                cheque.Status,
                cheque.IssuedDate,
                cheque.PaidDate,
                AccountNumber = cheque.Account.CardNumber,
                CustomerName = cheque.Account.customer.full_name,
                Email = cheque.Account.customer.email
            }
        });
    }

}
