using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using BCrypt.Net;

[ApiController]
[Route("backend/[controller]")]
public class Admin_CustomerController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public Admin_CustomerController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AdminRegisterViewModel viewModel)
    {
        var existingUser = await _context.Admin_Customers
            .FirstOrDefaultAsync(x => x.username == viewModel.Username);

        if (existingUser != null)
            return BadRequest("Tài khoản đã tồn tại.");

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(viewModel.Password);

        var newAdmin = new Admin_Customer
        {
            username = viewModel.Username,
            password = hashedPassword,
            full_name = viewModel.FullName,
            url_img = viewModel.UrlImg
        };

        _context.Admin_Customers.Add(newAdmin);
        await _context.SaveChangesAsync();

        return Ok("Đăng ký thành công.");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AdminLoginViewModel viewModel)
    {
        var existingUser = await _context.Admin_Customers
            .FirstOrDefaultAsync(x => x.username == viewModel.Username);

        if (existingUser == null)
            return Unauthorized("Sai tên đăng nhập hoặc mật khẩu.");

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(viewModel.Password, existingUser.password);

        if (!isPasswordValid)
            return Unauthorized("Sai tên đăng nhập hoặc mật khẩu.");

        return Ok(new
        {
            Message = "Đăng nhập thành công.",
            UserId = existingUser.admin_customer_id,
            FullName = existingUser.full_name,
            UrlImg = existingUser.url_img
        });
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] AdminChangePasswordViewModel viewModel)
    {
        var user = await _context.Admin_Customers.FindAsync(viewModel.AdminCustomerId);
        if (user == null)
            return NotFound("Không tìm thấy tài khoản.");

        if (!BCrypt.Net.BCrypt.Verify(viewModel.CurrentPassword, user.password))
            return BadRequest("Mật khẩu hiện tại không đúng.");

        user.password = BCrypt.Net.BCrypt.HashPassword(viewModel.NewPassword);
        await _context.SaveChangesAsync();

        return Ok("Đổi mật khẩu thành công.");
    }

    [HttpPut("update-info")]
    public async Task<IActionResult> UpdateInfo([FromBody] AdminUpdateInfoViewModel viewModel)
    {
        var user = await _context.Admin_Customers.FindAsync(viewModel.AdminCustomerId);
        if (user == null)
            return NotFound("Không tìm thấy tài khoản.");

        user.full_name = viewModel.FullName ?? user.full_name;
        user.url_img = viewModel.UrlImg ?? user.url_img;

        await _context.SaveChangesAsync();
        return Ok("Cập nhật thông tin thành công.");
    }
}
