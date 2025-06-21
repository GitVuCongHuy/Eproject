using System.Net.WebSockets;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("backend/[controller]")]
public class Transaction_passwordsController : Controller
{
    private readonly ApplicationDbContext _context;  //khai báo  controller 
    private readonly JwtTokenHelper _jwtTokenHelper;
    private readonly EmailHelper _emailHelper;
    private readonly IConfiguration _configuration;

    public Transaction_passwordsController(ApplicationDbContext context, IConfiguration configuration, JwtTokenHelper jwtTokenHelper, EmailHelper emailHelper)
    {
        _context = context;
        _configuration = configuration;
        _jwtTokenHelper = jwtTokenHelper;
        _emailHelper = emailHelper;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create_Transaction_passwords([FromBody] Transaction_passwordsView view)
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

            if (customerId == null)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Token Expired",
                    Message = "Phiên đăng nhập đã hết hạn , vui lòng đăng nhập lại"
                });
            }
            int customerId2 = int.Parse(customerId);
            
            var TransactionPassword_ = await _context.transaction_Passwords.FirstOrDefaultAsync(x => x.CustomerId == customerId2);
            if (TransactionPassword_ == null)
            {
                var TransactionPassword_new = new Transaction_passwords
                {
                    CustomerId = customerId2,
                    TransactionPassword = view.TransactionPassword,
                };
                _context.transaction_Passwords.Add(TransactionPassword_new);
                await _context.SaveChangesAsync();
            }
            else
            {
                TransactionPassword_.TransactionPassword = view.TransactionPassword;
                await _context.SaveChangesAsync();
            }


            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Log in successfully",
                Data = new { Customer_id = customerId }  // ✅ trả token dạng string
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }




    [HttpPost("check")]
    public async Task<IActionResult> Check_Transaction_passwords([FromBody] Transaction_passwordsView view)
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
            int customerId2 = int.Parse(customerId);


            var TransactionPassword_ = await _context.transaction_Passwords.FirstOrDefaultAsync(x => x.CustomerId == customerId2);
            





        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }

    }
}