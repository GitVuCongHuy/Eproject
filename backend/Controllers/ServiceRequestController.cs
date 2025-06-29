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
    [HttpPost("create-request")]
    public async Task<IActionResult> CreateServiceRequest([FromBody] CreateRequestModel model)
    {
        var customerId = GetCustomerIdFromToken();

        if (string.IsNullOrEmpty(model.RequestType) || string.IsNullOrEmpty(model.RequestDetail))
            return BadRequest(new ApiError { Status = 400, Error = "MissingData", Message = "Thiếu loại yêu cầu hoặc chi tiết." });

        if (model.RequestType == RequestTypeEnum.UnlockAccount || model.RequestType == RequestTypeEnum.UnlockAccountCard)
            return BadRequest(new ApiError { Status = 400, Error = "NotAllowed", Message = "Không thể gửi yêu cầu mở khóa tại đây." });

        if (!RequestTypeEnum.AllowedTypes.Contains(model.RequestType))
            return BadRequest(new ApiError { Status = 400, Error = "InvalidRequestType", Message = "Loại yêu cầu không hợp lệ." });

        try
        {
            switch (model.RequestType)
            {
                case RequestTypeEnum.LockAccount:
                case RequestTypeEnum.CloseAccount:
                    var accData = JsonSerializer.Deserialize<AccountActionModel>(model.RequestDetail);
                    if (accData?.AccountId <= 0)
                        return BadRequest(new ApiError { Status = 400, Error = "InvalidAccountData", Message = "Dữ liệu tài khoản không hợp lệ." });

                    var account = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == accData.AccountId && a.customer_id == customerId);
                    if (account == null)
                        return BadRequest(new ApiError { Status = 400, Error = "AccountNotFound", Message = "Không tìm thấy tài khoản." });
                    break;

                case RequestTypeEnum.IssueCheque:
                    var chequeData = JsonSerializer.Deserialize<ChequeRequestModel>(model.RequestDetail);
                    if (chequeData?.AccountId <= 0 || chequeData.Amount <= 0)
                        return BadRequest(new ApiError { Status = 400, Error = "InvalidChequeData", Message = "Thông tin séc không hợp lệ." });

                    var chequeAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == chequeData.AccountId && a.customer_id == customerId);
                    if (chequeAccount == null || chequeAccount.CardType == "Credit")
                        return BadRequest(new ApiError { Status = 400, Error = "InvalidAccount", Message = "Không thể yêu cầu séc." });
                    break;

                case RequestTypeEnum.CancelCheque:
                    var cancelData = JsonSerializer.Deserialize<CancelChequeModel>(model.RequestDetail);
                    if (cancelData?.ChequeId <= 0)
                        return BadRequest(new ApiError { Status = 400, Error = "InvalidCancelData", Message = "Thông tin hủy séc không hợp lệ." });

                    var cheque = await _context.Cheques.Include(c => c.Account).FirstOrDefaultAsync(c => c.ChequeId == cancelData.ChequeId && c.Account.customer_id == customerId);
                    if (cheque == null)
                        return BadRequest(new ApiError { Status = 400, Error = "NotFound", Message = "Không tìm thấy séc." });
                    break;

                case RequestTypeEnum.UpdateInfo:
                    JsonSerializer.Deserialize<UpdateInfoModel>(model.RequestDetail);
                    break;
            }
        }
        catch
        {
            return BadRequest(new ApiError { Status = 400, Error = "InvalidJson", Message = "Chi tiết không đúng định dạng JSON." });
        }

        var request = new Service_request
        {
            CustomerId = customerId,
            RequestType = model.RequestType,
            RequestDetail = model.RequestDetail,
            RequestDate = DateTime.Now,
            Status = "Pending",
            Reason = model.Reason
        };

        _context.Service_requests.Add(request);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Tạo yêu cầu thành công.",
            Data = new
            {
                request.RequestId,
                request.RequestType,
                request.RequestDate,
                request.Status,
                request.Reason
            }
        });
    }

    [HttpPost("request-unlock-account")]
    public async Task<IActionResult> RequestUnlockAccount([FromBody] UnlockRequestModel model)
    {
        if (string.IsNullOrWhiteSpace(model.CitizenIdentificationCard) || string.IsNullOrWhiteSpace(model.Reason))
            return BadRequest(new ApiError { Status = 400, Error = "MissingData", Message = "Thiếu CCCD hoặc lý do." });

        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.citizen_identification_card == model.CitizenIdentificationCard);
        if (customer == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy người dùng." });

        var request = new Service_request
        {
            CustomerId = customer.customer_id,
            RequestType = RequestTypeEnum.UnlockAccount,
            RequestDetail = JsonSerializer.Serialize(new { model.Reason }),
            RequestDate = DateTime.Now,
            Status = "Pending",
            Reason = model.Reason
        };

        _context.Service_requests.Add(request);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Đã gửi yêu cầu mở khóa tài khoản.",
            Data = new
            {
                request.RequestId,
                request.RequestType,
                request.RequestDate,
                request.Status,
                request.Reason
            }
        });
    }

    [HttpPost("request-unlock-card")]
    public async Task<IActionResult> RequestUnlockCard([FromBody] UnlockCardRequestModel model)
    {
        if (string.IsNullOrWhiteSpace(model.CitizenIdentificationCard) || string.IsNullOrWhiteSpace(model.CardNumber) || string.IsNullOrWhiteSpace(model.Reason))
            return BadRequest(new ApiError { Status = 400, Error = "MissingData", Message = "Thiếu thông tin yêu cầu." });

        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.citizen_identification_card == model.CitizenIdentificationCard);
        if (customer == null)
            return NotFound(new ApiError { Status = 404, Error = "CustomerNotFound", Message = "Không tìm thấy người dùng." });

        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.CardNumber == model.CardNumber && a.customer_id == customer.customer_id);
        if (account == null)
            return NotFound(new ApiError { Status = 404, Error = "CardNotFound", Message = "Không tìm thấy thẻ." });

        var detail = JsonSerializer.Serialize(new { AccountId = account.account_id, model.Reason });

        var request = new Service_request
        {
            CustomerId = customer.customer_id,
            RequestType = RequestTypeEnum.UnlockAccountCard,
            RequestDetail = detail,
            RequestDate = DateTime.Now,
            Status = "Pending",
            Reason = model.Reason
        };

        _context.Service_requests.Add(request);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Đã gửi yêu cầu mở khóa thẻ.",
            Data = new
            {
                request.RequestId,
                request.RequestType,
                request.RequestDate,
                request.Status,
                request.Reason
            }
        });
    }

        [HttpPost("request-delete-card")]
        public async Task<IActionResult> RequestDeleteCard([FromBody] DeleteCardRequestModel model)
        {
            if (string.IsNullOrWhiteSpace(model.CitizenIdentificationCard) ||
                string.IsNullOrWhiteSpace(model.Email) ||
                string.IsNullOrWhiteSpace(model.CardNumber) ||
                string.IsNullOrWhiteSpace(model.Reason))
            {
                return BadRequest(new ApiError { Status = 400, Error = "MissingData", Message = "Thiếu thông tin yêu cầu." });
            }

            var customer = await _context.Customers.FirstOrDefaultAsync(c =>
                c.citizen_identification_card == model.CitizenIdentificationCard &&
                c.email == model.Email);

            if (customer == null)
                return NotFound(new ApiError { Status = 404, Error = "CustomerNotFound", Message = "Không tìm thấy người dùng." });

            var account = await _context.Accounts.FirstOrDefaultAsync(a =>
                a.CardNumber == model.CardNumber &&
                a.customer_id == customer.customer_id);

            if (account == null)
                return NotFound(new ApiError { Status = 404, Error = "CardNotFound", Message = "Không tìm thấy thẻ." });

            var detail = JsonSerializer.Serialize(new { AccountId = account.account_id, model.Reason });

            var request = new Service_request
            {
                CustomerId = customer.customer_id,
                RequestType = RequestTypeEnum.DeleteCard,
                RequestDetail = detail,
                RequestDate = DateTime.Now,
                Status = "Pending",
                Reason = model.Reason
            };

            _context.Service_requests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Đã gửi yêu cầu xóa thẻ.",
                Data = new { request.RequestId }
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
            .ToListAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Danh sách yêu cầu của bạn",
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
    [HttpGet("all-requests")]
    public async Task<IActionResult> GetAllRequests()
    {
        var requests = await _context.Service_requests
            .Include(r => r.customer)
            .OrderByDescending(r => r.RequestDate)
            .ToListAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Tất cả yêu cầu",
            Data = requests.Select(r => new
            {
                r.RequestId,
                r.RequestType,
                r.RequestDate,
                r.Status,
                r.Reason,
                Customer = r.customer?.full_name
            })
        });
    }

    [Authorize]
    [HttpPost("process-request/{requestId}")]
    public async Task<IActionResult> ProcessRequest(int requestId)
    {
        var request = await _context.Service_requests.FindAsync(requestId);
        if (request == null || request.Status != "Pending")
            return BadRequest(new ApiError { Status = 400, Error = "InvalidRequest", Message = "Không tìm thấy hoặc đã xử lý." });

        try
        {
            switch (request.RequestType)
            {
                case RequestTypeEnum.IssueCheque:
                    var issueData = JsonSerializer.Deserialize<ChequeRequestModel>(request.RequestDetail);
                    var accIssue = await _context.Accounts.FindAsync(issueData.AccountId);
                    if (accIssue != null && accIssue.Balance >= issueData.Amount)
                    {
                        accIssue.Balance -= issueData.Amount;

                        _context.Cheques.Add(new Cheque
                        {
                            AccountId = issueData.AccountId,
                            Amount = issueData.Amount,
                            IssuedDate = DateTime.Now,
                            PaidDate = DateTime.Now, // đánh dấu đã thanh toán ngay lập tức
                            Status = "Paid"
                        });

                        request.Status = "Approved";
                    }
                    else request.Status = "Rejected";
                    break;

                case RequestTypeEnum.CancelCheque:
                    var cancelData = JsonSerializer.Deserialize<CancelChequeModel>(request.RequestDetail);
                    var cheque = await _context.Cheques.Include(c => c.Account).FirstOrDefaultAsync(c => c.ChequeId == cancelData.ChequeId);

                    if (cheque != null)
                    {
                        if (cheque.Status == "Paid")
                        {
                            // Nếu đã thanh toán thì cộng lại tiền và huỷ séc
                            cheque.Status = "Cancelled";
                            cheque.Account.Balance += cheque.Amount;
                            request.Status = "Approved";
                        }
                        else if (cheque.Status == "Issued")
                        {
                            // Nếu séc đã được phát hành nhưng chưa thanh toán, huỷ và không cần hoàn tiền
                            cheque.Status = "Cancelled";
                            request.Status = "Approved";
                        }
                        else
                        {
                            request.Status = "Rejected"; // Trạng thái không hợp lệ để hủy
                        }
                    }
                    else
                    {
                        // Nếu không có séc, có thể đang chờ phê duyệt tạo séc => hủy yêu cầu tạo séc
                        var pendingIssueRequest = await _context.Service_requests.FirstOrDefaultAsync(r =>
                            r.RequestType == RequestTypeEnum.IssueCheque &&
                            r.Status == "Pending" &&
                            r.RequestDetail.Contains($"\"ChequeId\":{cancelData.ChequeId}"));

                        if (pendingIssueRequest != null)
                        {
                            pendingIssueRequest.Status = "Cancelled by user";
                            request.Status = "Approved";
                        }
                        else
                        {
                            request.Status = "Rejected"; // Không có gì để huỷ
                        }
                    }
                break;

                case RequestTypeEnum.UnlockAccount:
                    var cust = await _context.Customers.FindAsync(request.CustomerId);
                    if (cust != null && cust.locked)
                    {
                        cust.locked = false;
                        cust.number_login = 0;
                        request.Status = "Approved";
                    }
                    else request.Status = "Rejected";
                break;

                case RequestTypeEnum.UnlockAccountCard:
                    var accData = JsonSerializer.Deserialize<AccountActionModel>(request.RequestDetail);
                    var acc = await _context.Accounts.FindAsync(accData.AccountId);
                    if (acc != null && acc.Status == "Locked")
                    {
                        acc.Status = "Active";
                        request.Status = "Approved";
                    }
                    else request.Status = "Rejected";
                    break;

                case RequestTypeEnum.CloseAccount:
                    var accClose = JsonSerializer.Deserialize<AccountActionModel>(request.RequestDetail);
                    var closeAcc = await _context.Accounts.FindAsync(accClose.AccountId);

                    if (closeAcc != null && closeAcc.Status == "Active")
                    {
                       
                        if (closeAcc.CardType == "Credit")
                        {
                            var creditLimit = 10_000_000; 
                            var currentDebt = creditLimit - closeAcc.Balance;

                            if (currentDebt > 0)
                            {
                                request.Status = "Rejected"; 
                                break;
                            }
                        }
                        else
                        {
                            
                            if (closeAcc.Balance > 0)
                            {
                                request.Status = "Rejected";
                                break;
                            }
                        }

                        closeAcc.Status = "Closed";
                        request.Status = "Approved";
                    }
                    else
                    {
                        request.Status = "Rejected";
                    }
                break;



                case RequestTypeEnum.LockAccount:
                    var accLock = JsonSerializer.Deserialize<AccountActionModel>(request.RequestDetail);
                    var lockAcc = await _context.Accounts.FindAsync(accLock.AccountId);
                    if (lockAcc != null && lockAcc.Status == "Active")
                    {
                        lockAcc.Status = "Locked";
                        request.Status = "Approved";
                    }
                    else request.Status = "Rejected";
                    break;

                case RequestTypeEnum.UpdateInfo:
                     var info = JsonSerializer.Deserialize<UpdateInfoModel>(request.RequestDetail);
                    var customer = await _context.Customers.FindAsync(request.CustomerId);
                    if (customer != null)
                    {
                        if (!string.IsNullOrEmpty(info.FullName))
                            customer.full_name = info.FullName;
                        if (!string.IsNullOrEmpty(info.Email))
                            customer.email = info.Email;
                        if (!string.IsNullOrEmpty(info.Mobile))
                            customer.mobile = info.Mobile;

                        request.Status = "Approved";
                    }
                    else request.Status = "Rejected";
                break;
                case RequestTypeEnum.DeleteCard:
                    var deleteData = JsonSerializer.Deserialize<AccountActionModel>(request.RequestDetail);
                    var deleteAcc = await _context.Accounts.FindAsync(deleteData.AccountId);
                    if (deleteAcc != null && deleteAcc.Status == "Closed")
                    {
                        _context.Accounts.Remove(deleteAcc);
                        request.Status = "Approved";
                    }
                    else
                    {
                        request.Status = "Rejected";
                    }
                break;


                default:
                    request.Status = "Rejected";
                    break;
            }
        }
        catch
        {
            request.Status = "Rejected";
        }

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Đã xử lý yêu cầu.",
            Data = new
            {
                request.RequestId,
                request.RequestType,
                request.RequestDate,
                request.Status,
                request.Reason
            }
        });
    }

    [Authorize]
    [HttpPost("reject-request/{requestId}")]
    public async Task<IActionResult> RejectRequest(int requestId)
    {
        var request = await _context.Service_requests.FindAsync(requestId);
        if (request == null || request.Status != "Pending")
            return BadRequest(new ApiError { Status = 400, Error = "InvalidRequest", Message = "Không hợp lệ hoặc đã xử lý." });

        request.Status = "Rejected";
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Đã từ chối yêu cầu.",
            Data = new
            {
                request.RequestId,
                request.RequestType,
                request.RequestDate,
                request.Status,
                request.Reason
            }
        });
    }

    
}
