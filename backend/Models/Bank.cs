using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;



public class Bank
{
    [Key]
    public int bank_id;

    [MaxLength(100)]
    public string bank_name;

    public string address;

    [MaxLength(20)]
    public string ContactNumber { get; set; }
}