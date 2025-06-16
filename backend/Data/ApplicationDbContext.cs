using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets ở đây

    public DbSet<Accounts> Accounts { get; set; }
    public DbSet<Bank> Banks { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Login_attempts> Login_Attempts { get; set; }
    public DbSet<Service_request> Service_Requests { get; set; }
    public DbSet<Statements> statements { get; set; }
    public DbSet<Transaction_passwords> transaction_Passwords { get; set; }
    // public DbSet<Transaction> transactions { get; set; }
    public DbSet<Transaction_Participants> transaction_Participants { get; set; }
    public DbSet<Transactions> transactions { get; set; }

   
}

