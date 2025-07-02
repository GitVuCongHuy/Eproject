using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Admin_Customer
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int admin_customer_id { get; set; }

    [MaxLength(50)]
    public string username { get; set; }

    [Required]
    public string password { get; set; }

    [MaxLength(100)]
    public string full_name { get; set; }

    public string url_img { get; set; }

}