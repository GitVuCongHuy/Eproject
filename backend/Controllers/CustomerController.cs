using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.ViewModel;
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



    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(model.FullName)
            || string.IsNullOrWhiteSpace(model.Mobile)
            || string.IsNullOrWhiteSpace(model.Email)
            || string.IsNullOrWhiteSpace(model.Username)
            || string.IsNullOrWhiteSpace(model.Password)
            || string.IsNullOrWhiteSpace(model.CitizenIdentificationCard))
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Missing_data",
                    Message = "Thiếu dữ liệu truyền vào"
                });
            }

            if (model.CitizenIdentificationCard.Length != 12)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Invalid_Citizen_Identification_Card",
                    Message = "Căn cước công dân phải có 12 ký tự."
                });
            }

            // Check username
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

            // Check CMND/CCCD trùng
            var existCccd = await _context.Customers
                .FirstOrDefaultAsync(x => x.citizen_identification_card == model.CitizenIdentificationCard);
            if (existCccd != null)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "CIC_Exists",
                    Message = "Căn cước công dân đã được đăng ký."
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
                citizen_identification_card = model.CitizenIdentificationCard,
                // adress = model.Adress,
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Đăng ký thành công",
            });
        }
        catch (Exception ex)
        {
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

            if (existUser.locked == true)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Account lock",
                    Message = "Tài khoản này đã bị khóa , vui lòng ra ngân hàng gần nhất để mở"
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
                    existUser.number_login = 0;
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




            if (existUser.device != viewModel.deviceId || existUser.device == null)
            {
                string code = _emailHelper.GenerateRandomCode(6);
                existUser.authentication_code = code;
                await _context.SaveChangesAsync();
                await Verify_Code(code, existUser.email);

                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "New equipment",
                    Message = "Thiết bị mới đăng nhập , vùi lòng xác minh mã code"
                });
            }




            if (existUser.number_login != 0)
            {
                existUser.number_login = 0;
                await _context.SaveChangesAsync();
            }

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





            existUser.device = viewModel.deviceId;
            await _context.SaveChangesAsync();





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


            if (existUser.number_login != 0)
            {
                existUser.number_login = 0;
                await _context.SaveChangesAsync();
            }
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


    [HttpPost("resend_code")]
    public async Task<IActionResult> ResendCode([FromBody] ResendCodeViewModel model)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(model.Username))
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Missing_data",
                    Message = "Thiếu tên đăng nhập"
                });
            }

            var customer = await _context.Customers.FirstOrDefaultAsync(x => x.username == model.Username);
            if (customer == null)
            {
                return BadRequest(new ApiError
                {
                    Status = 404,
                    Error = "User_Not_Found",
                    Message = "Không tìm thấy người dùng"
                });
            }

            if (customer.locked)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Account_Locked",
                    Message = "Tài khoản đã bị khóa"
                });
            }

            string code = _emailHelper.GenerateRandomCode(6);
            customer.authentication_code = code;
            await _context.SaveChangesAsync();

            await Verify_Code(code, customer.email);

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Đã gửi lại mã xác thực thành công",
                Data = new { customer.username }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }



    [HttpPost("create_transaction_password")]
    public async Task<IActionResult> CreateTransactionPassword([FromBody] Transaction_passwordsView model)
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


            var existUser = await _context.Customers.FindAsync(int.Parse(customerId));

            if (existUser == null)
            {
                return BadRequest(new ApiError
                {
                    Status = 404,
                    Error = "User_Not_Found",
                    Message = "Không tìm thấy người dùng"
                });
            }

            existUser.TransactionPassword = BCrypt.Net.BCrypt.HashPassword(model.TransactionPassword.ToString());
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "cập nhật mật khẩu giao dịch thành công",
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }

    [HttpPost("check_transaction_password")]
    public async Task<IActionResult> CheckTransactionPassword([FromBody] Transaction_passwordsView model)
    {
        try
        {

            if (model.TransactionPassword == null || string.IsNullOrWhiteSpace(model.TransactionPassword.ToString()))
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Empty_Transaction_Password",
                    Message = "Vui lòng nhập mật khẩu giao dịch"
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

            if (customerId == null)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Token Expired",
                    Message = "Phiên đăng nhập đã hết hạn , vui lòng đăng nhập lại"
                });
            }


            var existUser = await _context.Customers.FirstOrDefaultAsync(x => x.customer_id == int.Parse(customerId));
            if (existUser == null)
            {
                return BadRequest(new ApiError
                {
                    Status = 404,
                    Error = "User_Not_Found",
                    Message = "Không tìm thấy người dùng"
                });
            }

            if (existUser.TransactionPassword == null)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Transaction_Password_Not_Set",
                    Message = "Mật khẩu giao dịch chưa được thiết lập"
                });
            }

            bool is_TransactionPassword = BCrypt.Net.BCrypt.Verify(model.TransactionPassword.ToString(), existUser.TransactionPassword);
            if (!is_TransactionPassword)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Invalid_Transaction_Password",
                    Message = "Mật khẩu giao dịch không chính xác"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Mật khẩu giao dịch hợp lệ",
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }


    /// <summary>
    /// lấy tài khoản theo id 
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpGet("get-by-id/{id}")]
    public async Task<IActionResult> GetCustomerById(int id)
    {
        try
        {
            var customer = await _context.Customers
                .Where(c => c.customer_id == id)
                .Select(c => new
                {
                    c.customer_id,
                    c.username,
                    c.full_name,
                    c.email,
                    c.mobile,
                    c.locked,
                    c.number_login,
                    c.citizen_identification_card,
                    c.device,
                    c.TransactionPassword
                })
                .FirstOrDefaultAsync();

            if (customer == null)
            {
                return NotFound(new ApiError
                {
                    Status = 404,
                    Error = "Not_Found",
                    Message = "Không tìm thấy khách hàng"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Lấy thông tin khách hàng thành công",
                Data = customer
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }



    [HttpGet("filter-customers")]
    public async Task<IActionResult> FilterCustomers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? fullName = null,
        [FromQuery] string? email = null,
        [FromQuery] string? citizenId = null,
        [FromQuery] bool? lockedOnly = null)
    {
        try
        {
            if (page < 1) page = 1;

            // Tạo truy vấn cơ bản
            var query = _context.Customers.AsQueryable();

            // Lọc theo họ tên (nếu có)
            if (!string.IsNullOrWhiteSpace(fullName))
            {
                query = query.Where(c => c.full_name.Contains(fullName));
            }

            // Lọc theo email (nếu có)
            if (!string.IsNullOrWhiteSpace(email))
            {
                query = query.Where(c => c.email.Contains(email));
            }

            // Lọc theo căn cước (nếu có)
            if (!string.IsNullOrWhiteSpace(citizenId))
            {
                query = query.Where(c => c.citizen_identification_card.Contains(citizenId));
            }

            // Lọc tài khoản bị khóa (nếu có)
            if (lockedOnly.HasValue && lockedOnly.Value)
            {
                query = query.Where(c => c.locked == true);
            }

            var totalCustomers = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCustomers / (double)pageSize);

            var customers = await query
                .OrderBy(c => c.customer_id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new
                {
                    c.customer_id,
                    c.username,
                    c.full_name,
                    c.email,
                    c.mobile,
                    c.locked,
                    c.number_login,
                    c.citizen_identification_card,
                    c.device,
                    c.TransactionPassword
                })
                .ToListAsync();

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Lọc và phân trang khách hàng thành công",
                Data = new
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages,
                    TotalCustomers = totalCustomers,
                    Customers = customers
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }




    /// <summary>
    /// Khóa tài khoản
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpPut("lock/{id}")]
    public async Task<IActionResult> LockAccount(int id)
    {
        try
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound(new ApiError
                {
                    Status = 404,
                    Error = "User_Not_Found",
                    Message = "Không tìm thấy tài khoản"
                });
            }

            if (customer.locked)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Already_Locked",
                    Message = "Tài khoản đã bị khóa trước đó"
                });
            }

            customer.locked = true;
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Khóa tài khoản thành công"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }



    /// <summary>
    /// Mở khóa tài khoản 
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    [HttpPut("unlock/{id}")]
    public async Task<IActionResult> UnlockAccount(int id)
    {
        try
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound(new ApiError
                {
                    Status = 404,
                    Error = "User_Not_Found",
                    Message = "Không tìm thấy tài khoản"
                });
            }

            if (!customer.locked)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Already_Unlocked",
                    Message = "Tài khoản đang ở trạng thái mở"
                });
            }

            customer.locked = false;
            customer.number_login = 0; // reset lại số lần nhập sai
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Mở khóa tài khoản thành công"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }


    [HttpPut("update-cccd/{id}")]
    public async Task<IActionResult> UpdateCitizenId(int id, [FromBody] UpdateCccdViewModel model)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(model.NewCccd))
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Missing_Data",
                    Message = "Vui lòng nhập căn cước công dân mới"
                });
            }

            if (model.NewCccd.Length != 12)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "Invalid_CCCD_Length",
                    Message = "Căn cước công dân phải có đúng 12 ký tự"
                });
            }

            // Kiểm tra trùng CCCD
            var isExist = await _context.Customers
                .AnyAsync(c => c.citizen_identification_card == model.NewCccd && c.customer_id != id);

            if (isExist)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "CCCD_Already_Used",
                    Message = "Căn cước công dân này đã được sử dụng cho tài khoản khác"
                });
            }

            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound(new ApiError
                {
                    Status = 404,
                    Error = "User_Not_Found",
                    Message = "Không tìm thấy tài khoản để cập nhật"
                });
            }

            customer.citizen_identification_card = model.NewCccd;
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Status = 200,
                Message = "Cập nhật căn cước công dân thành công"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }






}