using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("Service_requests")]
public class Service_request
{
    [Key]
    [Column("request_id")]
    public int RequestId { get; set; }

    [ForeignKey("Customer")]
    [Column("customer_id")]
    public int CustomerId { get; set; }
    public Customer customer { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("request_type")]
    public string RequestType { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("request_detail")]
    public string RequestDetail { get; set; }

    [Required]
    [Column("request_date")]
    public DateTime RequestDate { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; }

}
