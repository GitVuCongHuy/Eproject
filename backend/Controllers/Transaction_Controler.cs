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


    [HttpPost("Bank_transfer")]
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
                List<string> accountIds = await _context.Accounts
                        .Where(x => x.customer_id == int.Parse(customerId))
                        .Select(x => x.CardNumber)
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
                string receiving_accountid = await _context.Accounts
                    .Where(x => x.CardNumber == view.ReceiverAccount)
                    .Select(x => x.CardNumber)
                    .FirstOrDefaultAsync();

                if (string.IsNullOrEmpty(receiving_accountid))
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
                    .Where(x => x.CardNumber == view.SenderAccount)
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
                    .Where(x => x.CardNumber == view.ReceiverAccount)
                    .FirstOrDefaultAsync();

                ///tiến hành chuyển khoản
                senderAccount.Balance -= view.Amount;
                receiverAccount.Balance += view.Amount;
                _context.Accounts.Update(senderAccount);
                _context.Accounts.Update(receiverAccount);


                await _context.SaveChangesAsync();




                var transaction_new = new Bank_Transaction
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
                _context.bank_Transaction.Add(transaction_new);
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

    [HttpPost("Send_OTP")]
    public async Task<IActionResult> Send_OTP()
    {
        try
        {
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

            // Generate OTP
            string otpCode = new Random().Next(100000, 999999).ToString();

            var authentication_code = await _context.Customers
                .Where(c => c.customer_id == int.Parse(customerId))
                .Select(c => c.authentication_code)
                .FirstOrDefaultAsync();

            authentication_code = otpCode;
            await _context.SaveChangesAsync();



            // Send OTP via email
            var customerEmail = await _context.Customers
                .Where(c => c.customer_id == int.Parse(customerId))
                .Select(c => c.email)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(customerEmail))
            {
                return NotFound(new ApiError
                {
                    Status = 404,
                    Error = "UserNotFound",
                    Message = "Không tìm thấy người dùng."
                });
            }

            await _emailHelper.SendEmailAsync(customerEmail, "Your OTP Code", $"Your OTP code is: {otpCode}");

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "OTP đã được gửi thành công."
            });


        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiError
            {
                Status = 500,
                Error = "ServerError",
                Message = ex.Message
            });
        }
    }



    [HttpPost("Verify_OTP")]
    public async Task<IActionResult> Verify_OTP([FromBody] Otp_Wiew view)
    {
        try
        {
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

            var customer = await _context.Customers
                .Where(c => c.customer_id == int.Parse(customerId))
                .FirstOrDefaultAsync();

            if (customer == null)
            {
                return NotFound(new ApiError
                {
                    Status = 404,
                    Error = "UserNotFound",
                    Message = "Không tìm thấy người dùng."
                });
            }

            if (customer.authentication_code != view.Otp)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Invalid OTP",
                    Message = "Mã OTP không hợp lệ."
                });
            }

            // Xóa mã OTP sau khi xác thực thành công
            customer.authentication_code = null;
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "OTP xác thực thành công."
            });

        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiError
            {
                Status = 500,
                Error = "ServerError",
                Message = ex.Message
            });
        }
    }
   

}