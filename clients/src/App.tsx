import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthContext';
import { useAuth } from './hooks/useAuth';
import './index.css';
import './App.css';
import UserHomepage from './UserInterface/home/UserHomepage';
import AboutCourse from './UserInterface/Course/AboutCourse';
import CourseRoadMAP from './AdminInterface/CourseRoadMAP/CourseRoadMAP';
import AdminDashboard from './AdminInterface/dashboard/AdminDashboard';
import EnhancedLogin from './LoginSystem/Login';
import MainProduct from './AdminInterface/ProductMD/MainProduct';
import AdminACMD from './AdminCreateAccoutOnly/AdminACMD';
import CourseRoadUser from './UserInterface/home/CourseRoadUser';
import AboutCourseAdmin from './AdminInterface/dashboard/AboutCourseAdmin';
import DataBondTrade from './AdminInterface/CourseRoadMAP/DataBondTrade';
import PrivateAdmin from './PrivateAdmin/PrivateAdmin';

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<EnhancedLogin />} />
          <Route path="/" element={<ProtectedRoute element={<UserHomepage />} />} />

          {/* <Route path="/UserHomepage" element={<ProtectedRoute element={<UserHomepage />} />} /> */}
          <Route path="/UserHomepage" element={<UserHomepage />} />

          <Route path="/AboutCourse/:id" element={<ProtectedRoute element={<AboutCourse />} />} />
          <Route path="/CourseRoadMAP" element={<ProtectedRoute element={<CourseRoadMAP />} />} />
          <Route path="/CourseRoadUser" element={<ProtectedRoute element={<CourseRoadUser />} />} />
          <Route path="/AdminDashboard" element={<ProtectedRoute element={<AdminDashboard />} />} />
          <Route path="/MainProduct" element={<ProtectedRoute element={<MainProduct user={user} />} />} />
          <Route path="/AdminACMD" element={<ProtectedRoute element={<AdminACMD />} />} />
          <Route path="/AboutCourseAdmin/:id" element={<ProtectedRoute element={<AboutCourseAdmin />} />} />
          <Route path="/DataBondTrade" element={<ProtectedRoute element={<DataBondTrade />} />} />
          <Route path="/PrivateAdmin" element={<PrivateAdmin />}/>
         
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
