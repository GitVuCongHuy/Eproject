using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage; // Thêm thư viện này cho IDbContextTransaction
using System.Security.Claims;
using System.Text.Json;
// using backend.Enums; // Dòng này có thể không cần nếu bạn không dùng Enum

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
        // <<< SỬA ĐỔI 1: Bọc toàn bộ logic trong một DB Transaction >>>
        using (var dbTransaction = await _context.Database.BeginTransactionAsync())
        {
            try
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

                // Thao tác 1: Trừ tiền
                account.Balance -= fee;

                // Thao tác 2: Tạo yêu cầu dịch vụ
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

                // <<< THÊM MỚI: Thao tác 3: Ghi lại giao dịch trừ phí vào bảng bank_Transaction >>>
                var feeTransaction = new Bank_Transaction
                {
                    SenderAccount = account.CardNumber, // Số thẻ của người dùng bị trừ
                    ReceiverAccount = "EBanking Service", // Tên định danh cho dịch vụ
                    amount = fee,
                    description = $"Phí yêu cầu sổ séc ({model.Quantity} tờ)",
                    transactionDate = DateTime.Now,
                    transaction_status = "Success"
                };
                _context.bank_Transaction.Add(feeTransaction);

                // Lưu tất cả thay đổi
                await _context.SaveChangesAsync();
                
                // Hoàn tất transaction
                await dbTransaction.CommitAsync();

                return Ok(new ApiResponse<object>
                {
                    Status = 200,
                    Message = "Đã gửi yêu cầu cấp sổ séc và ghi nhận giao dịch.",
                    Data = new
                    {
                        request.RequestId,
                        request.RequestType,
                        request.RequestDate,
                        request.Status,
                    }
                });
            }
            catch (Exception ex)
            {
                // Nếu có lỗi, rollback tất cả
                await dbTransaction.RollbackAsync();
                // Log lỗi ra console hoặc hệ thống log của bạn
                Console.WriteLine($"ERROR in RequestChequeBook: {ex.Message}");
                return StatusCode(500, new ApiError { Status = 500, Error = "InternalServerError", Message = "Đã có lỗi xảy ra trong quá trình xử lý yêu cầu."});
            }
        }
    }

    [Authorize]
    [HttpGet("my-cheque-requests")]
    public async Task<IActionResult> GetMyChequeRequests()
    {
        // ... (API này không cần thay đổi)
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
                r.Reason,
                RequestDetail = r.RequestDetail
            })
        });
    }

    [Authorize]
    [HttpPost("cancel-cheque-request/{requestId}")]
    public async Task<IActionResult> CancelChequeRequest(int requestId)
    {
        // <<< SỬA ĐỔI 2: Bọc toàn bộ logic trong một DB Transaction >>>
        using (var dbTransaction = await _context.Database.BeginTransactionAsync())
        {
            try
            {
                var customerId = GetCustomerIdFromToken();
                var request = await _context.Service_requests
                    .FirstOrDefaultAsync(r => r.RequestId == requestId && r.CustomerId == customerId && r.RequestType == "IssueChequeBook");

                if (request == null || request.Status != "Pending")
                    return BadRequest(new ApiError { Status = 400, Error = "InvalidRequest", Message = "Không thể huỷ yêu cầu này." });

                var requestDetail = JsonSerializer.Deserialize<ChequeBookRequestModel>(request.RequestDetail);
                if (requestDetail == null)
                    return StatusCode(500, new ApiError { Status = 500, Error = "InternalError", Message = "Lỗi xử lý chi tiết yêu cầu." });

                var account = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == requestDetail.AccountId && a.customer_id == customerId);
                if (account == null)
                    return NotFound(new ApiError { Status = 404, Error = "AccountNotFound", Message = "Không tìm thấy tài khoản." });

                decimal initialFee = requestDetail.Quantity == 25 ? 25000m : 40000m;
                decimal cancelFee = 5000m;

                if (account.Balance < cancelFee)
                    return BadRequest(new ApiError { Status = 400, Error = "InsufficientFunds", Message = "Không đủ số dư để trả phí huỷ yêu cầu." });

                // Thao tác 1: Cập nhật số dư
                account.Balance += initialFee;
                account.Balance -= cancelFee;

                // Thao tác 2: Cập nhật trạng thái yêu cầu
                request.Status = "Cancelled by user";
                
                // <<< THÊM MỚI: Thao tác 3 & 4: Ghi lại 2 giao dịch mới >>>

                // Giao dịch hoàn lại phí
                var refundTransaction = new Bank_Transaction
                {
                    SenderAccount = "EBanking Service",
                    ReceiverAccount = account.CardNumber,
                    amount = initialFee,
                    description = "Hoàn phí yêu cầu sổ séc đã hủy",
                    transactionDate = DateTime.Now,
                    transaction_status = "Success"
                };
                _context.bank_Transaction.Add(refundTransaction);

                // Giao dịch trừ phí hủy
                var cancelFeeTransaction = new Bank_Transaction
                {
                    SenderAccount = account.CardNumber,
                    ReceiverAccount = "EBanking Service",
                    amount = cancelFee,
                    description = "Phí hủy yêu cầu sổ séc",
                    transactionDate = DateTime.Now.AddSeconds(1), // Thêm 1s để tránh trùng timestamp
                    transaction_status = "Success"
                };
                _context.bank_Transaction.Add(cancelFeeTransaction);

                // Lưu tất cả thay đổi
                await _context.SaveChangesAsync();
                
                // Hoàn tất transaction
                await dbTransaction.CommitAsync();

                return Ok(new ApiResponse<object>
                {
                    Status = 200,
                    Message = $"Đã huỷ yêu cầu thành công. Phí yêu cầu ({initialFee:N0}đ) đã được hoàn lại. Phí huỷ ({cancelFee:N0}đ) đã được trừ.",
                    Data = new { request.RequestId }
                });
            }
            catch(Exception ex)
            {
                await dbTransaction.RollbackAsync();
                Console.WriteLine($"ERROR in CancelChequeRequest: {ex.Message}");
                return StatusCode(500, new ApiError { Status = 500, Error = "InternalServerError", Message = "Đã có lỗi xảy ra trong quá trình hủy yêu cầu."});
            }
        }
    }
}