#pip install pyotp

# OtpLibrary.py
import pyotp

class OtpLibrary:
    def get_otp(self, secret):
        totp = pyotp.TOTP(secret)
        return totp.now()
