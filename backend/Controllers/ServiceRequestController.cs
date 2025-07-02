using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using backend.enums;


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

        decimal fee = model.Quantity == 25 ? 25000m : 40000m;
        if (account.Balance < fee)
            return BadRequest(new ApiError { Status = 400, Error = "InsufficientFunds", Message = "Không đủ số dư để gửi yêu cầu." });

        account.Balance -= fee;

        // Ghi sao kê trừ phí
        _context.statements.Add(new Statements
        {
            account_id = account.account_id,
            PeriodType = "fee",
            StartDate = DateTime.Today,
            EndDate = DateTime.Today,
            GeneratedOn = DateTime.Now,
            FileUrl = "",
        });

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
                request.Status,
                AccountId = account.account_id,
                AmountChanged = -fee,
                TransactionType = "Debit"
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
        .FirstOrDefaultAsync(r => r.RequestId == requestId &&
                                r.CustomerId == customerId &&
                                r.RequestType == "IssueChequeBook");

    if (request == null)
    {
        return NotFound(new ApiError
        {
            Status = 404,
            Error = "RequestNotFound",
            Message = "Không tìm thấy yêu cầu sổ séc."
        });
    }

    if (request.Status == "Cancelled by user" || request.Status == "Rejected")
    {
        return BadRequest(new ApiError
        {
            Status = 400,
            Error = "AlreadyCancelled",
            Message = "Yêu cầu đã bị huỷ hoặc từ chối trước đó."
        });
    }

    var detail = JsonSerializer.Deserialize<ChequeBookRequestModel>(request.RequestDetail);
    var account = await _context.Accounts.FirstOrDefaultAsync(a =>
        a.account_id == detail.AccountId && a.customer_id == customerId);

    if (account == null)
    {
        return NotFound(new ApiError
        {
            Status = 404,
            Error = "AccountNotFound",
            Message = "Không tìm thấy tài khoản."
        });
    }

    decimal cancelFee = 5000m;
    decimal refund = 0m;
    string message;

    if (request.Status == "Pending")
    {
        refund = detail.Quantity == 25 ? 25000m : 40000m;

        if (account.Balance + refund < cancelFee)
        {
            return BadRequest(new ApiError
            {
                Status = 400,
                Error = "InsufficientFunds",
                Message = "Không đủ số dư để huỷ yêu cầu (sau khi hoàn tiền)."
            });
        }

        account.Balance += refund - cancelFee;

        // Ghi dòng hoàn tiền
        _context.statements.Add(new Statements
        {
            account_id = account.account_id,
            PeriodType = "refund",
            StartDate = DateTime.Now.Date,
            EndDate = DateTime.Now.Date,
            GeneratedOn = DateTime.Now,
            FileUrl = ""
        });

        message = $"Đã huỷ yêu cầu sổ séc thành công. Phí huỷ {cancelFee:n0}đ và hoàn {refund:n0}đ phí sổ séc.";
    }
    else if (request.Status == "Approved")
    {
        if (account.Balance < cancelFee)
        {
            return BadRequest(new ApiError
            {
                Status = 400,
                Error = "InsufficientFunds",
                Message = "Không đủ số dư để huỷ yêu cầu."
            });
        }

        account.Balance -= cancelFee;

        // Đánh dấu các séc đã cấp là Cancelled
        var cheques = await _context.Cheques
            .Where(c => c.AccountId == account.account_id && c.IssuedDate >= request.RequestDate)
            .ToListAsync();

        foreach (var cheque in cheques)
        {
            if (cheque.Status == ChequeStatusEnum.Pending)
                cheque.Status = ChequeStatusEnum.Cancelled;
        }

        message = $"Đã huỷ yêu cầu sổ séc thành công. Phí huỷ {cancelFee:n0}đ.";
    }
    else
    {
        return BadRequest(new ApiError
        {
            Status = 400,
            Error = "InvalidStatus",
            Message = "Trạng thái yêu cầu không hợp lệ để huỷ."
        });
    }

    // Ghi dòng phí huỷ
    _context.statements.Add(new Statements
    {
        account_id = account.account_id,
        PeriodType = "cancel_fee",
        StartDate = DateTime.Now.Date,
        EndDate = DateTime.Now.Date,
        GeneratedOn = DateTime.Now,
        FileUrl = ""
    });

    request.Status = "Cancelled by user";

    await _context.SaveChangesAsync();

    return Ok(new ApiResponse<object>
    {
        Status = 200,
        Message = message,
        Data = new
        {
            request.RequestId,
            accountId = account.account_id,
            amountChanged = refund - cancelFee,
            transactionType = (refund - cancelFee) >= 0 ? "Credit" : "Debit"
        }
    });
}

    

}
