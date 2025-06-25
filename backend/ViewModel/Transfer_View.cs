namespace backend.ViewModel
{
    public class Transfer_View
    {
        public int SenderAccount { get; set; }
        public int ReceiverAccount { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }

        public int TransactionPassword { get; set; }
    }
}