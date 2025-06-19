using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualBasic;



[ApiController]
[Route("backend/[controller]")]
public class CustomerController : Controller
{
    private readonly ApplicationDbContext _context;  //khai báo  controller 
    private readonly JwtTokenHelper _jwtTokenHelper;
    private readonly EmailHelper _emailHelper;


    private readonly IConfiguration _configuration;



    public CustomerController(ApplicationDbContext context, IConfiguration configuration, JwtTokenHelper jwtTokenHelper, EmailHelper emailHelper)
    {
        _context = context;
        _configuration = configuration;
        _jwtTokenHelper = jwtTokenHelper;
        _emailHelper = emailHelper;
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
                bank_id = 1,

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
            || string.IsNullOrWhiteSpace(viewModel.Password)
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
                    Error = "Wrong password",
                    Message = "Mật khẩu không chính xác nếu nhập quá 3 lần sẽ bị khóa"
                });
            }


            //Kra có phải thiết bị mới không 
            var new_device = await _context.Login_Attempts.FirstOrDefaultAsync(x => x.customer_id == existUser.customer_id);
            if (new_device == null)
            {

                string code = _emailHelper.GenerateRandomCode(6);
                existUser.authentication_code = code;
                await _context.SaveChangesAsync();
                await Verify_Code(code,existUser.email);

                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "New equipment",
                    Message = "Thiết bị mới đăng nhập , vùi lòng xác minh mã code"
                });


            }

            if (new_device.device != viewModel.deviceId)
            {
                string code = _emailHelper.GenerateRandomCode(6);
                existUser.authentication_code = code;
                await _context.SaveChangesAsync();


                await  Verify_Code(code,existUser.email);

                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "New equipment",
                    Message = "Thiết bị mới đăng nhập , vùi lòng xác minh mã code"
                });

            }
            ;





            //Tạo Token
            var tokenString = _jwtTokenHelper.GenerateToken(existUser.customer_id);

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


    [HttpPost("login_verify")]
    public async Task<IActionResult> LogInVerifyCode([FromBody] LoginVerifyModel viewModel) 
    {
        try
        {
            if (string.IsNullOrWhiteSpace(viewModel.Username)
            || string.IsNullOrWhiteSpace(viewModel.Code)
            || string.IsNullOrWhiteSpace(viewModel.deviceId))
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


            if (existUser.locked == true)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Account lock",
                    Message = "Tài khoản này đã bị khóa , vui lòng ra ngân hàng gần nhất để mở"
                });
            }


            if (existUser.authentication_code != viewModel.Code)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Authentication code is wrong",
                    Message = "Mã xác thực này sai , vui lòng thử lại.."
                });
            }


            
            var Login_attempts_Search =   await _context.Login_Attempts.FirstOrDefaultAsync(x => x.customer_id == existUser.customer_id);
            if (Login_attempts_Search != null)
            {
                Login_attempts_Search.device = viewModel.deviceId;
                await _context.SaveChangesAsync();
            }
            else
            {

                var Login_Attempts = new Login_attempts
                {
                    device = viewModel.deviceId,
                    success = false,
                    customer_id = existUser.customer_id

                };
                _context.Login_Attempts.Add(Login_Attempts);
                await _context.SaveChangesAsync();
            }






            string subject = "Phát hiện thiết bị mới đăng nhập";

            string timeDetected = DateTime.Now.ToString("HH:mm:ss dd/MM/yyyy");

            string body = $@"
            Chào bạn,

            Chúng tôi phát hiện một lần đăng nhập từ một thiết bị lạ vào tài khoản của bạn.

            🕒 Thời gian phát hiện: {timeDetected}

            Nếu bạn không thực hiện hành động này, hãy thay đổi mật khẩu ngay và liên hệ với chúng tôi để được hỗ trợ.

            Trân trọng,  
            Đội ngũ hỗ trợ khách hàng
            ";


            await _emailHelper.SendEmailAsync(existUser.email, subject, body, false);

              //Tạo Token
            var tokenString = _jwtTokenHelper.GenerateToken(existUser.customer_id);

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
    

    public async Task Verify_Code(string Code, string toEmail)
    {
        // string Code = _emailHelper.GenerateRandomCode(6);
        string subject = "Xác thực thiết bị đăng nhập mới";

        string body = $@"
        Chào bạn,

        Chúng tôi phát hiện một lần đăng nhập từ một thiết bị lạ vào tài khoản của bạn.  
        Để đảm bảo an toàn, vui lòng sử dụng mã xác thực dưới đây để xác nhận bạn là người thực hiện hành động này:

        🔐 **Mã xác thực:** {Code}

        Vui lòng không chia sẻ mã này với bất kỳ ai. Mã có hiệu lực trong một khoảng thời gian ngắn.

        Nếu bạn không thực hiện yêu cầu này, hãy thay đổi mật khẩu ngay và liên hệ với chúng tôi để được hỗ trợ.

        Trân trọng,  
        Đội ngũ hỗ trợ khách hàng
        ";


        await _emailHelper.SendEmailAsync(toEmail, subject, body, false);

    }
    
   
}