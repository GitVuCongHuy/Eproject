using System.ComponentModel.DataAnnotations;

public class ChequeFee
{
    [Key]
    public string FeeType { get; set; } 

    public decimal FeeAmount { get; set; }
}
