using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Cheque
{
    [Key]
    public int ChequeId { get; set; }

    [ForeignKey("Account")]
    public int AccountId { get; set; }

    public decimal Amount { get; set; }

    public DateTime IssuedDate { get; set; }

    public string Status { get; set; } // "Issued", "Cancelled", "Paid"

    public DateTime? PaidDate { get; set; }

    public virtual Accounts Account { get; set; }
}
