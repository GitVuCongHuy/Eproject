// using System.Net.WebSockets;
// using System.Security.Claims;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// [ApiController]
// [Route("backend/[controller]")]
// public class Transaction_passwordsController : Controller
// {
//     private readonly ApplicationDbContext _context;  //khai báo  controller 
//     private readonly JwtTokenHelper _jwtTokenHelper;
//     private readonly EmailHelper _emailHelper;
//     private readonly IConfiguration _configuration;

//     public Transaction_passwordsController(ApplicationDbContext context, IConfiguration configuration, JwtTokenHelper jwtTokenHelper, EmailHelper emailHelper)
//     {
//         _context = context;
//         _configuration = configuration;
//         _jwtTokenHelper = jwtTokenHelper;
//         _emailHelper = emailHelper;
//     }

//     [HttpPost("create")]
//     public async Task<IActionResult> Create_Transaction_passwords([FromBody] Transaction_passwordsView view)
//     {
//         try
//         {

//             var token = _jwtTokenHelper.GetBearerToken(HttpContext);

//             if (string.IsNullOrEmpty(token))
//             {
//                 return BadRequest(new ApiError
//                 {
//                     Status = 400,
//                     Error = "There are no tokens yet",
//                     Message = "Chưa có token được truyền vào"
//                 });
//             }



//             var principal = _jwtTokenHelper.DecodeToken(token);
//             var customerId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

//             if (customerId == null)
//             {
//                 return BadRequest(new ApiError
//                 {
//                     Status = 400,
//                     Error = "Token Expired",
//                     Message = "Phiên đăng nhập đã hết hạn , vui lòng đăng nhập lại"
//                 });
//             }
//             int customerId2 = int.Parse(customerId);

//             var TransactionPassword_ = await _context.transaction_Passwords.FirstOrDefaultAsync(x => x.CustomerId == customerId2);
//             if (TransactionPassword_ == null)
//             {
//                 var TransactionPassword_new = new Transaction_passwords
//                 {
//                     CustomerId = customerId2,
//                     TransactionPassword = view.TransactionPassword,
//                 };
//                 _context.transaction_Passwords.Add(TransactionPassword_new);
//                 await _context.SaveChangesAsync();
//                 return Ok(new ApiResponse<object>
//                 {
//                     Status = 200,
//                     Message = "Tạo mật khẩu thành công",
//                 });
//             }
//             else
//             {
//                 TransactionPassword_.TransactionPassword = view.TransactionPassword;
//                 await _context.SaveChangesAsync();
//                 return Ok(new ApiResponse<object>
//                 {
//                     Status = 200,
//                     Message = "Cập nhật mật khẩu thành công",
//                 });
//             }



//         }
//         catch (Exception ex)
//         {
//             return StatusCode(500, $"Lỗi server: {ex.Message}");
//         }
//     }




//     // [HttpGet("check")]
//     // public async Task<IActionResult> Check_Transaction_passwords([FromBody] Transaction_passwordsView view)
//     // {
//     //     try
//     //     {

//     //         var token = _jwtTokenHelper.GetBearerToken(HttpContext);

//     //         if (string.IsNullOrEmpty(token))
//     //         {
//     //             return BadRequest(new ApiError
//     //             {
//     //                 Status = 400,
//     //                 Error = "There are no tokens yet",
//     //                 Message = "Chưa có token được truyền vào"
//     //             });
//     //         }
//     //         var principal = _jwtTokenHelper.DecodeToken(token);
//     //         var customerId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//     //         int customerId2 = int.Parse(customerId);


//     //         var TransactionPassword_ = await _context.transaction_Passwords.FirstOrDefaultAsync(x => x.CustomerId == customerId2);

//     //         if (TransactionPassword_ == null)
//     //         {
//     //             return BadRequest(new ApiError
//     //             {
//     //                 Status = 400,
//     //                 Error = "Code has not been generated yet",
//     //                 Message = "Chưa có mã chuyển khoản vui lòng tạo"
//     //             });
//     //         }

//     //         if (TransactionPassword_.TransactionPassword != view.TransactionPassword)
//     //         {
//     //             return BadRequest(new ApiError
//     //             {
//     //                 Status = 400,
//     //                 Error = "Incorrect transfer code",
//     //                 Message = "Mã chuyển khoản không đúng"
//     //             });
//     //         }





//     //         return Ok(new ApiResponse<object>
//     //         {
//     //             Status = 200,
//     //             Message = "Mã chuyển khoản đúng ",
//     //             // ✅ trả token dạng string
//     //         });








//     //     }
//     //     catch (Exception ex)
//     //     {
//     //         return StatusCode(500, $"Lỗi server: {ex.Message}");
//     //     }

//     // }



// }