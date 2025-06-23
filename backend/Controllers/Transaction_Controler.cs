using System.Security.Claims;
using backend.ViewModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

            List<int> accountIds = await _context.Accounts
                    .Where(x => x.customer_id == int.Parse(customerId))
                    .Select(x => x.account_id)
                    .ToListAsync();
            if (!accountIds.Contains(view.SenderAccount))
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Invalid sender account",
                    Message = "Tài khoản gửi không hợp lệ"
                });
            }


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


            // if (view.Amount <= 0)
            // {
            //     return BadRequest(new ApiError
            //     {
            //         Status = 400,
            //         Error = "Invalid transfer amount",
            //         Message = "Số tiền chuyển khoản không hợp lệ"
            //     });
            // }


            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Mã chuyển khoản đúng ",
                // ✅ trả token dạng string
            });




            // Continue with the transfer logic
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }




}