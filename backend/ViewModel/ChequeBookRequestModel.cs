public class ChequeBookRequestModel
{
    public int AccountId { get; set; }

    public string DeliveryAddress { get; set; }

    public int Quantity { get; set; } // phải đúng tên là Quantity

    public string? Purpose { get; set; }
}
