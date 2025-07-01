using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.ViewModel;
using backend.Enums;

namespace YourNamespace.Controllers
{
    [Authorize]
    [ApiController]
    [Route("backend/[controller]")]
    public class UserInfoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly EmailHelper _emailHelper;

        public UserInfoController(ApplicationDbContext context, EmailHelper emailHelper)
        {
            _context = context;
            _emailHelper = emailHelper;
        }

        private int GetCustomerIdFromToken()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;
            var customerIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(customerIdClaim?.Value, out var id) ? id : 0;
        }

        // ✅ API 1: Lấy thông tin người dùng hiện tại
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUserInfo()
        {
            var customerId = GetCustomerIdFromToken();
            if (customerId == 0)
                return Unauthorized(new ApiError { Status = 401, Error = "InvalidToken", Message = "Token không hợp lệ hoặc đã hết hạn." });

            var customer = await _context.Customers
                .Where(c => c.customer_id == customerId)
                .Select(c => new
                {
                    c.username,
                    c.full_name,
                    c.email,
                    c.mobile,
                    c.locked,
                    c.citizen_identification_card
                })
                .FirstOrDefaultAsync();

            if (customer == null)
                return NotFound(new ApiError { Status = 404, Error = "UserNotFound", Message = "Không tìm thấy người dùng." });

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Lấy thông tin thành công.",
                Data = customer
            });
        }

        // ✅ API 2: Đổi mật khẩu đăng nhập
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
        {
            var customerId = GetCustomerIdFromToken();
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.customer_id == customerId);
            if (customer == null)
                return NotFound(new ApiError { Status = 404, Error = "UserNotFound", Message = "Không tìm thấy người dùng." });

            if (customer.password != model.CurrentPassword)
                return BadRequest(new ApiError { Status = 400, Error = "InvalidPassword", Message = "Mật khẩu hiện tại không đúng." });

            if (string.IsNullOrWhiteSpace(model.NewPassword) || model.NewPassword.Length < 6)
                return BadRequest(new ApiError { Status = 400, Error = "WeakPassword", Message = "Mật khẩu mới phải có ít nhất 6 ký tự." });

            customer.password = model.NewPassword;
            await _context.SaveChangesAsync();

            await _emailHelper.SendEmailAsync(customer.email, "Đổi mật khẩu thành công",
                $"Xin chào {customer.full_name},\n\nMật khẩu đăng nhập của bạn đã được thay đổi thành công vào lúc {DateTime.Now:dd/MM/yyyy HH:mm}.",
                false);

            return Ok(new ApiResponse<string>
            {
                Status = 200,
                Message = "Đổi mật khẩu thành công.",
                Data = "Mật khẩu đã được cập nhật và email xác nhận đã được gửi."
            });
        }

        // ✅ API 3: Đổi mật khẩu giao dịch
        [HttpPost("change-transaction-password")]
        public async Task<IActionResult> ChangeTransactionPassword([FromBody] ChangeTransactionPasswordModel model)
        {
            var customerId = GetCustomerIdFromToken();
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.customer_id == customerId);
            if (customer == null)
                return NotFound(new ApiError { Status = 404, Error = "UserNotFound", Message = "Không tìm thấy người dùng." });

            if (customer.TransactionPassword != model.CurrentTransactionPassword)
                return BadRequest(new ApiError { Status = 400, Error = "InvalidTransactionPassword", Message = "Mật khẩu giao dịch hiện tại không đúng." });

            if (string.IsNullOrWhiteSpace(model.NewTransactionPassword) || model.NewTransactionPassword.Length < 6)
                return BadRequest(new ApiError { Status = 400, Error = "WeakTransactionPassword", Message = "Mật khẩu giao dịch mới phải có ít nhất 6 ký tự." });

            customer.TransactionPassword = model.NewTransactionPassword;
            await _context.SaveChangesAsync();

            await _emailHelper.SendEmailAsync(customer.email, "Đổi mật khẩu giao dịch thành công",
                $"Xin chào {customer.full_name},\n\nMật khẩu giao dịch của bạn đã được thay đổi thành công vào lúc {DateTime.Now:dd/MM/yyyy HH:mm}.",
                false);

            return Ok(new ApiResponse<string>
            {
                Status = 200,
                Message = "Đổi mật khẩu giao dịch thành công.",
                Data = "Mật khẩu giao dịch đã được cập nhật và email xác nhận đã được gửi."
            });
        }
    }
}
