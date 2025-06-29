namespace backend.Enums
{
    public static class RequestTypeEnum
    {
        public const string LockAccount = "LockAccount";
        public const string CloseAccount = "CloseAccount";
        public const string UpdateInfo = "UpdateInfo";
        public const string IssueCheque = "IssueCheque";
        public const string CancelCheque = "CancelCheque";

       
        public static readonly string[] AllowedTypes = new[]
        {
            LockAccount, CloseAccount, UpdateInfo, IssueCheque, CancelCheque
        };

        
        public const string UnlockAccountCard = "UnlockAccountCard";
        public const string UnlockAccount = "UnlockAccount";
    }
}
