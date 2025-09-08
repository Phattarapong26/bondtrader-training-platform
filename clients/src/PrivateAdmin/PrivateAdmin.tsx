import React, { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PrivateAdmin: React.FC = () => {
  const [privateKey, setPrivateKey] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [adminId, setAdminId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const navigate = useNavigate();

  // ตรวจสอบว่ามี token อยู่แล้วหรือไม่เมื่อโหลดหน้า
  useEffect(() => {
    const storedToken = sessionStorage.getItem("jwtToken");
    const storedRefreshToken = sessionStorage.getItem("refreshToken");
    
    if (storedToken) {
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      // ตรวจสอบความถูกต้องของ token ก่อนนำทางไป dashboard
      validateToken(storedToken);
    }
  }, []);

  // ฟังก์ชันตรวจสอบ token
  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/validate-token", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenToValidate}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.valid) {
        // ถ้า token ยังใช้ได้ นำทางไปที่ dashboard
        navigate("/AdminACMD");
      } else {
        // ถ้า token ไม่ถูกต้อง ลองใช้ refresh token
        const storedRefreshToken = sessionStorage.getItem("refreshToken");
        if (storedRefreshToken) {
          await refreshAccessToken(storedRefreshToken);
        }
      }
    } catch (error) {
      console.error("Error validating token:", error);
      // ลบ token ที่หมดอายุ
      sessionStorage.removeItem("jwtToken");
      sessionStorage.removeItem("refreshToken");
    }
  };

  // ฟังก์ชันรีเฟรช token
  const refreshAccessToken = async (refreshTokenValue: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: refreshTokenValue }),
      });

      const data = await response.json();
      if (response.ok) {
        // บันทึก token ใหม่
        sessionStorage.setItem("jwtToken", data.token);
        sessionStorage.setItem("refreshToken", data.refreshToken);
        setToken(data.token);
        setRefreshToken(data.refreshToken);
        // นำทางไปยัง dashboard
        navigate("/AdminACMD");
        return true;
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      // ลบ token ที่หมดอายุ
      sessionStorage.removeItem("jwtToken");
      sessionStorage.removeItem("refreshToken");
      return false;
    }
  };

  // ฟังก์ชัน logout
  const handleLogout = async () => {
    if (token) {
      try {
        await fetch("http://localhost:3000/api/SuperAdmin/Logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    
    // ลบ token จาก sessionStorage
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("refreshToken");
    setToken(null);
    setRefreshToken(null);
  };

  // Handle Private Key Submission
  const handlePrivateKeySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (privateKey.length !== 25) {
      setError("Private key must be exactly 25 characters.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/SuperAdmin/Login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ privateKey }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const { token: newToken, refreshToken: newRefreshToken, adminId } = data;

        // บันทึก token ใน sessionStorage แทน localStorage
        sessionStorage.setItem("jwtToken", newToken);
        sessionStorage.setItem("refreshToken", newRefreshToken);
        
        // บันทึกในตัวแปร state
        setToken(newToken);
        setRefreshToken(newRefreshToken);

        setAdminId(adminId);
        setIsOtpSent(true);
        setSuccess(
          "Private key verified. Please scan the QR code and enter OTP."
        );
        // ดึงข้อมูล QR Code สำหรับตั้งค่า TOTP
        const qrResponse = await fetch(
          "http://localhost:3000/api/SuperAdmin/Login/verify/setup-2fa",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ privateKey }),
          }
        );

        const qrData = await qrResponse.json();
        if (qrResponse.ok) {
          setQrCode(qrData.qrCode);
        } else {
          throw new Error(qrData.message || "Failed to generate QR code");
        }
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Submission
  const handleOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/SuperAdmin/Login/verifyOTP",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminId, otp }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("MFA verification successful!");
        navigate("/AdminACMD"); // Redirect using React Router
      } else {
        throw new Error(data.message || "OTP verification failed.");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "OTP verification failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="private-admin-container" className="flex items-center justify-center min-h-screen bg-yellow-500">
      <div id="private-admin-card" className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 id="private-admin-title" className="text-2xl font-bold text-center mb-6">Private Admin</h2>

        {error && (
          <div id="error-message" className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div id="success-message" className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {!isOtpSent ? (
          <form id="private-key-form" onSubmit={handlePrivateKeySubmit}>
            <div id="private-key-input-container" className="mb-4">
              <input
                id="private-key-input"
                type="text"
                maxLength={25}
                placeholder="Private Key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <button
              id="submit-private-key-btn"
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 rounded-lg text-white
                ${
                  isLoading
                    ? "bg-yellow-300 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
            >
              {isLoading ? "Verifying Key..." : "Submit Private Key"}
            </button>
          </form>
        ) : (
          <>
            {qrCode && (
              <div id="qr-code-container" className="mb-4">
                <p id="qr-code-instruction" className="text-center mb-2">
                  Scan this QR code in Google Authenticator
                </p>
                <img id="qr-code-image" src={qrCode} alt="QR Code for 2FA" className="mx-auto" />
              </div>
            )}
            <form id="otp-form" onSubmit={handleOtpSubmit}>
              <div id="otp-input-container" className="mb-4">
                <input
                  id="otp-input"
                  type="text"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <button
                id="verify-otp-btn"
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 rounded-lg text-white
                  ${
                    isLoading
                      ? "bg-yellow-300 cursor-not-allowed"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
              >
                {isLoading ? "Verifying OTP..." : "Verify OTP"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PrivateAdmin;
