using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

public class EmailHelper
{
    private readonly string _fromEmail;
    private readonly string _password;

    public EmailHelper(IConfiguration configuration)
    {
        _fromEmail = configuration["EmailSettings:FromEmail"];
        _password = configuration["EmailSettings:Password"];
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = false)
    {

  
        var message = new MailMessage(_fromEmail, toEmail, subject, body)
        {
            IsBodyHtml = isHtml
        };

        using var smtp = new SmtpClient("smtp.gmail.com", 587)
        {
            Credentials = new NetworkCredential(_fromEmail, _password),
            EnableSsl = true
        };
        await smtp.SendMailAsync(message);
    }


    public Task SendEmail(string toEmail, string subject, string body, bool isHtml = false)
    {

        
        var message = new MailMessage(_fromEmail, toEmail, subject, body)
        {
            IsBodyHtml = isHtml
        };

        using var smtp = new SmtpClient("smtp.gmail.com", 587)
        {
            Credentials = new NetworkCredential(_fromEmail, _password),
            EnableSsl = true
        };

        return smtp.SendMailAsync(message);
    }

/// <summary>
/// Gửi email kèm file đính kèm từ mảng byte (PDF).
/// </summary>
/// <param name="toEmail">Địa chỉ email người nhận.</param>
/// <param name="subject">Tiêu đề email.</param>
/// <param name="body">Nội dung email.</param>
/// <param name="pdfBytes">Dữ liệu file PDF dưới dạng mảng byte.</param>
/// <param name="fileName">Tên file đính kèm (mặc định là "transaction.pdf").</param>
/// <param name="isHtml">Có định dạng HTML không (mặc định là false).</param>
/// <returns>Task bất đồng bộ.</returns>
public async Task SendEmailWithAttachmentAsync(string toEmail, string subject, string body, byte[] pdfBytes, string fileName = "transaction.pdf", bool isHtml = false)
{
    string tempPath = Path.Combine(Path.GetTempPath(), fileName);
    await File.WriteAllBytesAsync(tempPath, pdfBytes);

    var message = new MailMessage(_fromEmail, toEmail, subject, body)
    {
        IsBodyHtml = isHtml
    };

    message.Attachments.Add(new Attachment(tempPath));

    using var smtp = new SmtpClient("smtp.gmail.com", 587)
    {
        Credentials = new NetworkCredential(_fromEmail, _password),
        EnableSsl = true
    };

    await smtp.SendMailAsync(message);

    File.Delete(tempPath); // Dọn rác sau khi gửi
}




    /// <summary>
    /// Tạo Mã Code
    /// </summary>
    /// <param name="length"> Độ dài đoạn code</param>
    /// <returns></returns>
    public string GenerateRandomCode(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }




}
