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
using backend.ViewModel;

[ApiController]
[Route("backend/[controller]")]
public class Accounts_manager : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly JwtTokenHelper _jwtHelper;
    private readonly EmailHelper _emailHelper;
    private readonly IConfiguration _configuration;

    public Accounts_manager(ApplicationDbContext context, IConfiguration configuration, JwtTokenHelper jwtHelper, EmailHelper emailHelper)
    {
        _context = context;
        _configuration = configuration;
        _jwtHelper = jwtHelper;
        _emailHelper = emailHelper;
    }

    private int GetCustomerIdFromToken()
    {
        var identity = HttpContext.User.Identity as ClaimsIdentity;
        var customerIdClaim = identity?.FindFirst(ClaimTypes.NameIdentifier);
        return customerIdClaim != null && int.TryParse(customerIdClaim.Value, out int customerId) ? customerId : 0;
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
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy khách hàng." });

        if (customer.locked == true)
            return BadRequest(new ApiError { Status = 400, Error = "AccountLocked", Message = "Tài khoản đã bị khóa." });

        if (string.IsNullOrWhiteSpace(model.CardType) || (model.CardType != "Normal" && model.CardType != "Credit"))
            return BadRequest(new ApiError { Status = 400, Error = "InvalidCardType", Message = "Loại thẻ không hợp lệ (Normal hoặc Credit)." });

        var existingAccounts = await _context.Accounts.Where(a => a.customer_id == customerId).ToListAsync();
        if (existingAccounts.Count >= 3)
            return BadRequest(new ApiError { Status = 400, Error = "CardLimitReached", Message = "Tổng số thẻ không được vượt quá 3." });

        if (model.CardType == "Credit" && existingAccounts.Any(a => a.CardType == "Credit"))
            return BadRequest(new ApiError { Status = 400, Error = "CreditCardLimit", Message = "Chỉ được tạo 1 thẻ ghi nợ." });

        var cardNumber = await GenerateUniqueCardNumberAsync();

        var newAccount = new Accounts
        {
            customer_id = customerId,
            CardNumber = cardNumber,
            CardType = model.CardType,
            Status = "Active",
            Balance = model.CardType == "Credit" ? 10_000_000 : model.InitialBalance,
            CreditIssuedDate = model.CardType == "Credit" ? DateTime.UtcNow : null
        };

        _context.Accounts.Add(newAccount);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Status = 200, Message = "Tạo thẻ thành công" });
    }

    [HttpGet("cards")]
    public async Task<IActionResult> GetCards()
    {
        var customerId = GetCustomerIdFromToken();
        var accounts = await _context.Accounts
            .Where(a => a.customer_id == customerId)
            .Select(a => new { a.account_id, a.CardNumber, a.Balance, a.Status, a.CardType })
            .ToListAsync();

        return Ok(new ApiResponse<object> { Status = 200, Message = "Lấy danh sách thẻ thành công", Data = accounts });
    }

    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance([FromQuery] int accountId)
    {
        var customerId = GetCustomerIdFromToken();
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.account_id == accountId && a.customer_id == customerId);
        if (account == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy tài khoản." });

        return Ok(new ApiResponse<decimal> { Status = 200, Message = "Lấy số dư thành công", Data = account.Balance });
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactionHistory([FromQuery] int? day, [FromQuery] int? month, [FromQuery] int? year, [FromQuery] int? accountId)
    {
        var customerId = GetCustomerIdFromToken();
        var query = _context.bank_Transaction.AsQueryable();


        if (accountId.HasValue)
        {
            var accountCardNumber = await _context.Accounts
                .Where(a => a.customer_id == customerId && a.account_id == accountId.Value)
                .Select(a => a.CardNumber)
                .FirstOrDefaultAsync();

            if (accountCardNumber == null)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "InvalidAccount",
                    Message = "Tài khoản không thuộc quyền sở hữu."
                });
            }

            query = query.Where(t => t.SenderAccount == accountCardNumber || t.ReceiverAccount == accountCardNumber);
        }
        else
        {
            var accountCardNumbers = await _context.Accounts
                .Where(a => a.customer_id == customerId)
                .Select(a => a.CardNumber)
                .ToListAsync();

            query = query.Where(t => accountCardNumbers.Contains(t.SenderAccount) || accountCardNumbers.Contains(t.ReceiverAccount));
        }


        if (day.HasValue && month.HasValue && year.HasValue)
        {
            query = query.Where(t =>
                t.transactionDate.Day == day.Value &&
                t.transactionDate.Month == month.Value &&
                t.transactionDate.Year == year.Value);
        }
        else if (month.HasValue && year.HasValue)
        {
            query = query.Where(t =>
                t.transactionDate.Month == month.Value &&
                t.transactionDate.Year == year.Value);
        }
        else if (year.HasValue)
        {
            query = query.Where(t => t.transactionDate.Year == year.Value);
        }

        var transactions = await query.OrderByDescending(t => t.transactionDate).ToListAsync();

        return Ok(new ApiResponse<List<Bank_Transaction>>
        {
            Status = 200,
            Message = "Lịch sử giao dịch",
            Data = transactions
        });
    }

    [HttpPost("transactions/export/send-mail")]
    public async Task<IActionResult> ExportTransactionsAndSendMail([FromQuery] int month, [FromQuery] int year, [FromQuery] int? accountId)
    {
        var customerId = GetCustomerIdFromToken();
        var customer = await _context.Customers.FindAsync(customerId);

        if (customer == null)
        {
            return NotFound(new ApiError
            {
                Status = 404,
                Error = "NotFound",
                Message = "Không tìm thấy khách hàng."
            });
        }

        List<string> accountCardNumbers;

        if (accountId.HasValue)
        {
            var accountCardNumber = await _context.Accounts
                .Where(a => a.customer_id == customerId && a.account_id == accountId.Value)
                .Select(a => a.CardNumber)
                .FirstOrDefaultAsync();

            if (accountCardNumber == null)
            {
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "InvalidAccount",
                    Message = "Tài khoản không thuộc quyền sở hữu."
                });
            }

            accountCardNumbers = new List<string> { accountCardNumber };
        }
        else
        {
            accountCardNumbers = await _context.Accounts
                .Where(a => a.customer_id == customerId)
                .Select(a => a.CardNumber)
                .ToListAsync();
        }

        var transactions = await _context.bank_Transaction
            .Where(t =>
                (accountCardNumbers.Contains(t.SenderAccount) || accountCardNumbers.Contains(t.ReceiverAccount)) &&
                t.transactionDate.Month == month &&
                t.transactionDate.Year == year)
            .ToListAsync();

        if (!transactions.Any())
        {
            return NotFound(new ApiError
            {
                Status = 404,
                Error = "NoTransactions",
                Message = "Không có giao dịch trong thời gian này."
            });
        }

        var pdfBytes = GenerateTransactionPdf(transactions);
        string subject = $"Sao kê giao dịch tháng {month}/{year}";
        string body = "Vui lòng xem file đính kèm để xem chi tiết sao kê giao dịch.";

        await _emailHelper.SendEmailWithAttachmentAsync(customer.email, subject, body, pdfBytes, $"statement_{month}_{year}.pdf");

        return Ok(new ApiResponse<string>
        {
            Status = 200,
            Message = "Đã gửi file PDF qua email",
            Data = "Gửi thành công"
        });
    }


    private byte[] GenerateTransactionPdf(List<Bank_Transaction> transactions)
    {
        var doc = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.Header().Text("SAO KÊ GIAO DỊCH").FontSize(20).Bold();
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
                        header.Cell().Text("Mô tả").Bold();
                        header.Cell().Text("Trạng thái").Bold();
                    });

                    foreach (var t in transactions)
                    {
                        table.Cell().Text(t.transactionDate.ToString("dd/MM/yyyy"));
                        table.Cell().Text(t.amount.ToString("N0") + " VND");
                        table.Cell().Text(t.description ?? "-");
                        table.Cell().Text(t.transaction_status ?? "-");
                    }
                });

                page.Footer().AlignCenter().Text("Generated by Online Banking System");
            });
        });

        return doc.GeneratePdf();
    }

    [HttpPost("check-credit-overdue")]
    public async Task<IActionResult> CheckCreditCardOverdue()
    {
        var overdueAccounts = await _context.Accounts
            .Include(a => a.customer)
            .Where(a => a.CardType == "Credit"
                    && a.Balance < 0
                    && a.CreditIssuedDate != null
                    && EF.Functions.DateDiffDay(a.CreditIssuedDate.Value, DateTime.UtcNow) > 30)
            .ToListAsync();

        foreach (var account in overdueAccounts)
        {
            string subject = "Cảnh báo quá hạn thẻ ghi nợ";
            string body = $@"
                Chào {account.customer.full_name},<br><br>
                Thẻ ghi nợ số {account.CardNumber} của bạn đã quá hạn thanh toán 1 tháng.<br>
                Số tiền còn nợ: {Math.Abs(account.Balance):N0} VND.<br><br>
                Vui lòng thanh toán sớm để tránh các hình phạt hoặc khóa thẻ.<br><br>
                Trân trọng,<br>Ngân hàng Online.";

            await _emailHelper.SendEmailWithAttachmentAsync(account.customer.email, subject, body, null);
        }

        return Ok(new ApiResponse<int>
        {
            Status = 200,
            Message = "Đã xử lý các thẻ ghi nợ quá hạn",
            Data = overdueAccounts.Count
        });
    }



    /// <summary>
    /// lấy tài khoản dựa theo custommer id 
    /// </summary>
    /// <param name="customerId"></param>
    /// <returns></returns>
    [HttpGet("get-accounts-by-customer")]
    public async Task<IActionResult> GetAccountsByCustomerId([FromQuery] int customerId)
    {
        // Kiểm tra xem customer có tồn tại không
        var customerExists = await _context.Customers.AnyAsync(c => c.customer_id == customerId);
        if (!customerExists)
        {
            return NotFound(new ApiError
            {
                Status = 404,
                Error = "NotFound",
                Message = "Không tìm thấy khách hàng."
            });
        }

        // Lấy tất cả tài khoản theo customerId
        var accounts = await _context.Accounts
            .Where(a => a.customer_id == customerId)
            .Select(a => new
            {
                a.account_id,
                a.CardNumber,
                a.CardType,
                // a.Balance,
                a.Status,
                a.CreditIssuedDate
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Lấy danh sách tài khoản thành công",
            Data = accounts
        });
    }


    [HttpPost("admin_create-card")]
    public async Task<IActionResult> Admin_CreateCard([FromBody] Admin_CreateCardRequest model)
    {


        var customer = await _context.Customers.FindAsync(model.customer_id);
        if (customer == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy khách hàng." });

        if (customer.locked == true)
            return BadRequest(new ApiError { Status = 400, Error = "AccountLocked", Message = "Tài khoản đã bị khóa." });

        if (string.IsNullOrWhiteSpace(model.CardType) || (model.CardType != "Normal" && model.CardType != "Credit"))
            return BadRequest(new ApiError { Status = 400, Error = "InvalidCardType", Message = "Loại thẻ không hợp lệ (Normal hoặc Credit)." });

        var existingAccounts = await _context.Accounts.Where(a => a.customer_id == model.customer_id).ToListAsync();
        if (existingAccounts.Count >= 3)
            return BadRequest(new ApiError { Status = 400, Error = "CardLimitReached", Message = "Tổng số thẻ không được vượt quá 3." });

        if (model.CardType == "Credit" && existingAccounts.Any(a => a.CardType == "Credit"))
            return BadRequest(new ApiError { Status = 400, Error = "CreditCardLimit", Message = "Chỉ được tạo 1 thẻ ghi nợ." });

        var cardNumber = await GenerateUniqueCardNumberAsync();

        var newAccount = new Accounts
        {
            customer_id = model.customer_id,
            CardNumber = cardNumber,
            CardType = model.CardType,
            Status = "Active",
            Balance = model.CardType == "Credit" ? 10_000_000 : model.InitialBalance,
            CreditIssuedDate = model.CardType == "Credit" ? DateTime.UtcNow : null
        };

        _context.Accounts.Add(newAccount);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Status = 200, Message = "Tạo thẻ thành công" });
    }


    [HttpDelete("admin_delete-card/{cardId}")]
    public async Task<IActionResult> Admin_DeleteCard(int cardId)
    {
        var account = await _context.Accounts.FindAsync(cardId);

        if (account == null)
            return NotFound(new ApiError { Status = 404, Error = "NotFound", Message = "Không tìm thấy thẻ." });

        if (account.CardType == "Normal")
        {
            if (account.Balance != 0)
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "NonZeroBalance",
                    Message = "Thẻ thường chỉ được xóa khi số dư bằng 0."
                });
        }
        else if (account.CardType == "Credit")
        {
            if (account.Balance != 10_000_000)
                return BadRequest(new ApiError
                {
                    Status = 400,
                    Error = "InvalidCreditBalance",
                    Message = "Thẻ ghi nợ chỉ được xóa khi số dư là 10.000.000 (vốn gốc)."
                });
        }
        else
        {
            return BadRequest(new ApiError
            {
                Status = 400,
                Error = "UnknownCardType",
                Message = "Loại thẻ không xác định."
            });
        }

        _context.Accounts.Remove(account);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object> { Status = 200, Message = "Xóa thẻ thành công." });
    }
    

    [HttpGet("admin-statistics")]
    public async Task<IActionResult> GetAccountStatistics()
    {
        var totalAccounts = await _context.Accounts.CountAsync();

        var activeAccounts = await _context.Accounts.CountAsync(a => a.Status == "Active");
        var lockedAccounts = await _context.Accounts.CountAsync(a => a.Status != "Active");

        var normalCardCount = await _context.Accounts.CountAsync(a => a.CardType == "Normal");
        var creditCardCount = await _context.Accounts.CountAsync(a => a.CardType == "Credit");

        var totalNormalBalance = await _context.Accounts
            .Where(a => a.CardType == "Normal")
            .SumAsync(a => (decimal?)a.Balance) ?? 0;

        var totalCreditDebt = await _context.Accounts
            .Where(a => a.CardType == "Credit")
            .SumAsync(a => (decimal?)(10_000_000 - a.Balance)) ?? 0;

        var top10Balances = await _context.Accounts
            .Where(a => a.CardType == "Normal")
            .OrderByDescending(a => a.Balance)
            .Take(10)
            .Select(a => new {
                a.account_id,
                a.CardNumber,
                a.Balance,
                a.customer.full_name
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>
        {
            Status = 200,
            Message = "Thống kê tài khoản thành công",
            Data = new
            {
                totalAccounts,
                activeAccounts,
                lockedAccounts,
                normalCardCount,
                creditCardCount,
                totalNormalBalance,
                totalCreditDebt,
                top10Balances
            }
        });
    }
    
}
