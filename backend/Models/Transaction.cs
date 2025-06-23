using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Transaction
{
    [Key]

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int TransactionId { get; set; }

    /// <summary>
    /// người chuyển
    /// </summary>
    public int SenderAccount { get; set; }

    public int id_banking_sender { get; set; }


    /// <summary>
    /// người nhận
    /// </summary>
    public int ReceiverAccount { get; set; }
    public int id_banking_Receiver { get; set; }




    /// <summary>
    ///Thông tin
    /// </summary>
    public decimal amount { get; set; }
    public string description { get; set; }
    public DateTime dransactionDate { get; set; }
    public string transaction_status { get; set; }


}