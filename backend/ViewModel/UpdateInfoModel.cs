using System.ComponentModel.DataAnnotations;

public class ChangePasswordModel
{
    [Required(ErrorMessage = "Mật khẩu hiện tại là bắt buộc.")]
    public string CurrentPassword { get; set; }

    [Required(ErrorMessage = "Mật khẩu mới là bắt buộc.")]
    [MinLength(6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự.")]
    public string NewPassword { get; set; }
}

public class ChangeTransactionPasswordModel
{
    [Required(ErrorMessage = "Mật khẩu giao dịch hiện tại là bắt buộc.")]
    public string CurrentTransactionPassword { get; set; }

    [Required(ErrorMessage = "Mật khẩu giao dịch mới là bắt buộc.")]
    [MinLength(6, ErrorMessage = "Mật khẩu giao dịch mới phải có ít nhất 6 ký tự.")]
    public string NewTransactionPassword { get; set; }
}
