public class ChequeRequestModel
{
    public int AccountId { get; set; }
    public decimal Amount { get; set; }
}

public class CancelChequeModel
{
    public int ChequeId { get; set; }
}
