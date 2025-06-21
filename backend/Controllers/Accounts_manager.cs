using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Net.Mail;
using System.Net;


[ApiController]
[Route("backend/[controller]")]
public class Accounts_manager : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtTokenHelper _jwtHelper;
    private readonly EmailHelper _emailHelper;

    public Accounts_manager(ApplicationDbContext context, JwtTokenHelper jwtHelper, EmailHelper emailHelper)
    {
        _context = context;
        _jwtHelper = jwtHelper;
        _emailHelper = emailHelper;
    }

    private int GetCustomerIdFromToken()
    {
        var identity = HttpContext.User.Identity as ClaimsIdentity;
        var customerIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier);
        return customerIdClaim != null && int.TryParse(customerIdClaim.Value, out int customerId)
            ? customerId
            : 0;
    }

    [HttpPost("create-card")]
    public async Task<IActionResult> CreateCard([FromBody] CreateCardRequest model)
    {
        var customerId = GetCustomerIdFromToken();
        if (customerId == 0)
            return Unauthorized(new ApiError { Status = 401, Error = "InvalidToken", Message = "Token không hợp lệ hoặc thiếu." });

        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy khách hàng trong hệ thống." });

        if (model == null || model.BankId <= 0)
            return BadRequest(new ApiError { Status = 400, Error = "MissingData", Message = "Thiếu thông tin ngân hàng" });

        if (model.InitialBalance < 0)
            return BadRequest(new ApiError { Status = 400, Error = "InvalidData", Message = "Số dư khởi tạo không hợp lệ." });

        var newAccount = new Accounts
        {
            customer_id = customerId,
            Balance = model.InitialBalance,
            Status = "Active"
        };

        _context.Accounts.Add(newAccount);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<Accounts>
        {
            Status = 200,
            Message = "Tạo thẻ thành công",
            Data = newAccount
        });
    }

    [HttpGet("cards")]
    public async Task<IActionResult> GetCards()
    {
        var customerId = GetCustomerIdFromToken();
        var accounts = await _context.Accounts
            .Where(a => a.customer_id == customerId)
            .ToListAsync();

        return Ok(new ApiResponse<List<Accounts>>
        {
            Status = 200,
            Message = "Lấy danh sách thẻ thành công",
            Data = accounts
        });
    }

    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance()
    {
        var customerId = GetCustomerIdFromToken();
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.customer_id == customerId);

        if (account == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy tài khoản." });

        return Ok(new ApiResponse<decimal>
        {
            Status = 200,
            Message = "Lấy số dư thành công",
            Data = account.Balance
        });
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactionHistory([FromQuery] int? month, [FromQuery] int? year)
    {
        var customerId = GetCustomerIdFromToken();

        var accountIds = await _context.Accounts
            .Where(a => a.customer_id == customerId)
            .Select(a => a.account_id)
            .ToListAsync();

        var transactions = await _context.transaction_Participants
            .Include(tp => tp.transactions)
            .Where(tp => accountIds.Contains(tp.AccountId))
            .Select(tp => tp.transactions)
            .ToListAsync();

        if (month.HasValue && year.HasValue)
        {
            transactions = transactions
                .Where(t => t.TransactionDate.Month == month && t.TransactionDate.Year == year)
                .ToList();
        }

        return Ok(new ApiResponse<List<Transactions>>
        {
            Status = 200,
            Message = "Lấy lịch sử giao dịch thành công",
            Data = transactions
        });
    }

    [HttpPost("transactions/export/send-mail")]
    public async Task<IActionResult> ExportTransactionsAndSendMail([FromQuery] int month, [FromQuery] int year)
    {
        var customerId = GetCustomerIdFromToken();

        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.customer_id == customerId);
        if (customer == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy khách hàng." });

        var accountIds = await _context.Accounts
            .Where(a => a.customer_id == customerId)
            .Select(a => a.account_id)
            .ToListAsync();

        var transactions = await _context.transaction_Participants
            .Include(tp => tp.transactions)
            .Where(tp => accountIds.Contains(tp.AccountId))
            .Select(tp => tp.transactions)
            .Where(t => t.TransactionDate.Month == month && t.TransactionDate.Year == year)
            .ToListAsync();

        if (!transactions.Any())
            return NotFound(new ApiError { Status = 404, Error = "NoTransactions", Message = "Không có giao dịch trong khoảng thời gian này." });

        var pdfBytes = GenerateTransactionPdf(transactions);

        string subject = $"Lịch sử giao dịch tháng {month}/{year}";
        string body = "Vui lòng xem file đính kèm để xem chi tiết lịch sử giao dịch.";

        await _emailHelper.SendEmailWithAttachmentAsync(customer.email, subject, body, pdfBytes, $"transactions_{month}_{year}.pdf");

        return Ok(new ApiResponse<string>
        {
            Status = 200,
            Message = "Đã gửi file PDF qua email.",
            Data = "Gửi thành công"
        });
    }

    private byte[] GenerateTransactionPdf(List<Transactions> transactions)
    {
        var doc = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.Header().Text("LỊCH SỬ GIAO DỊCH").FontSize(20).Bold();

                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                    });

                    table.Header(header =>
                    {
                        header.Cell().Text("Ngày").Bold();
                        header.Cell().Text("Số tiền").Bold();
                        header.Cell().Text("Loại").Bold();
                        header.Cell().Text("Trạng thái").Bold();
                    });

                    foreach (var t in transactions)
                    {
                        table.Cell().Text(t.TransactionDate.ToString("dd/MM/yyyy"));
                        table.Cell().Text(t.Amount.ToString("N0") + " VND");
                        table.Cell().Text(t.TransactionType);
                        table.Cell().Text(t.Status);
                    }
                });

                page.Footer().AlignCenter().Text("Generated by Online Banking System");
            });
        });

        return doc.GeneratePdf();
    }
}
