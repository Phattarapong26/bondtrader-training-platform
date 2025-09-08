import React from 'react';
import { LogIn } from 'lucide-react';

interface LoginFormProps {
  selectedRole: string;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  selectedRole,
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
}) => (
  <form id="login-form" onSubmit={handleLogin} className="fade-in space-y-6">
    <div id="email-input-container">
      <label htmlFor="email" className="block mb-2 text-left text-gray-700 font-semibold">อีเมล</label>
      <input
        id="email-input"
        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-300"
        placeholder="your@email.com"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>
    <div id="password-input-container">
      <label htmlFor="password" className="block mb-2 text-left text-gray-700 font-semibold">
        {selectedRole === 'ผู้ดูแลระบบ' ? 'รหัสผ่าน' : 'รหัสผ่าน'}
      </label>
      <input
        id="password-input"
        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-300"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>
    <button
      id="login-submit-btn"
      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 rounded-lg transition-all duration-300 ease-in-out hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      type="submit"
    >
      <LogIn className="inline-block mr-2 h-5 w-5" />
      {selectedRole === 'ผู้ดูแลระบบ' ? 'เข้าสู่ระบบผู้ดูแล' : 'เข้าสู่ระบบผู้ค้า'}
    </button>
  </form>
);

export default LoginForm;