using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;



public class Accounts
{
    [Key]
    public int account_id { get; set; }

    [ForeignKey("Customer")]
    public int customer_id { get; set; }
    public Customer customer { get; set; }

    // Số dư (balance) dưới dạng decimal, ví dụ 1000 VND
    public decimal Balance { get; set; }

    // Trạng thái giao dịch (status), ví dụ "Completed", "Pending", "Failed"
    [MaxLength(20)]
    public string Status { get; set; }

}