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
    /// Tạo Mã Code
    /// </summary>
    /// <param name="length"> Độ dài đoạn code</param>
    /// <returns></returns>
    public  string GenerateRandomCode(int length )
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }




}
