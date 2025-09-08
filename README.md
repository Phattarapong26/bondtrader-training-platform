# Bond Trader Course Management System

A comprehensive corporate training management platform with bond tracking capabilities, built with modern web technologies.

![System Overview](reports/selenium-screenshot-1.png)

## 🎯 Project Overview

This system manages professional training courses, user enrollments, and tracks employee training bonds for corporate environments. It provides a complete solution for HR departments to manage training programs and monitor employee commitments.

### Key Features

- **Multi-Role Authentication**: User, Admin, and Super Admin roles with JWT + 2FA
- **Course Management**: Full CRUD operations with multimedia support
- **Bond Tracking**: Monitor employee training commitments and periods
- **QR Code Integration**: Attendance tracking via QR codes
- **Automated Testing**: Comprehensive Robot Framework test suite
- **Containerized Deployment**: Docker-ready with CI/CD pipeline

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens + OTP verification
- **Testing**: Robot Framework + Selenium
- **DevOps**: Docker + Jenkins CI/CD

### System Components
```
├── clients/          # React frontend application
├── Server/           # Node.js backend API
├── tests/robot/      # Automated test suite
└── reports/          # Test artifacts and screenshots
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- MongoDB (if running locally)

### Production Deployment
```bash
# Clone the repository
git clone <repository-url>
cd BondTrader_CourseOnline-main

# Start the application
docker-compose down
docker-compose build
docker-compose up -d
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs

### Development Setup
```bash
# Backend setup
cd Server
npm install
npm start

# Frontend setup (new terminal)
cd clients
npm install
npm run dev
```

## 📱 User Interface Screenshots

### Login System
![Login Interface](screenshots/admin_login_20250420_213633.png)

### Admin Dashboard
![Admin Dashboard](reports/selenium-screenshot-17.png)

### User Course History
![User Interface](screenshots/admin_login_submit_20250420_185044.png)

---

## 🏆 Achievements

- Automated workflow: `.github/workflows/achievement-test-professional.yml`
- Professional Git branching and PR workflow
- Quickdraw Issue & YOLO merge (Pull Shark)

## 🔐 Authentication & Security

- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (User/Admin/SuperAdmin)
- **Two-factor authentication** for super admin accounts
- **Password encryption** using bcrypt
- **OTP verification** for password reset
- **Rate limiting** on authentication endpoints

## 📊 API Documentation

Complete API documentation is available at `/api-docs` when running the server. Key endpoints include:

### Authentication
- `POST /api/login` - User authentication
- `POST /api/signup` - User registration
- `POST /api/refresh-token` - Token refresh
- `GET /api/validate-token` - Token validation

### Course Management
- `GET /api/courses` - List all courses
- `POST /api/Admin/Add/NewCourses` - Create new course (Admin)
- `PUT /api/Admin/UpdateDetail/courses/:id` - Update course (Admin)
- `DELETE /api/Admin/Deleted/courses/:id` - Delete course (Admin)

### User Management
- `GET /api/user` - Get user profile
- `PUT /api/user/updateDetail` - Update user details
- `POST /api/user/change-password` - Change password

## 🧪 Testing

### Automated Testing with Robot Framework
```bash
# Run test suite
robot -d robot-reports tests/robot/present.robot

# Run specific test categories
robot -d robot-reports tests/robot/PositiveAdmin.robot
robot -d robot-reports tests/robot/NegativeAdmin.robot
```

### Test Coverage
- ✅ User authentication flows
- ✅ Admin course management
- ✅ Super admin operations
- ✅ Bond tracking functionality
- ✅ Error handling scenarios

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `Server/` directory:

```env
MONGODB_URI=mongodb://localhost:27017/Uknowmedatabase
PORT=3000
JWT_SECRET=your_jwt_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
OTP_SECRET=your_otp_secret_here
FRONTEND_URL=http://localhost:5173
```

### Database Schema

#### User Model
```typescript
{
  name: string;
  company: string;
  citizen_id: string;
  email: string;
  phone: string;
  profilePicture: string;
  bond_status: {
    start_date: Date;
    end_date: Date;
    status: string;
  };
  courses_enrolled: Array<{
    course_id: ObjectId;
    status: string;
    progress: number;
    start_date: Date;
    completion_date: Date | null;
  }>;
  role: string;
}
```

#### Course Model
```typescript
{
  title: string;
  description: string;
  details: string;
  duration_hours: number;
  max_seats: number;
  start_date: string;
  thumbnail: string;
  video: string;
  qr_code: string;
  trainingLocation: string;
}
```

## 🚀 CI/CD Pipeline

The project includes a Jenkins pipeline that:
- Builds Docker images
- Runs automated tests
- Deploys to staging/production
- Generates test reports

### Pipeline Stages
1. **Git Clone** - Fetch latest code
2. **Environment Setup** - Configure test environment
3. **Docker Build** - Build application images
4. **Deploy** - Start containers
5. **Test Execution** - Run Robot Framework tests
6. **Reporting** - Generate test artifacts

## 📈 Performance & Monitoring

- **Page load time**: < 3 seconds
- **Concurrent users**: Supports multiple simultaneous sessions
- **Database indexing**: Optimized queries for course and user data
- **Error logging**: Comprehensive error tracking and reporting

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test` (backend) and `robot tests/robot/` (E2E)
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for both frontend and backend
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

## 📝 License

This project is developed as a portfolio demonstration of full-stack development capabilities with enterprise-grade features.

## 🏆 Technical Highlights

- **Full-Stack TypeScript**: End-to-end type safety
- **Modern React Patterns**: Hooks, Context API, Custom hooks
- **RESTful API Design**: Clean, consistent endpoint structure
- **Database Optimization**: Proper indexing and query optimization
- **Security Best Practices**: JWT, bcrypt, rate limiting, CORS
- **Automated Testing**: E2E testing with screenshot capture
- **DevOps Ready**: Docker containerization with CI/CD pipeline
- **Documentation**: Comprehensive API docs and system documentation

---

**Developed by**: [Your Name]  
**Contact**: [Your Email]  
**Portfolio**: [Your Portfolio URL]