# API Specification
Version 1.0 | April 11, 2025

## Base URL
```
http://localhost:8000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Common Response Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## API Endpoints

### 1. Authentication & User Management

#### 1.1 User Login
```http
POST /login
```

**Description:** Authenticate user and get access token

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:** (all fields mandatory)
```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "role": "user"  // or "admin"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `400`: Missing required fields
- `500`: Server error

#### 1.2 User Registration
```http
POST /signup
```

**Description:** Register a new user account

**Request Body:** (all fields mandatory except profilePicture)
```json
{
  "name": "John Doe",
  "company": "Example Corp",
  "citizen_id": "1234567890123",
  "email": "user@example.com",
  "phone": "0812345678",
  "password": "yourpassword",
  "profilePicture": "file" // optional, multipart/form-data
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": "user_id"
}
```

**Error Responses:**
- `400`: Invalid input data
- `409`: Email already exists
- `500`: Server error

#### 1.3 Validate Token
```http
GET /validate-token
```

**Description:** Validate JWT token and get user information

**Headers:** Bearer Token required

**Success Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `401`: Invalid token
- `500`: Server error

#### 1.4 Refresh Token
```http
POST /refresh-token
```

**Description:** Get new access token using refresh token

**Request Body:** (mandatory)
```json
{
  "token": "refresh-token-string"
}
```

**Success Response (200):**
```json
{
  "token": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

**Error Responses:**
- `401`: Invalid refresh token
- `500`: Server error

### 2. User Operations

#### 2.1 Get User Profile
```http
GET /user
```

**Description:** Get current user's profile
**Headers:** Bearer Token required

**Success Response (200):**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "user@example.com",
  "company": "Example Corp",
  "phone": "0812345678",
  "profilePicture": "url"
}
```

#### 2.2 Update User Profile
```http
POST /user/update/profile
```

**Description:** Update user's profile picture
**Headers:** Bearer Token required
**Content-Type:** multipart/form-data

**Request Body:**
```
profilePicture: File (mandatory)
```

#### 2.3 Update User Details
```http
PUT /user/updateDetail
```

**Description:** Update user's personal information
**Headers:** Bearer Token required

**Request Body:** (all fields optional)
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "0812345678"
}
```

#### 2.4 Change Password
```http
POST /user/change-password
```

**Description:** Change user's password
**Headers:** Bearer Token required

**Request Body:** (all fields mandatory)
```json
{
  "oldPassword": "current-password",
  "newPassword": "new-password"
}
```

#### 2.5 Request Password Reset OTP
```http
POST /user/forgetpassword/request-otp
```

**Description:** Request OTP for password reset

**Request Body:** (mandatory)
```json
{
  "email": "user@example.com"
}
```

#### 2.6 Reset Password with OTP
```http
POST /user/forgetpassword/reset-password
```

**Description:** Reset password using OTP

**Request Body:** (all fields mandatory)
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "new-password"
}
```

### 3. Course Management

#### 3.1 Get All Courses
```http
GET /courses
```

**Description:** Retrieve list of all available courses

**Success Response (200):**
```json
[
  {
    "id": "course_id",
    "title": "Course Title",
    "description": "Course Description",
    "duration_hours": 10,
    "max_seats": 50,
    "start_date": "2025-05-01"
  }
]
```

#### 3.2 Get Course by ID
```http
GET /courses/:id
```

**Description:** Get detailed information about a specific course
**Headers:** Bearer Token required

**Path Parameters:**
- `id` (mandatory): Course ID

#### 3.3 Get User's Enrolled Courses
```http
GET /v1/user/courses/:id
```

**Description:** Get courses enrolled by a specific user
**Headers:** Bearer Token required

**Path Parameters:**
- `id` (mandatory): User ID

### 4. Admin Operations

#### 4.1 Course Management

##### 4.1.1 Add New Course
```http
POST /Admin/Add/NewCourses
```

**Description:** Create a new training course
**Headers:** Bearer Token required
**Content-Type:** multipart/form-data

**Request Body:** (all fields mandatory)
```
title: string
description: string
details: string
duration_hours: number
max_seats: number
start_date: string
thumbnail: file
video: file
qr_code: file
trainingLocation: string
```

**Success Response (201):**
```json
{
  "message": "Course created successfully",
  "courseId": "new_course_id"
}
```

##### 4.1.2 Update Course
```http
PUT /Admin/UpdateDetail/courses/:id
```

**Description:** Update course details and materials
**Headers:** Bearer Token required
**Content-Type:** multipart/form-data

**Path Parameters:**
- `id` (mandatory): Course ID

**Request Body:** (all fields optional)
```
title: string
description: string
details: string
duration_hours: number
max_seats: number
start_date: string
thumbnail: file
video: file
qr_code: file
trainingLocation: string
```

##### 4.1.3 Delete Course
```http
DELETE /Admin/Deleted/courses/:id
```

**Description:** Remove a course from the system
**Headers:** Bearer Token required

**Path Parameters:**
- `id` (mandatory): Course ID

#### 4.2 User Management

##### 4.2.1 Get All Users
```http
GET /Admin/Get/users
```

**Description:** Retrieve list of all users
**Headers:** Bearer Token required

##### 4.2.2 Get User by ID
```http
GET /Admin/Get/user/by/:id
```

**Description:** Get detailed user information
**Headers:** Bearer Token required

**Path Parameters:**
- `id` (mandatory): User ID

##### 4.2.3 Update User Status and Bond
```http
PUT /Admin/Update/users/Status&EndDate/:id
```

**Description:** Update user's status and bond end date
**Headers:** Bearer Token required

**Path Parameters:**
- `id` (mandatory): User ID

**Request Body:** (all fields mandatory)
```json
{
  "status": "active",
  "endDate": "2025-12-31"
}
```

##### 4.2.4 Check Course Participants
```http
GET /Admin/Check/participants/:courseId
```

**Description:** Get list of participants for a specific course
**Headers:** Bearer Token required

**Path Parameters:**
- `courseId` (mandatory): Course ID

##### 4.2.5 Update User Course Status
```http
PUT /Admin/update/UserStatusCourse
```

**Description:** Update status of participants in a course
**Headers:** Bearer Token required

**Request Body:** (all fields mandatory)
```json
{
  "courseId": "course_id",
  "participants": [
    {
      "participantId": "user_id",
      "status": "completed"
    }
  ]
}
```

##### 4.2.6 Check User Course History
```http
GET /Admin/Check/user/HistoryCourses/:userId
```

**Description:** Get user's course enrollment history
**Headers:** Bearer Token required

**Path Parameters:**
- `userId` (mandatory): User ID

### 5. Super Admin Operations

#### 5.1 Admin Management

##### 5.1.1 Add New Admin
```http
POST /SuperAdmin/Add/admins
```

**Description:** Create new admin account
**Headers:** Bearer Token required

**Request Body:** (all fields mandatory except roles)
```json
{
  "name": "Admin Name",
  "idCard": "1234567890123",
  "employeeId": "EMP123",
  "phone": "0812345678",
  "email": "admin@example.com",
  "roles": ["admin"],  // optional
  "password": "adminpass"
}
```

##### 5.1.2 Get All Admins
```http
GET /SuperAdmin/Get/admins
```

**Description:** List all admin accounts
**Headers:** Bearer Token required

##### 5.1.3 Update Admin
```http
PUT /SuperAdmin/Update/admins/:id
```

**Description:** Update admin account details
**Headers:** Bearer Token required

**Path Parameters:**
- `id` (mandatory): Admin ID

**Request Body:** (all fields optional)
```json
{
  "name": "Admin Name",
  "phone": "0812345678",
  "email": "admin@example.com",
  "roles": ["admin"]
}
```

##### 5.1.4 Delete Admin
```http
DELETE /SuperAdmin/Deleted/admins/:id
```

**Description:** Remove admin account
**Headers:** Bearer Token required

**Path Parameters:**
- `id` (mandatory): Admin ID

#### 5.2 Two-Factor Authentication

##### 5.2.1 Setup 2FA
```http
POST /SuperAdmin/Login/verify/setup-2fa
```

**Description:** Configure two-factor authentication

**Request Body:** (mandatory)
```json
{
  "email": "admin@example.com"
}
```

##### 5.2.2 Super Admin Login
```http
POST /SuperAdmin/Login
```

**Description:** Authenticate super admin with 2FA support

**Request Body:** (all fields mandatory)
```json
{
  "email": "admin@example.com",
  "password": "adminpass"
}
```

**Success Response (200):**
```json
{
  "message": "2FA required",
  "requireOTP": true
}
```
or
```json
{
  "token": "jwt-token",
  "requireOTP": false
}
```

##### 5.2.3 Verify OTP
```http
POST /SuperAdmin/Login/verifyOTP
```

**Description:** Verify OTP for two-factor authentication

**Request Body:** (all fields mandatory)
```json
{
  "email": "admin@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt-token"
}
```

### Date Management Endpoints

#### Format Date
```http
POST /format
```

**Description:** Format a date according to specified format
**Content-Type:** application/json

**Request Body:**
```json
{
  "date": "string",     // Date to format
  "format": "string"    // Desired format (e.g., 'YYYY-MM-DD')
}
```

**Success Response (200):**
```json
{
  "formattedDate": "string"
}
```

#### Calculate Age
```http
POST /calculateAge
```

**Description:** Calculate age from birthdate
**Content-Type:** application/json

**Request Body:**
```json
{
  "birthDate": "string"  // Birthdate in any valid date format
}
```

**Success Response (200):**
```json
{
  "age": 25  // Age in years
}
```

#### Calculate Days Until Renewal
```http
POST /daysUntilRenewal
```

**Description:** Calculate days remaining until renewal date
**Content-Type:** application/json

**Request Body:**
```json
{
  "renewalDate": "string"  // Renewal date in any valid date format
}
```

**Success Response (200):**
```json
{
  "daysRemaining": 30  // Number of days until renewal
}
```

### Additional User Endpoints

#### Get Course Roadmap
```http
GET /user/CourseRoadmap
```

**Description:** Get user's course learning roadmap
**Headers:** Bearer Token required

**Success Response (200):**
```json
[
  {
    "courseId": "string",
    "title": "string",
    "description": "string",
    "status": "string",     // e.g., "Enrolled", "Completed"
    "progress": 75          // Progress percentage (0-100)
  }
]
```

#### Get Course QR Code
```http
GET /user/course-qr/{courseId}
```

**Description:** Get QR code for a specific course
**Headers:** Bearer Token required

**Path Parameters:**
- `courseId` (string, required): ID of the course

**Success Response (200):**
```json
{
  "qr_code": "string"  // URL of the QR code image
}
```

#### Get User Profile Picture
```http
GET /user/profile-picture/{userId}
```

**Description:** Get user's profile picture
**Headers:** Bearer Token required

**Path Parameters:**
- `userId` (string, required): ID of the user

**Success Response (200):**
- Returns the profile picture file

#### Get All Users
```http
GET /user/users
```

**Description:** Get list of all users
**Headers:** Bearer Token required

**Success Response (200):**
```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
]
```

#### Verify User Header
```http
GET /user/CheckUserHeader/verify
```

**Description:** Verify user session and get profile header information
**Headers:** Bearer Token required

**Success Response (200):**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "profilePicture": "string"
  }
}
```

#### Request Password Reset OTP
```http
POST /user/forgetpassword/request-otp
```

**Description:** Request OTP for password reset
**Content-Type:** application/json

**Request Body:**
```json
{
  "email": "string"
}
```

**Success Response (200):**
```json
{
  "message": "OTP sent successfully"
}
```

#### Reset Password with OTP
```http
POST /user/forgetpassword/reset-password
```

**Description:** Reset password using OTP
**Content-Type:** application/json

**Request Body:**
```json
{
  "email": "string",
  "otp": "string",
  "newPassword": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

### Additional Course Endpoints

#### Get Course by ID
```http
GET /courses/{id}
```

**Description:** Get detailed information about a specific course
**Headers:** Bearer Token required

**Path Parameters:**
- `id` (string, required): ID of the course

**Success Response (200):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "duration_hours": "number",
  "max_seats": "number",
  "start_date": "string",
  "trainingLocation": "string"
}
```

#### Get All Courses
```http
GET /courses
```

**Description:** Get list of all available courses

**Success Response (200):**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "duration_hours": "number",
    "max_seats": "number",
    "start_date": "string",
    "trainingLocation": "string"
  }
]
```

#### Get User's Courses
```http
GET /v1/user/courses/{id}
```

**Description:** Get courses enrolled by a specific user
**Headers:** Bearer Token required

**Path Parameters:**
- `id` (string, required): ID of the user

**Success Response (200):**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  },
  "courses": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "string",
      "progress": "number"
    }
  ]
}
```

## Data Models

### User Model
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

### Course Model
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

### Admin Model
```typescript
{
  name: string;
  idCard: string;
  employeeId: string;
  phone: string;
  email: string;
  roles: string[];
  password: string;
}
```

## Security
- All protected endpoints require JWT authentication
- Super Admin operations require 2FA
- File uploads are validated for type and size
- Passwords are hashed using bcrypt
- Rate limiting on authentication endpoints
- CORS is configured for approved domains only

## Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```