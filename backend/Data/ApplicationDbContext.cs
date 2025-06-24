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
   public DbSet<Service_request> Service_requests { get; set; }

    public DbSet<Statements> statements { get; set; }
    public DbSet<Transaction> Transaction { get; set; }

}

