public class UnlockRequestModel
{
    public string CitizenIdentificationCard { get; set; }
    public string Reason { get; set; }
}

public class UnlockCardRequestModel
{
    public string CitizenIdentificationCard { get; set; }
    public string CardNumber { get; set; }   
    public string Reason { get; set; }
}

