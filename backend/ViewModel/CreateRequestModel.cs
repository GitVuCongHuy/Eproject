 public class AccountActionModel
    {
        public int AccountId { get; set; }
        public string Reason { get; set; }  
    }

public class CreateRequestModel
{
    public string RequestType { get; set; }
    public string RequestDetail { get; set; }
    public string Reason { get; set; } 
}


public class CancelChequeModel
    {
        public int ChequeId { get; set; }
        public string Reason { get; set; }  
    }



    public class ChequeRequestModel
    {
        public int AccountId { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; }
    }

