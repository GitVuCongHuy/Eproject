using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;



public class Bank
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int bank_id { get; set; }

    [MaxLength(100)]
    public string bank_name { get; set; }

    public string address { get; set; }

    [MaxLength(20)]
    public string ContactNumber { get; set; }
}