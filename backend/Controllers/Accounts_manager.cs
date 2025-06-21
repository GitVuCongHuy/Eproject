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

    private async Task<string> GenerateUniqueCardNumberAsync()
    {
        var random = new Random();
        string cardNumber;
        do
        {
            var firstDigit = random.Next(1, 10);
            var remainingDigits = Enumerable.Range(0, 9).Select(_ => random.Next(0, 10).ToString());
            cardNumber = firstDigit.ToString() + string.Concat(remainingDigits);
        } while (await _context.Accounts.AnyAsync(a => a.CardNumber == cardNumber));
        return cardNumber;
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

        if (customer.locked == true)
            return BadRequest(new ApiError
            {
                Status = 400,
                Error = "Account lock",
                Message = "Tài khoản này đã bị khóa , vui lòng ra ngân hàng gần nhất để mở"
            });

        if (model == null || model.BankId <= 0)
            return BadRequest(new ApiError { Status = 400, Error = "MissingData", Message = "Thiếu thông tin ngân hàng" });

        if (model.InitialBalance < 0)
            return BadRequest(new ApiError { Status = 400, Error = "InvalidData", Message = "Số dư khởi tạo không hợp lệ." });

        var existingCardCount = await _context.Accounts.CountAsync(a => a.customer_id == customerId);
        if (existingCardCount >= 5)
            return BadRequest(new ApiError { Status = 400, Error = "LimitReached", Message = "Bạn đã tạo tối đa 5 thẻ." });

        string cardNumber = await GenerateUniqueCardNumberAsync();

        var newAccount = new Accounts
        {
            customer_id = customerId,
            Balance = model.InitialBalance,
            Status = "Active",
            CardNumber = cardNumber,
        };

        _context.Accounts.Add(newAccount);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<Accounts> { Status = 200, Message = "Tạo thẻ thành công", Data = newAccount });
    }

    [HttpGet("cards")]
    public async Task<IActionResult> GetCards()
    {
        var customerId = GetCustomerIdFromToken();
        var accounts = await _context.Accounts.Where(a => a.customer_id == customerId).ToListAsync();
        return Ok(new ApiResponse<List<Accounts>> { Status = 200, Message = "Lấy danh sách thẻ thành công", Data = accounts });
    }

    [HttpPost("lock-card/{accountId}")]
    public async Task<IActionResult> LockCard(int accountId)
    {
        var customerId = GetCustomerIdFromToken();
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == accountId && a.customer_id == customerId);
        if (account == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy thẻ để khóa." });
        if (account.Status == "Locked")
            return BadRequest(new ApiError { Status = 400, Error = "AlreadyLocked", Message = "Thẻ đã bị khóa trước đó." });
        account.Status = "Locked";
        await _context.SaveChangesAsync();
        return Ok(new ApiResponse<string> { Status = 200, Message = "Đã khóa thẻ thành công.", Data = "Locked" });
    }

    [HttpPost("unlock-card/{accountId}")]
public async Task<IActionResult> UnlockCard(int accountId)
{
    var customerId = GetCustomerIdFromToken();

    var account = await _context.Accounts
        .FirstOrDefaultAsync(a => a.account_id == accountId && a.customer_id == customerId);

    if (account == null)
        return NotFound(new ApiError
        {
            Status = 404,
            Error = "NotFound",
            Message = "Không tìm thấy thẻ hoặc thẻ không thuộc về bạn."
        });

    if (account.Status != "Locked")
    {
        return BadRequest(new ApiError
        {
            Status = 400,
            Error = "NotLocked",
            Message = "Thẻ này không bị khóa, không cần mở khóa."
        });
    }

    account.Status = "Active";
    await _context.SaveChangesAsync();

    return Ok(new ApiResponse<string>
    {
        Status = 200,
        Message = "Mở khóa thẻ thành công.",
        Data = "Unlocked"
    });
}

    [HttpDelete("delete-card/{accountId}")]
    public async Task<IActionResult> DeleteCard(int accountId)
    {
        var customerId = GetCustomerIdFromToken();
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == accountId && a.customer_id == customerId);
        if (account == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy thẻ." });
        if (account.Balance > 0)
            return BadRequest(new ApiError { Status = 400, Error = "HasBalance", Message = "Thẻ còn tiền. Không thể xóa." });
        _context.Accounts.Remove(account);
        await _context.SaveChangesAsync();
        return Ok(new ApiResponse<string> { Status = 200, Message = "Đã xóa thẻ thành công.", Data = "Deleted" });
    }

    [HttpGet("balance/{accountId}")]
public async Task<IActionResult> GetBalance(int accountId)
{
    var customerId = GetCustomerIdFromToken();

    var account = await _context.Accounts
        .FirstOrDefaultAsync(a => a.customer_id == customerId && a.account_id == accountId);

    if (account == null)
    {
        return NotFound(new ApiError
        {
            Status = 404,
            Error = "NotFound",
            Message = "Không tìm thấy thẻ hoặc thẻ không thuộc về bạn."
        });
    }

    return Ok(new ApiResponse<decimal>
    {
        Status = 200,
        Message = "Lấy số dư thành công",
        Data = account.Balance
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
