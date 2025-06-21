import { useState, useEffect } from "react";
import { useAuth } from "../../context/context";
import "./Login.css";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default function Login() {
  const { login, verifyLogin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const [randomCaptcha, setRandomCaptcha] = useState("");
  const [error, setError] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [deviceId, setDeviceId] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [tempUsername, setTempUsername] = useState("");

  const generateCaptcha = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setRandomCaptcha(result);
    setUserCaptchaInput("");
    setCaptchaError("");
  };

  useEffect(() => {
    generateCaptcha();
    const loadFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setDeviceId(result.visitorId);
      } catch (err) {
        console.error("Error loading FingerprintJS:", err);
        setDeviceId("unknown_device");
      }
    };
    loadFingerprint();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userCaptchaInput.toLowerCase() !== randomCaptcha.toLowerCase()) {
      setCaptchaError("Mã kiểm tra không đúng.");
      setError("");
      return;
    }

    setCaptchaError("");
    setError("");

    if (showVerification) {
      const result = await verifyLogin(tempUsername, verificationCode, deviceId);
      if (result.success) {
        alert("Đăng nhập thành công!");
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
      const result = await login(username, password, deviceId);
      if (result.success) {
        alert("Đăng nhập thành công!");
        setUsername("");
        setPassword("");
        setUserCaptchaInput("");
        setRandomCaptcha("");
        generateCaptcha();
      } else {
        if (result.errorType === "New equipment") {
          setShowVerification(true);
          setTempUsername(username);
          setError(result.message);
          setPassword("");
          setUserCaptchaInput("");
          generateCaptcha();
        } else {
          setError(result.message);
        }
      }
    }
  };

  const isLoginButtonDisabled =
    (showVerification && (!tempUsername || !verificationCode || !userCaptchaInput || userCaptchaInput.toLowerCase() !== randomCaptcha.toLowerCase())) ||
    (!showVerification && (!username || !password || !userCaptchaInput || userCaptchaInput.toLowerCase() !== randomCaptcha.toLowerCase()));

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src="https://cdn2.tuoitre.vn/thumb_w/1200/471584752817336320/2023/9/26/photo1695689906986-16956899071891462962817.jpg" alt="ekyc" className="ekyc-img" />
      </div>
      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="login-form">
            <img src="https://img7.thuthuatphanmem.vn/uploads/2023/07/06/mau-logo-techcombank-dep_045648494.png" alt="TCB Logo" className="logo" />
            <h3>Chào mừng bạn đến với</h3>
            <h2><strong>TCB Internet Banking</strong></h2>
            {error && <p className="error">{error}</p>}
            {captchaError && <p className="error">{captchaError}</p>}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="TÊN ĐĂNG NHẬP"
                value={username}
                onChange={(e ) => setUsername(e.target.value)}
                required
                disabled={showVerification}
              />
              {!showVerification && (
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              )}
              {showVerification && (
                <input
                  type="text"
                  placeholder="Mã xác minh từ Email"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
              )}
              <div className="captcha-row">
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
