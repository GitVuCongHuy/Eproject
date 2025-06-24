using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace YourNamespace.Controllers
{
    [ApiController]
    [Route("backend/[controller]")]
    public class UserInfoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserInfoController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCustomerIdFromToken()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;
            var customerIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(customerIdClaim?.Value, out var id) ? id : 0;
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUserInfo()
        {
            try
            {
                var customerId = GetCustomerIdFromToken();
                if (customerId == 0)
                {
                    return Unauthorized(new ApiError
                    {
                        Status = 401,
                        Error = "InvalidToken",
                        Message = "Token không hợp lệ hoặc đã hết hạn."
                    });
                }

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
                {
                    return NotFound(new ApiError
                    {
                        Status = 404,
                        Error = "UserNotFound",
                        Message = "Không tìm thấy người dùng."
                    });
                }

                return Ok(new ApiResponse<object>
                {
                    Status = 200,
                    Message = "Lấy thông tin thành công.",
                    Data = customer
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
}
