using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;



public class Statements
{
    [Key]
    public int statement_id{ get; set; }

    [ForeignKey("Accounts")]
    public int account_id{ get; set; }
    public Accounts accounts{ get; set; }

    [MaxLength(10)]
    public string PeriodType { get; set; } // monthly or annual





    [Column(TypeName = "date")]
    public DateTime StartDate { get; set; }

    [Column(TypeName = "date")]
    public DateTime EndDate { get; set; }

    public DateTime GeneratedOn { get; set; }

    [MaxLength(255)]
    public string FileUrl { get; set; }

}