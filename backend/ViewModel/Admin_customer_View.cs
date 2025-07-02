public class AdminRegisterViewModel
{
    public string Username { get; set; }
    public string Password { get; set; }
    public string FullName { get; set; }
    public string UrlImg { get; set; }
}

public class AdminLoginViewModel
{
    public string Username { get; set; }
    public string Password { get; set; }
}

public class AdminChangePasswordViewModel
{
    public int AdminCustomerId { get; set; }
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
}

public class AdminUpdateInfoViewModel
{
    public int AdminCustomerId { get; set; }
    public string FullName { get; set; }
    public string UrlImg { get; set; }
}
