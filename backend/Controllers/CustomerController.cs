using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;



[ApiController]
[Route("backend/[controller]")]
public class CustomerController : Controller
{
    private readonly ApplicationDbContext _context;  //khai báo  controller 

    public CustomerController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(model.FullName)
            || string.IsNullOrWhiteSpace(model.Mobile)
            || string.IsNullOrWhiteSpace(model.Email)
            || string.IsNullOrWhiteSpace(model.Username)
            || string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Missing_data",
                    Message = "Thiếu dữ liệu truyền vào"
                });
            }

            var existUser = await _context.Customers.FirstOrDefaultAsync(x => x.username == model.Username);
            if (existUser != null)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Username_Exists",
                    Message = "Tên đăng nhập đã tồn tại."
                });
            }

            var bank = await _context.Banks.FindAsync(1);
            if (bank == null)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Lack_of_Bankss",
                    Message = "Thiếu Ngân hàng"
                });
            }

            var customer = new Customer
            {
                username = model.Username,
                password = BCrypt.Net.BCrypt.HashPassword(model.Password),
                full_name = model.FullName,
                email = model.Email,
                mobile = model.Mobile,
                locked = false,
                bank_id = 1
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Đăng ký thành công",
                Data = new { customer.username, customer.customer_id }
            });
        }
        catch (Exception ex)
        {
            // Có thể log ex.Message vào file hoặc database
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }



    // public async Task<IActionResult> Log_in()
    // {
        
    // }
}