from OtpLibrary import OtpLibrary

# สร้าง instance ของ OtpLibrary
otp_lib = OtpLibrary()

# กำหนด secret key (ควรเก็บไว้ในที่ปลอดภัย)
secret = "JBSWY3DPEHPK3PXP"

# สร้าง OTP
otp = otp_lib.get_otp(secret)
print(f"OTP ที่ได้คือ: {otp}") 