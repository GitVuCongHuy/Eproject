// src/pages/Login/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { useAuth } from "../../context/Context";
import "./Login.css";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default function Login() {
  const { login, verifyLogin } = useAuth();
  const navigate = useNavigate(); // 2. Initialize navigate
  const [username, setUsername] = useState("");
  // ... (keep other states)
  const [password, setPassword] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const [randomCaptcha, setRandomCaptcha] = useState("");
  const [error, setError] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [deviceId, setDeviceId] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [tempUsername, setTempUsername] = useState("");

  // ... (keep useEffect and generateCaptcha)
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
    if (userCaptchaInput !== randomCaptcha) {
      setCaptchaError("Captcha is incorrect.");
      setError("");
      return;
    }
    setCaptchaError("");
    setError("");

    if (showVerification) {
      const result = await verifyLogin(tempUsername, verificationCode, deviceId);
      if (result.success) {
        // 3. Replace alert with navigate
        navigate('/'); 
      } else {
        setError(result.message);
      }
    } else {
      const result = await login(username, password, deviceId);
      if (result.success) {
         // 4. Replace alert with navigate
        navigate('/');
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

  // ... (keep the JSX part)
  const isLoginButtonDisabled =
(showVerification && (!tempUsername || !verificationCode || !userCaptchaInput || userCaptchaInput !== randomCaptcha)) ||
(!showVerification && (!username || !password || !userCaptchaInput || userCaptchaInput !== randomCaptcha));


return (
  <div className="login-wrapper">
    <div className="login-left">
      <img src="https://cdn2.tuoitre.vn/thumb_w/1200/471584752817336320/2023/9/26/photo1695689906986-16956899071891462962817.jpg" alt="ekyc" className="ekyc-img" />
    </div>
    <div className="login-right">
      <div className="login-form-wrapper">
        <div className="login-form">
          <img src="https://img7.thuthuatphanmem.vn/uploads/2023/07/06/mau-logo-techcombank-dep_045648494.png" alt="TCB Logo" className="logo" />
          <h3>Welcome to</h3>
          <h2><strong>TCB Internet Banking</strong></h2>
          {error && <p className="error">{error}</p>}
          {captchaError && <p className="error">{captchaError}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={showVerification}
            />
            {!showVerification && (
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}
            {showVerification && (
              <input
                type="text"
                placeholder="Verification Code from Email"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            )}
            <div className="captcha-row">
              <div className="captcha-display">{randomCaptcha}</div>
              <input
                type="text"
                placeholder="ENTER CAPTCHA"
                value={userCaptchaInput}
                onChange={(e) => setUserCaptchaInput(e.target.value)}
                required
              />
              <button type="button" className="refresh-btn" onClick={generateCaptcha}>
                ↻
              </button>
            </div>
            <button type="submit" className="submit-btn" disabled={isLoginButtonDisabled}>
              {showVerification ? "Verify & Log In" : "Log In"}
            </button>
          </form>
        </div>
      </div>
      <div className="footer-links-wrapper">
        <div className="footer-links">
          <a href="#">Connect with us</a> |
          <a href="#">Terms and Conditions</a> |
          <a href="#">Security & Privacy</a>
        </div>
      </div>
    </div>
  </div>
);
}