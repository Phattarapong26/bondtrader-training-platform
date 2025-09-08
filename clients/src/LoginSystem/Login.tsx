import React, { useState } from 'react';
import { UserPlus, Lock } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import LoginForm from './LoginForm';
import SignUpModal from './SignUpModal';
import RoleButton from './RoleButton';
import { useAuthContext } from '../hooks/AuthContext';

const EnhancedLogin: React.FC = () => {
    const { login } = useAuthContext();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [citizenId, setCitizenId] = useState('');
    const [phone, setPhone] = useState('');

    const handleRoleSelect = (role: string) => {
        setSelectedRole(role);
        setEmail('');
        setPassword('');
    };

    const apiClient = axios.create({
      baseURL: "http://localhost:3000/api",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/login', {
                email,
                password,
                role: selectedRole === 'ผู้ดูแลระบบ' ? 'admin' : 'user',
            });
            const { user, token, refreshToken, redirectInfo } = response.data;

            // Store user data and token in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(user));
            sessionStorage.setItem('jwtToken', token);
            sessionStorage.setItem('refreshToken', refreshToken);

            // Call login with user data and tokens
            login(token, refreshToken, user);

            // Check if user needs to change password
            if (user.password_changed === false) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'กรุณาเปลี่ยนรหัสผ่าน',
                    text: 'เพื่อความปลอดภัย กรุณาเปลี่ยนรหัสผ่านของคุณ',
                    confirmButtonText: 'ตกลง'
                });
                // Redirect to change password page
                navigate('/change-password');
                return;
            }

            await Swal.fire({
                icon: 'success',
                title: 'เข้าสู่ระบบสำเร็จ!',
                text: `ยินดีต้อนรับ ${user.name}`,
            });

            if (redirectInfo && redirectInfo.path) {
                navigate(redirectInfo.path);
            } else {
                console.error('Redirect path not found in response');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: error.response?.data.message || 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง',
                });
            }
        }
    };

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            // Validate citizenId format ก่อนส่งไป server
            if (!/^\d{13}$/.test(citizenId)) {
                await Swal.fire({
                    icon: 'error',
                    title: 'รูปแบบไม่ถูกต้อง',
                    text: 'กรุณากรอกเลขบัตรประชาชน 13 หลัก',
                });
                return;
            }
    
            const response = await axios.post('http://localhost:3000/api/signup', {
                name,
                company,
                citizenId,
                email,
                phone
            });
    
            setIsSignUpOpen(false);
            
            await Swal.fire({
                icon: 'success',
                title: 'สมัครสมาชิกสำเร็จ!',
                html: `
                    <p>การลงทะเบียนเสร็จสมบูรณ์</p>
                    <p><strong>อีเมล:</strong> ${email}</p>
                    <p><strong>รหัสผ่านเริ่มต้น:</strong> เลขบัตรประจำตัวประชาชนของคุณ</p>
                    <p class="text-sm text-gray-500">*กรุณาเปลี่ยนรหัสผ่านหลังจากเข้าสู่ระบบครั้งแรก</p>
                `,
                confirmButtonText: 'ตกลง'
            });
    
            // Reset form fields
            setName('');
            setCompany('');
            setCitizenId('');
            setEmail('');
            setPhone('');
    
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message;
                
                // แยกประเภท error messages
                switch (errorMessage) {
                    case 'duplicate_email':
                        await Swal.fire({
                            icon: 'error',
                            title: 'ไม่สามารถลงทะเบียนได้',
                            text: 'อีเมลนี้เคยลงทะเบียนไว้แล้ว กรุณาใช้อีเมลอื่น'
                        });
                        break;
                        
                    case 'duplicate_citizen_id':
                        await Swal.fire({
                            icon: 'error',
                            title: 'ไม่สามารถลงทะเบียนได้',
                            html: `
                                <p>เลขบัตรประชาชนนี้เคยลงทะเบียนไว้แล้ว</p>
                                <p class="text-sm text-red-500 mt-2">หากมีปัญหากรุณาติดต่อผู้ดูแลระบบ</p>
                            `,
                            confirmButtonText: 'ตกลง'
                        });
                        break;
                        
                    default:
                        await Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: error.response?.data?.detail || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง'
                        });
                }
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง'
                });
            }
        }
    };

    const handleForgetPassword = async () => {
      try {
        // Step 1: Get email input
        const { value: email, isConfirmed } = await Swal.fire({
          title: "Forgot Password",
          input: "email",
          inputLabel: "Enter your email",
          inputPlaceholder: "example@email.com",
          showCancelButton: true,
          confirmButtonText: "Request OTP",
          cancelButtonText: "Cancel",
          inputValidator: (value) => {
            if (!value) return "Please enter an email address.";
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return "Invalid email format.";
            return null;
          },
        });

        if (!isConfirmed || !email) return;

        // Step 2: Request OTP
        const otpResponse = await apiClient.post(
          "/user/forgetpassword/request-otp",
          { email }
        );

        await Swal.fire({
          icon: "success",
          title: "OTP Sent",
          text: "Check your email for the OTP.",
        });

        // Step 3: Verify OTP
        const { value: otp } = await Swal.fire({
          title: "Verify OTP",
          input: "text",
          inputLabel: "Enter the OTP sent to your email",
          inputPlaceholder: "XXXXXX",
          inputValidator: (value) => {
            if (!value) return "Please enter the OTP.";
            if (!/^\d{6}$/.test(value)) return "OTP must be a 6-digit number.";
            return null;
          },
        });

        if (!otp) return;

        // Step 4: New password
        const { value: newPassword } = await Swal.fire({
          title: "Set New Password",
          html: `
                <input type="password" id="password1" class="swal2-input" placeholder="New Password">
                <input type="password" id="password2" class="swal2-input" placeholder="Confirm New Password">
            `,
          focusConfirm: false,
          preConfirm: () => {
            const password1 = (
              document.getElementById("password1") as HTMLInputElement
            ).value;
            const password2 = (
              document.getElementById("password2") as HTMLInputElement
            ).value;

            if (!password1 || !password2) {
              Swal.showValidationMessage("Both password fields are required.");
              return false;
            }
            if (password1 !== password2) {
              Swal.showValidationMessage("Passwords do not match.");
              return false;
            }
            if (password1.length < 8) {
              Swal.showValidationMessage(
                "Password must be at least 8 characters."
              );
              return false;
            }
            return password1;
          },
        });

        if (!newPassword) return;

        // Step 5: Reset password
        await apiClient.post("/user/forgetpassword/reset-password", {
          email,
          otp,
          newPassword,
        });

        await Swal.fire({
          icon: "success",
          title: "Password Reset Successful",
          text: "You can now log in with your new password.",
        });
      } catch (error) {
        let errorMessage = "An error occurred. Please try again.";

        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status;
          if (status === 404) errorMessage = "Email not found.";
          else if (status === 401) errorMessage = "Invalid or expired OTP.";
          else errorMessage = error.response.data?.message || errorMessage;
        }

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
      }
    };
    
    
    

    return (
        <>
            <div id="login-container" className="bg-gradient-to-br from-white-100 to-yellow-100">
                <div id="login-header" className="flex justify-between items-center pt-6 mb-[-44px]">
                    <div id="header-left" className="bg-yellow-500 min-w-[200px] min-h-[68px]"></div>
                    <Link id="header-logo-link" to="/privateAdmin" className="flex items-center bg-yellow-500 w-[300px] min-h-[68px] pl-[70px] ">
                        <img id="header-logo" src="https://github.com/Phattarapong26/image/blob/main/new-2.png?raw=true" alt="Logo" className="h-12 object-cover" />
                    </Link>
                </div>
                <div id="login-content" className="flex flex-col items-center justify-center min-h-screen p-4 ">
                    <div id="login-card" className="bg-white bg-opacity-95 p-10 rounded-3xl shadow-2xl text-center max-w-md w-full transition-all duration-300 hover:shadow-xl" style={{ minWidth: '550px' }}>
                        <h5 id="login-title" className="text-3xl font-bold mb-14 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-600">
                            {selectedRole ? `เข้าสู่ระบบ ${selectedRole}` : 'เลือกบทบาทของคุณ'}
                        </h5>
                        {!selectedRole && (
                            <p id="role-select-prompt" className="mb-8 text-gray-600">กรุณาเลือกบทบาทเพื่อดำเนินการต่อ</p>
                        )}
                        <div id="role-buttons" className="flex justify-around mb-8 gap-6">
                            <RoleButton
                                role="ผู้ดูแลระบบ"
                                isSelected={selectedRole === 'ผู้ดูแลระบบ'}
                                onClick={() => handleRoleSelect('ผู้ดูแลระบบ')}
                            />
                            <RoleButton
                                role="ผู้ค้าตราสารหนี้"
                                isSelected={selectedRole === 'ผู้ค้าตราสารหนี้'}
                                onClick={() => handleRoleSelect('ผู้ค้าตราสารหนี้')}
                            />
                        </div>
                        {selectedRole && (
                            <LoginForm
                                selectedRole={selectedRole}
                                email={email}
                                setEmail={setEmail}
                                password={password}
                                setPassword={setPassword}
                                handleLogin={handleLogin}
                            />
                        )}
                    </div>
                    <div id="login-actions" className="mt-6 space-x-4">
                        {selectedRole === 'ผู้ค้าตราสารหนี้' && (
                            <button
                                id="signup-btn"
                                className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow transition-all duration-300 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                onClick={() => setIsSignUpOpen(true)}
                            >
                                <UserPlus className="inline-block mr-2 h-4 w-4" />
                                สมัครสมาชิก
                            </button>
                        )}
                        {selectedRole === 'ผู้ค้าตราสารหนี้' && (
                            <button
                                id="forgot-password-btn"
                                className="bg-white text-yellow-500 font-semibold py-2 px-4 rounded-lg shadow transition-all duration-300 hover:bg-purple-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                                onClick={handleForgetPassword}
                            >
                                <Lock className="inline-block mr-2 h-4 w-4" />
                                ลืมรหัสผ่าน
                            </button>
                        )}
                    </div>
                    <SignUpModal
                        isOpen={isSignUpOpen}
                        onClose={() => setIsSignUpOpen(false)}
                        name={name}
                        setName={setName}
                        email={email}
                        setEmail={setEmail}
                        company={company}
                        setCompany={setCompany}
                        citizenId={citizenId}
                        setCitizenId={setCitizenId}
                        phone={phone}
                        setPhone={setPhone}
                        handleSignUp={handleSignUp}
                    />
                </div>
            </div>
        </>
    );
};

export default EnhancedLogin;