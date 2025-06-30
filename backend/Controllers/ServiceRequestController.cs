using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using backend.Enums;


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
    [HttpPost("request-cheque-book")]
    public async Task<IActionResult> RequestChequeBook([FromBody] ChequeBookRequestModel model)
    {
        var customerId = GetCustomerIdFromToken();

        if (model.AccountId <= 0 || string.IsNullOrWhiteSpace(model.DeliveryAddress) ||
            (model.Quantity != 25 && model.Quantity != 50))
        {
            return BadRequest(new ApiError { Status = 400, Error = "InvalidData", Message = "Thông tin yêu cầu không hợp lệ." });
        }

        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == model.AccountId && a.customer_id == customerId);
            if (account == null || account.Status != "Active" || account.CardType == "Credit")
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "InvalidAccount",
                    Message = "Không thể yêu cầu sổ séc cho thẻ tín dụng."
                });
            }


        // Hard-coded fee logic
        decimal fee = model.Quantity == 25 ? 25000m : 40000m;
        if (account.Balance < fee)
            return BadRequest(new ApiError { Status = 400, Error = "InsufficientFunds", Message = "Không đủ số dư để gửi yêu cầu." });

        account.Balance -= fee;

       var detail = JsonSerializer.Serialize(new
            {
                model.AccountId,
                model.DeliveryAddress,
                Quantity = model.Quantity, 
                model.Purpose
            });

        var request = new Service_request
        {
            CustomerId = customerId,
            RequestType = "IssueChequeBook",
            RequestDetail = detail,
            RequestDate = DateTime.Now,
            Status = "Pending",
            Reason = model.Purpose
        };

        _context.Service_requests.Add(request);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Đã gửi yêu cầu cấp sổ séc.",
            Data = new
            {
                request.RequestId,
                request.RequestType,
                request.RequestDate,
                request.Status
            }
        });
    }

    [Authorize]
    [HttpGet("my-cheque-requests")]
    public async Task<IActionResult> GetMyChequeRequests()
    {
        var customerId = GetCustomerIdFromToken();

        var requests = await _context.Service_requests
            .Where(r => r.CustomerId == customerId && r.RequestType == "IssueChequeBook")
            .OrderByDescending(r => r.RequestDate)
            .ToListAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Danh sách yêu cầu cấp sổ séc.",
            Data = requests.Select(r => new
            {
                r.RequestId,
                r.RequestType,
                r.RequestDate,
                r.Status,
                r.Reason
            })
        });
    }

    [Authorize]
    [HttpPost("cancel-cheque-request/{requestId}")]
    public async Task<IActionResult> CancelChequeRequest(int requestId)
    {
        var customerId = GetCustomerIdFromToken();
        var request = await _context.Service_requests
            .FirstOrDefaultAsync(r => r.RequestId == requestId && r.CustomerId == customerId && r.RequestType == "IssueChequeBook");

        if (request == null || request.Status != "Pending")
            return BadRequest(new ApiError { Status = 400, Error = "InvalidRequest", Message = "Không thể huỷ yêu cầu này." });

        var accountId = JsonSerializer.Deserialize<ChequeBookRequestModel>(request.RequestDetail)?.AccountId ?? 0;
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == accountId && a.customer_id == customerId);
        
        if (account == null)
        {
            return NotFound(new ApiError { Status = 404, Error = "AccountNotFound", Message = "Không tìm thấy tài khoản." });
        }

        if (account.CardType == "Credit")
        {
            return BadRequest(new ApiError
            {
                Status = 400,
                Error = "InvalidAccount",
                Message = "Không thể huỷ yêu cầu sổ séc cho thẻ tín dụng."
            });
        }

        decimal cancelFee = 5000m;
        if (account.Balance < cancelFee)
            return BadRequest(new ApiError { Status = 400, Error = "InsufficientFunds", Message = "Không đủ số dư để huỷ yêu cầu." });

        account.Balance -= cancelFee;
        request.Status = "Cancelled by user";

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Đã huỷ yêu cầu thành công (phí đã được trừ).",
            Data = new { request.RequestId }
        });
    }

}
