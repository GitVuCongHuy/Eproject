using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllersWithViews();

// Add send-email
builder.Services.AddSingleton<EmailHelper>();
builder.Services.AddScoped<JwtTokenHelper>();

// Kết nối database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:5173" ) // Thay thế bằng URL chính xác của frontend của bạn
                          .AllowAnyMethod() // Cho phép tất cả các phương thức HTTP (GET, POST, PUT, DELETE, v.v.)
                          .AllowAnyHeader() // Cho phép tất cả các header
                          .AllowCredentials()); // Cho phép gửi cookie và thông tin xác thực
});

// Cấu hình JWT Authentication
var configuration = builder.Configuration;



builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = configuration["JwtSettings:Issuer"],
            ValidAudience = configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["JwtSettings:Key"])
            )
        };
    });
    
var app = builder.Build();

// Middleware xử lý lỗi khi không ở môi trường Development
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// Middlewares cơ bản
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Sử dụng chính sách CORS đã định nghĩa
// Đặt UseCors sau UseRouting và trước UseAuthentication/UseAuthorization
app.UseCors("AllowSpecificOrigin"); 

// Bảo mật
app.UseAuthentication();  // Phải trước UseAuthorization
app.UseAuthorization();

// Định tuyến controller
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
