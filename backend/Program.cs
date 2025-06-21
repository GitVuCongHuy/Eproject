using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure; 
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ✅ Cấu hình license cho QuestPDF
QuestPDF.Settings.License = LicenseType.Community;

// Kết nối database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:5173") // URL frontend
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials());
});

// Thêm dịch vụ controller và view
builder.Services.AddControllersWithViews();

// Đăng ký các service cần thiết
builder.Services.AddSingleton<EmailHelper>();
builder.Services.AddScoped<JwtTokenHelper>();

// Lấy thông tin cấu hình từ appsettings.json
var configuration = builder.Configuration;

// Cấu hình xác thực bằng JWT
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

// Xử lý lỗi khi không ở môi trường development
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// Middleware cơ bản
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

//  CORS nên để giữa Routing và Authentication
app.UseCors("AllowSpecificOrigin");

// Authentication + Authorization
app.UseAuthentication();
app.UseAuthorization();

// Định tuyến
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
