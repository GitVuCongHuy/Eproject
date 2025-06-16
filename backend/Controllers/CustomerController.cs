using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;



[ApiController]
[Route("backend/[controller]")]
public class CustomerController : Controller
{
    private readonly ApplicationDbContext _context;  //khai báo  controller 

    private readonly IConfiguration _configuration;

    public CustomerController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }


    // public CustomerController(ApplicationDbContext context)
    // {
    //     _context = context;
    // }

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
                number_login = 0,
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



    [HttpPost("login")]
    public async Task<IActionResult> Log_in([FromBody] LoginViewModel viewModel)
    {

        try
        {
            if (string.IsNullOrWhiteSpace(viewModel.Username)
            || string.IsNullOrWhiteSpace(viewModel.Password))
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Missing_data",
                    Message = "Thiếu dữ liệu truyền vào"
                });
            }


            var existUser = await _context.Customers.FirstOrDefaultAsync(x => x.username == viewModel.Username);
            if (existUser == null)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Account does not exist",
                    Message = "Tài khoản này không tồn tại"
                });
            }



            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(viewModel.Password, existUser.password);
            if (!isPasswordValid)
            {



                if (existUser.locked == true)
                {
                    return BadRequest(new ApiError
                    {
                        Status = 400,
                        Error = "Account lock",
                        Message = "Tài khoản này đã bị khóa , vui lòng ra ngân hàng gần nhất để mở"
                    });
                }


                if (existUser.number_login >= 3)
                {
                    existUser.locked = true;
                    await _context.SaveChangesAsync();
                    return BadRequest(new ApiError
                    {
                        Status = 400,
                        Error = "Account lock",
                        Message = "Tài khoản này đã bị khóa , vui lòng ra ngân hàng gần nhất để mở"
                    });
                }
                else
                {
                    existUser.number_login += 1;
                    await _context.SaveChangesAsync();
                }


                return Unauthorized(new ApiError
                {
                    Status = 401,
                    Error = "Unauthorized",
                    Message = "Mật khẩu không chính xác nếu nhập quá 3 lần sẽ bị khóa"
                });
            }


            //tạo token trả về 
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, existUser.customer_id.ToString()),
            };

        


            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(5), // ✅ UtcNow
                signingCredentials: creds
            );

   
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Log in successfully",
                Data = new { Token = tokenString }  // ✅ trả token dạng string
            });


        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }

    }
    
    
}