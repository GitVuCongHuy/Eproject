namespace backend.ViewModel
{
    public class Transfer_View
    {
        public string SenderAccount { get; set; }
        public string ReceiverAccount { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }

        public int TransactionPassword { get; set; }
    }
}