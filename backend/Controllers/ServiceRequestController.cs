using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
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

        if (!RequestTypeEnum.AllowedTypes.Contains(model.RequestType))
        {
            return BadRequest(new ApiError
            {
                Status = 400,
                Error = "InvalidRequestType",
                Message = $"Loại yêu cầu không hợp lệ. Chỉ chấp nhận: {string.Join(", ", RequestTypeEnum.AllowedTypes)}"
            });
        }

        try
        {
            switch (model.RequestType)
            {
                case RequestTypeEnum.LockAccount:
                case RequestTypeEnum.UnlockAccountCard:
                case RequestTypeEnum.CloseAccount:
                    var accData = JsonSerializer.Deserialize<AccountActionModel>(model.RequestDetail);
                    if (accData == null || accData.AccountId <= 0)
                        return BadRequest(new ApiError { Status = 400, Error = "InvalidAccountData", Message = "Dữ liệu tài khoản không hợp lệ." });

                    var account = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == accData.AccountId && a.customer_id == customerId);
                    if (account == null)
                        return BadRequest(new ApiError { Status = 400, Error = "AccountNotFound", Message = "Không tìm thấy tài khoản hoặc không thuộc quyền sở hữu." });
                    break;

                case RequestTypeEnum.IssueCheque:
                    var chequeData = JsonSerializer.Deserialize<ChequeRequestModel>(model.RequestDetail);
                    if (chequeData == null || chequeData.AccountId <= 0 || chequeData.Amount <= 0)
                        return BadRequest(new ApiError { Status = 400, Error = "InvalidChequeData", Message = "Dữ liệu cấp séc không hợp lệ." });

                    var chequeAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == chequeData.AccountId && a.customer_id == customerId);
                    if (chequeAccount == null)
                        return BadRequest(new ApiError { Status = 400, Error = "AccountNotFound", Message = "Tài khoản không tồn tại hoặc không thuộc quyền sở hữu." });

                    if (chequeAccount.CardType == "Credit")
                        return BadRequest(new ApiError { Status = 400, Error = "InvalidCardType", Message = "Không thể yêu cầu cấp séc cho thẻ Credit." });
                    break;

                case RequestTypeEnum.CancelCheque:
                    var cancelData = JsonSerializer.Deserialize<CancelChequeModel>(model.RequestDetail);
                    if (cancelData == null || cancelData.ChequeId <= 0)
                        return BadRequest(new ApiError { Status = 400, Error = "InvalidCancelData", Message = "Dữ liệu hủy séc không hợp lệ." });

                    var cheque = await _context.Cheques.Include(c => c.Account).FirstOrDefaultAsync(c => c.ChequeId == cancelData.ChequeId && c.Account.customer_id == customerId);
                    if (cheque == null)
                        return BadRequest(new ApiError { Status = 400, Error = "NotFound", Message = "Không tìm thấy séc hoặc không thuộc quyền sở hữu." });
                    break;

                case RequestTypeEnum.UpdateInfo:
                    JsonSerializer.Deserialize<UpdateInfoModel>(model.RequestDetail);
                    break;
            }
        }
        catch
        {
            return BadRequest(new ApiError { Status = 400, Error = "InvalidJson", Message = "Chi tiết yêu cầu không đúng định dạng JSON." });
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
    [HttpGet("my-requests")]
    public async Task<IActionResult> GetMyRequests()
    {
        var customerId = GetCustomerIdFromToken();

        var requests = await _context.Service_requests
            .Where(r => r.CustomerId == customerId)
            .OrderByDescending(r => r.RequestDate)
            .Select(r => new
            {
                r.RequestId,
                r.RequestType,
                r.RequestDetail,
                r.RequestDate,
                r.Status
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Danh sách yêu cầu của bạn",
            Data = requests
        });
    }

    // [Authorize] //(Roles = "Admin")]
    [HttpGet("all-requests")]
    public async Task<IActionResult> GetAllRequests()
    {
        var requests = await _context.Service_requests
            .Include(r => r.customer)
            .OrderByDescending(r => r.RequestDate)
            .ToListAsync();

        var response = new List<object>();

        foreach (var r in requests)
        {
            decimal? balance = null;

            
            if (r.RequestType == RequestTypeEnum.LockAccount ||
                r.RequestType == RequestTypeEnum.UnlockAccountCard ||
                r.RequestType == RequestTypeEnum.CloseAccount ||
                r.RequestType == RequestTypeEnum.IssueCheque)
            {
                try
                {
                    var accountId = 0;

                    if (r.RequestType == RequestTypeEnum.IssueCheque)
                    {
                        var chequeData = JsonSerializer.Deserialize<ChequeRequestModel>(r.RequestDetail);
                        accountId = chequeData?.AccountId ?? 0;
                    }
                    else
                    {
                        var accData = JsonSerializer.Deserialize<AccountActionModel>(r.RequestDetail);
                        accountId = accData?.AccountId ?? 0;
                    }

                    if (accountId > 0)
                    {
                        var acc = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == accountId);
                        if (acc != null)
                            balance = acc.Balance;
                    }
                }
                catch
                {
                
                }
            }

            response.Add(new
            {
                r.RequestId,
                CustomerName = r.customer?.full_name,
                r.RequestType,
                r.RequestDetail,
                r.RequestDate,
                r.Status,
                Balance = balance
            });
        }

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Danh sách tất cả yêu cầu",
            Data = response
        });
        }

    // [Authorize]//(Roles = "Admin")]
    [HttpPost("process-request/{requestId}")]
    public async Task<IActionResult> ProcessServiceRequest(int requestId)
    {
        var request = await _context.Service_requests.Include(r => r.customer).FirstOrDefaultAsync(r => r.RequestId == requestId);
        if (request == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy yêu cầu." });

        if (request.Status != "Pending")
            return BadRequest(new ApiError { Status = 400, Error = "AlreadyProcessed", Message = "Yêu cầu đã được xử lý." });

        try
        {
            switch (request.RequestType)
            {
                case RequestTypeEnum.LockAccount:
                    var lockData = JsonSerializer.Deserialize<AccountActionModel>(request.RequestDetail);
                    var accToLock = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == lockData.AccountId && a.customer_id == request.CustomerId);
                    if (accToLock != null && accToLock.Status != "Locked")
                    {
                        accToLock.Status = "Locked";
                        request.Status = "Approved";
                    }
                    else request.Status = "Rejected";
                    break;

                case RequestTypeEnum.UnlockAccountCard:
                    var unlockData = JsonSerializer.Deserialize<AccountActionModel>(request.RequestDetail);
                    var accToUnlock = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == unlockData.AccountId && a.customer_id == request.CustomerId);
                    if (accToUnlock != null && accToUnlock.Status == "Locked")
                    {
                        accToUnlock.Status = "Active";
                        request.Status = "Approved";
                    }
                    else request.Status = "Rejected";
                    break;

                case RequestTypeEnum.CloseAccount:
                    var closeData = JsonSerializer.Deserialize<AccountActionModel>(request.RequestDetail);
                    var accToClose = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == closeData.AccountId && a.customer_id == request.CustomerId);
                    if (accToClose != null && accToClose.Balance == 0)
                    {
                        _context.Accounts.Remove(accToClose);
                        request.Status = "Approved";
                    }
                    else request.Status = "Rejected";
                    break;

                case RequestTypeEnum.UnlockAccount:
                    var customer = await _context.Customers.FindAsync(request.CustomerId);
                    if (customer != null && customer.locked)
                    {
                        customer.locked = false;
                        customer.number_login = 0;
                        request.Status = "Approved";
                    }
                    else request.Status = "Rejected";
                    break;

                case RequestTypeEnum.UpdateInfo:
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
                    else request.Status = "Rejected";
                    break;

                default:
                    return BadRequest(new ApiError { Status = 400, Error = "InvalidType", Message = "Loại yêu cầu không hợp lệ." });
            }
        }
        catch
        {
            return BadRequest(new ApiError { Status = 400, Error = "InvalidJson", Message = "RequestDetail không đúng định dạng JSON." });
        }

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = $"Đã xử lý yêu cầu {request.RequestType} - {request.Status}.",
            Data = request
        });
    }

    // [Authorize] //(Roles = "Admin")]
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
}
