using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

[ApiController]
[Route("backend/[controller]")]
public class ServiceRequestController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ServiceRequestController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetCustomerIdFromToken()
    {
        var identity = HttpContext.User.Identity as ClaimsIdentity;
        var claim = identity?.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    [Authorize]
    [HttpPost("create-request")]
    public async Task<IActionResult> CreateServiceRequest([FromBody] CreateRequestModel model)
    {
        var customerId = GetCustomerIdFromToken();

        if (string.IsNullOrEmpty(model.RequestType) || string.IsNullOrEmpty(model.RequestDetail))
        {
            return BadRequest(new ApiError
            {
                Status = 400,
                Error = "MissingData",
                Message = "Thiếu loại yêu cầu hoặc chi tiết yêu cầu."
            });
        }

        var request = new Service_request
        {
            CustomerId = customerId,
            RequestType = model.RequestType,
            RequestDetail = model.RequestDetail,
            RequestDate = DateTime.Now,
            Status = "Pending"
        };

        _context.Service_requests.Add(request);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Tạo yêu cầu dịch vụ thành công.",
            Data = request
        });
    }

    [Authorize]
    [HttpGet("list-requests")]
    public async Task<IActionResult> GetAllRequests()
    {
        var customerId = GetCustomerIdFromToken();
        var requests = await _context.Service_requests
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.RequestDate)
            .ToListAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Lấy danh sách yêu cầu thành công.",
            Data = requests
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("process-request/{requestId}")]
    public async Task<IActionResult> ProcessServiceRequest(int requestId)
    {
        var request = await _context.Service_requests.Include(r => r.customer).FirstOrDefaultAsync(r => r.RequestId == requestId);

        if (request == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy yêu cầu." });

        if (request.Status != "Pending")
            return BadRequest(new ApiError { Status = 400, Error = "AlreadyProcessed", Message = "Yêu cầu đã được xử lý." });

        switch (request.RequestType)
        {
            case "LockCard":
                var card = await _context.Accounts.FirstOrDefaultAsync(a => a.customer_id == request.CustomerId && a.Status != "Locked");
                if (card != null)
                {
                    card.Status = "Locked";
                    request.Status = "Approved";
                }
                else request.Status = "Rejected";
                break;

            case "UnlockAccount":
                var customer = await _context.Customers.FindAsync(request.CustomerId);
                if (customer != null && customer.locked)
                {
                    customer.locked = false;
                    customer.number_login = 0;
                    request.Status = "Approved";
                }
                else request.Status = "Rejected";
                break;

            case "CloseAccount":
                var accounts = await _context.Accounts.Where(a => a.customer_id == request.CustomerId && a.Balance == 0).ToListAsync();
                if (accounts.Any())
                {
                    _context.Accounts.RemoveRange(accounts);
                    request.Status = "Approved";
                }
                else request.Status = "Rejected";
                break;

            case "UpdateInfo":
                try
                {
                    var updateData = JsonSerializer.Deserialize<UpdateInfoModel>(request.RequestDetail);
                    var cust = await _context.Customers.FindAsync(request.CustomerId);

                    if (cust != null)
                    {
                        if (!string.IsNullOrEmpty(updateData.FullName)) cust.full_name = updateData.FullName;
                        if (!string.IsNullOrEmpty(updateData.Email)) cust.email = updateData.Email;
                        if (!string.IsNullOrEmpty(updateData.Mobile)) cust.mobile = updateData.Mobile;
                        if (!string.IsNullOrEmpty(updateData.Password))
                            cust.password = BCrypt.Net.BCrypt.HashPassword(updateData.Password);

                        request.Status = "Approved";
                    }
                    else
                    {
                        request.Status = "Rejected";
                    }
                }
                catch
                {
                    return BadRequest(new ApiError
                    {
                        Status = 400,
                        Error = "InvalidJson",
                        Message = "RequestDetail không đúng định dạng JSON."
                    });
                }
                break;

            default:
                return BadRequest(new ApiError { Status = 400, Error = "InvalidType", Message = "Loại yêu cầu không hợp lệ." });
        }

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = $"Đã xử lý yêu cầu {request.RequestType} - {request.Status}.",
            Data = request
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("reject-request/{requestId}")]
    public async Task<IActionResult> RejectRequest(int requestId)
    {
        var request = await _context.Service_requests.FindAsync(requestId);
        if (request == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy yêu cầu." });

        if (request.Status != "Pending")
            return BadRequest(new ApiError { Status = 400, Error = "AlreadyProcessed", Message = "Yêu cầu đã được xử lý." });

        request.Status = "Rejected";
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Yêu cầu đã bị từ chối.",
            Data = request
        });
    }

    // ===== ADMIN trực tiếp xử lý không qua Service_request =====

    [Authorize(Roles = "Admin")]
    [HttpPost("admin/lock-card/{accountId}")]
    public async Task<IActionResult> LockCard(int accountId)
    {
        var account = await _context.Accounts.FindAsync(accountId);
        if (account == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy thẻ." });

        account.Status = "Locked";
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<string> { Status = 200, Message = "Đã khóa thẻ thành công.", Data = "Locked" });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("admin/unlock-card/{accountId}")]
    public async Task<IActionResult> UnlockCard(int accountId)
    {
        var account = await _context.Accounts.FindAsync(accountId);
        if (account == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy thẻ." });

        account.Status = "Active";
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<string> { Status = 200, Message = "Đã mở khóa thẻ thành công.", Data = "Unlocked" });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("admin/delete-card/{accountId}")]
    public async Task<IActionResult> DeleteCard(int accountId)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == accountId);
        if (account == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy thẻ." });

        if (account.Balance > 0)
            return BadRequest(new ApiError { Status = 400, Error = "BalanceNotZero", Message = "Không thể xóa thẻ có số dư lớn hơn 0." });

        _context.Accounts.Remove(account);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<string> { Status = 200, Message = "Đã xóa thẻ thành công.", Data = "Deleted" });
    }
}
