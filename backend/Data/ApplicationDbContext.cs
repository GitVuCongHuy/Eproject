using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
  public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
      : base(options)
  {
  }

      // DbSets ở đây
  
      DbSet<Accounts> Accounts { get; set; }
      DbSet<Bank> Banks { get; set; }
      DbSet<Customer> Customers { get; set; }
      DbSet<Login_attempts> Login_Attempts { get; set; }
      DbSet<Service_request> Service_Requests { get; set; }
      DbSet<Statements> statements { get; set; }
      DbSet<Transaction_passwords> transaction_Passwords { get; set; }
      DbSet<Transaction> transactions { get; set; }


}