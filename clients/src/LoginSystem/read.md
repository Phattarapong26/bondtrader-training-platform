"Please fix only the database errors and the component issues in the following MERN stack code. Do not modify any other parts of the code that are unrelated to these two sections.

Code: [app.post('/api/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    let user;
    if (role === 'admin') {
      client = new MongoClient('mongodb://localhost/Uknowmedatabase');
      const adminsCollection = db.collection('admins');
      user = await adminsCollection.findOne({ email });
    } else {
      client = new MongoClient('mongodb://localhost/Uknowmedatabase');
      await client.connect();
      const database = client.db('Uknowmedatabase');
      const users = database.collection('users');
      user = await users.findOne({ email });
      await client.close();
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user has a password hash
    if (!user.password) {
      console.error('User found but password hash is missing:', email);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Check password
    try {
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

    let redirectInfo;
    if (role === 'admin') {
      redirectInfo = {
        path: '/AdminDashboard',
        permissions: user.permissions || [],
      };
    } else {
      redirectInfo = {
        path: '/UserHomepage',
        enrolledCourses: user.courses_enrolled || [],
      };
    }

    // Send user data (excluding sensitive information)
    const userData = {
      id: user._id,
      email: user.email,
      role: role,
      // Add any other non-sensitive user data you want to include
    };
    res.json({ message: 'Login successful', user: userData, redirectInfo });
  } catch (bcryptError) {
    console.error('Bcrypt comparison error:', bcryptError);
    return res.status(500).json({ message: 'Internal server error' });
  }
} catch (error) {
  console.error('Error logging in:', error);
  res.status(500).json({ message: 'Internal server error' });
}
});.import React from 'react';
import { UserCog, ChartLine } from 'lucide-react';

interface RoleButtonProps {
  role: 'ผู้ดูแลระบบ' | 'ผู้ค้าตราสารหนี้';
  isSelected: boolean;
  onClick: () => void;
}

const RoleButton: React.FC<RoleButtonProps> = ({ role, isSelected, onClick }) => {
  const Icon = role === 'ผู้ดูแลระบบ' ? UserCog : ChartLine;
  const color = role === 'ผู้ดูแลระบบ' ? 'blue' : 'purple';

  return (
    <button
      className={`role-button text-${color}-500 border-2 border-${color}-500 rounded-2xl p-6 w-40 h-40 flex flex-col items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 ${
        isSelected ? `bg-${color}-500 text-white shadow-lg` : `hover:bg-${color}-100`
      }`}
      onClick={onClick}
    >
      <Icon className="h-16 w-16 mb-2" />
      <span className="text-sm font-semibold">{role}</span>
    </button>
  );
};

export default RoleButton;,import React, { useState } from 'react';
import { UserCog, ChartLine, UserPlus, Lock } from 'lucide-react';
import axios from 'axios';
import LoginForm from './LoginForm';
import SignUpModal from './SignUpModal';

const EnhancedLogin: React.FC = () => {
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

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/login', {
                email,
                password,
                role: selectedRole === 'ผู้ดูแลระบบ' ? 'admin' : 'user'
            });
            const { user, redirectInfo } = response.data;
            
            localStorage.setItem('user', JSON.stringify(user));
            
            alert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ${user.name}`);
          
            // ใช้ redirectInfo.path แทน redirect.path
            if (redirectInfo && redirectInfo.path) {
                window.location.href = redirectInfo.path;
            } else {
                console.error('Redirect path not found in response');
                // จัดการกรณีที่ไม่มี redirect path
            }
        } catch (error) {
            // จัดการข้อผิดพลาด
        }
    };

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/signup', {
                name,
                company,
                citizenId,
                email,
                phone,
                password,
                role: 'user'  // เปลี่ยนจาก 'ผู้ค้าตราสารหนี้' เป็น 'user'
            });
            setIsSignUpOpen(false);
            alert('สมัครสมาชิกสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                alert(`เกิดข้อผิดพลาด: ${error.response.data.message}`);
            } else {
                alert('เกิดข้อผิดพลาด: ไม่สามารถสมัครสมาชิกได้ กรุณาลองอีกครั้ง');
            }
        }
    };

    const handleForgetPassword = async () => {
        const email = prompt('กรุณากรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน:');
        if (email) {
            try {
                await axios.post('http://localhost:3000/api/reset-password-request', { email });
                alert('ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบอีเมลของคุณ');
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    alert(`เกิดข้อผิดพลาด: ${error.response.data.message}`);
                } else {
                    alert('เกิดข้อผิดพลาด: ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ กรุณาลองอีกครั้ง');
                }
            }
        }
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
            <div className="bg-white bg-opacity-95 p-10 rounded-3xl shadow-2xl text-center max-w-md w-full transition-all duration-300 hover:shadow-xl" style={{ minWidth: '550px' }}>
                <h5 className="text-3xl font-bold mb-14 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                    {selectedRole ? `เข้าสู่ระบบ${selectedRole}` : 'เลือกบทบาทของคุณ'}
                </h5>
                {!selectedRole && (
                    <p className="mb-8 text-gray-600">กรุณาเลือกบทบาทเพื่อดำเนินการต่อ</p>
                )}
                <div className="flex justify-around mb-8 gap-6">
                    <button
                        className={`role-button text-blue-500 border-2 border-blue-500 rounded-2xl p-6 w-40 h-40 flex flex-col items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 ${selectedRole === 'ผู้ดูแลระบบ' ? 'bg-blue-500 text-white shadow-lg' : 'hover:bg-blue-100'}`}
                        onClick={() => handleRoleSelect('ผู้ดูแลระบบ')}
                    >
                        <UserCog className="h-16 w-16 mb-2" />
                        <span className="text-sm font-semibold">ผู้ดูแลระบบ</span>
                    </button>
                    <button
                        className={`role-button text-purple-500 border-2 border-purple-500 rounded-2xl p-6 w-40 h-40 flex flex-col items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 ${selectedRole === 'ผู้ค้าตราสารหนี้' ? 'bg-purple-500 text-white shadow-lg' : 'hover:bg-purple-100'}`}
                        onClick={() => handleRoleSelect('ผู้ค้าตราสารหนี้')}
                    >
                        <ChartLine className="h-16 w-16 mb-2" />
                        <span className="text-sm font-semibold">ผู้ค้าตราสารหนี้</span>
                    </button>
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
            <div className="mt-6 space-x-4">
                {selectedRole === 'ผู้ค้าตราสารหนี้' && (
                    <button
                        className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow transition-all duration-300 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        onClick={() => setIsSignUpOpen(true)}
                    >
                        <UserPlus className="inline-block mr-2 h-4 w-4" />
                        สมัครสมาชิก
                    </button>
                )}
                <button
                    className="bg-white text-purple-500 font-semibold py-2 px-4 rounded-lg shadow transition-all duration-300 hover:bg-purple-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    onClick={handleForgetPassword}
                >
                    <Lock className="inline-block mr-2 h-4 w-4" />
                    ลืมรหัสผ่าน
                </button>
            </div>
            <SignUpModal
                isOpen={isSignUpOpen}
                onClose={() => setIsSignUpOpen(false)}
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                company={company}
                setCompany={setCompany}
                citizenId={citizenId}
                setCitizenId={setCitizenId}
                phone={phone}
                setPhone={setPhone}
                handleSignUp={handleSignUp}
            />
        </div>
    );
};

export default EnhancedLogin;]
Error Message (Database): [ไม่สามารถดึงข้อมูลส่วนของadmin จากฐานข้อมูล admins นี่คือตัวอย่างชุดข้อมูลใน admins table(/** 
* Paste one or more documents here
*/
{
  "name": "John Doe",
  "idCard": "1234567890123",
  "employeeId": "EMP001",
  "phone": "081-234-5678",
  "email": "john.doe@example.com",
  "roles": [
    "superadmin",
    "admin"
  ]
}),]
Error Message (Component): [Insert the exact error message related to the component]
Database Schema: [Insert the schema that is being used]
Fix only:

The database interaction issues, ensuring they match the provided schema.
The component-related issues so that it functions correctly.
Avoid changing any other parts of the code and provide explanations of the changes you made."


อธิบาย flow การทำงานของ EnhancedLogin,LoginForm,RoleButton,SignUpModal