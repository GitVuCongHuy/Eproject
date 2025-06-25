using System.Security.Claims;
using backend.ViewModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

[ApiController]
[Route("backend/[controller]")]
public class Transaction_Controler : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly JwtTokenHelper _jwtTokenHelper;
    private readonly EmailHelper _emailHelper;
    private readonly IConfiguration _configuration;


    public Transaction_Controler(ApplicationDbContext context, IConfiguration configuration, JwtTokenHelper jwtTokenHelper, EmailHelper emailHelper)
    {
        _context = context;
        _configuration = configuration;
        _jwtTokenHelper = jwtTokenHelper;
        _emailHelper = emailHelper;
    }


    public async Task<IActionResult> Bank_transfer([FromBody] Transfer_View view)
    {
        using (IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync())
        {
            try
            {

                ///kiểm tra số tiền chuyển khoản có hợp lệ không 
                if (view.Amount <= 1000 || view.Amount > 50000000)
                {
                    return BadRequest(new ApiError
                    {
                        Status = 400,
                        Error = "Invalid transfer amount",
                        Message = "số tiền chuyển khoản không hợp lệ, phải lớn hơn 1000 và nhỏ hơn 50000000"
                    });
                }




                var token = _jwtTokenHelper.GetBearerToken(HttpContext);
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(new ApiError
                    {
                        Status = 400,
                        Error = "There are no tokens yet",
                        Message = "Chưa có token được truyền vào"
                    });
                }

                var principal = _jwtTokenHelper.DecodeToken(token);
                var customerId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(customerId))
                {
                    return BadRequest(new ApiError
                    {
                        Status = 400,
                        Error = "There are no customer IDs yet",
                        Message = "Chưa có customer ID được truyền vào"
                    });
                }



                ///Lấy danh sách tài khoản của khách hàng
                List<int> accountIds = await _context.Accounts
                        .Where(x => x.customer_id == int.Parse(customerId))
                        .Select(x => x.account_id)
                        .ToListAsync();

                ///kiểm tra xem tài khoản gửi có hợp lệ không
                if (!accountIds.Contains(view.SenderAccount))
                {
                    return BadRequest(new ApiError
                    {
                        Status = 400,
                        Error = "Invalid sender account",
                        Message = "Tài khoản gửi không hợp lệ"
                    });
                }


                ///kiểm tra xem tài khoản gửi có hợp lệ không
                int receiving_accountid = await _context.Accounts
                    .Where(x => x.account_id == view.ReceiverAccount)
                    .Select(x => x.account_id)
                    .FirstOrDefaultAsync();

                if (receiving_accountid == 0)
                {
                    return BadRequest(new ApiError
                    {
                        Status = 400,
                        Error = "Invalid receiver account",
                        Message = "Tài khoản nhận không hợp lệ"
                    });
                }

                ///kiểm tra xem mật khẩu giao dịch có hợp lệ không
                var customer = await _context.Customers
                    .Where(x => x.customer_id == int.Parse(customerId))
                    .FirstOrDefaultAsync();

                if (customer == null)
                {
                    return BadRequest(new ApiError
                    {
                        Status = 400,
                        Error = "Invalid transaction password",
                        Message = "Tài khoản không hợp lệ"
                    });
                }


                //Kieerm tra xem mật khẩu giao dịch có hợp lệ không
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(view.TransactionPassword.ToString(), customer.TransactionPassword);
                if (!isPasswordValid)
                {
                    return BadRequest(new ApiError
                    {
                        Status = 400,
                        Error = "Invalid transaction password",
                        Message = "Mật khẩu giao dịch không chính xác"
                    });
                }


                ///kiểm tra xem số dư có đủ để chuyển khoản không
                var senderAccount = await _context.Accounts
                    .Where(x => x.account_id == view.SenderAccount)
                    .FirstOrDefaultAsync();

                if (senderAccount == null || senderAccount.Balance < view.Amount)
                {
                    return BadRequest(new ApiError
                    {
                        Status = 400,
                        Error = "Insufficient balance",
                        Message = "Số dư không đủ để thực hiện giao dịch"
                    });
                }



                var receiverAccount = await _context.Accounts
                    .Where(x => x.account_id == view.ReceiverAccount)
                    .FirstOrDefaultAsync();

                ///tiến hành chuyển khoản
                senderAccount.Balance -= view.Amount;
                receiverAccount.Balance += view.Amount;
                _context.Accounts.Update(senderAccount);
                _context.Accounts.Update(receiverAccount);
                await _context.SaveChangesAsync();




                var transaction_new = new Transaction
                {
                    SenderAccount = view.SenderAccount,
                    ReceiverAccount = view.ReceiverAccount,
                    amount = view.Amount,
                    description = view.Description,
                    transactionDate = DateTime.Now,
                    transaction_status = "Success"
                    // id_banking_sender = senderAccount.account_id,
                    // id_banking_Receiver = receiverAccount.account_id
                };
                _context.Transaction.Add(transaction_new);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return Ok(new ApiResponse<object>
                {
                    Status = 200,
                    Message = "Chuyển khoản thành công",

                });


            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi server: {ex.Message}");
                
            }
        }
    }




}