<div align="center">

#  SECUREEXAM-AI
## SMART AI-BASED ONLINE EXAMINATION PLATFORM

### AI-Powered Secure Online Examination System with Smart Proctoring and Analytics

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![Node](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Framework-Express-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

###  Final Year B.Tech Computer Science Engineering Project

SecureExam-AI is a modern AI-assisted online examination platform that provides secure exam conduction, intelligent monitoring, automated evaluation, and advanced administrative analytics.

</div>

---

#  Table of Contents

- Introduction
- Features
- Technology Stack
- Project Structure
- Installation
- Environment Variables
- System Workflow
- API Endpoints
- AI Proctoring
- Screenshots
- Future Scope
- Contributors

---

#  Introduction

SecureExam-AI is a web-based online examination platform designed to conduct secure online assessments.

The platform provides:

- Secure Authentication
- Online Examination
- AI-Based Proctoring
- Automatic Evaluation
- Result Management
- Admin Analytics
- Excel Report Generation

---

#  Features

##  Student Module

- Student Registration
- Secure Login
- JWT Authentication
- View Available Exams
- Attempt Online Exams
- Fullscreen Exam Mode
- Live Timer
- Automatic Submission
- AI Monitoring
- View Results
- Result History
- Profile Management

---

##  Admin Module

- Admin Dashboard
- Create Exams
- Edit Exams
- Delete Exams
- Add Questions
- Manage Questions
- View Students
- View Attempts
- View Results
- Analytics Dashboard
- Export Results
- Download Excel Reports

---

##  AI Proctoring

- Face Monitoring
- Fullscreen Detection
- Tab Switching Detection
- Violation Counter
- Auto Submission
- Browser Monitoring

---

#  System Architecture

```
Students/Admin
      │
      ▼
React + Vite Frontend
      │
      ▼
JWT Authentication
      │
      ▼
Express REST APIs
      │
      ▼
MongoDB Database
      │
      ▼
Results & Analytics
```

---

#  Technology Stack

| Technology | Usage |
|-----------|--------|
| React + Vite | Frontend |
| Tailwind CSS | UI |
| React Router | Routing |
| Axios | API Calls |
| Node.js | Backend |
| Express.js | REST API |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password Encryption |
| ExcelJS | Excel Export |
| Recharts | Analytics |

---

#  Project Structure

```
SecureExam-AI/

├── frontend/
│
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── layouts/
│
├── backend/
│
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
│
├── docs/
│
├── screenshots/
│
└── README.md
```

---

#  Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/SecureExam-AI.git

cd SecureExam-AI
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## Backend Setup

```bash
cd backend

npm install

npm start
```

or

```bash
npm run dev
```

---

#  Environment Variables

Create:

```
backend/.env
```

```
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET_KEY
```

---

#  REST APIs

## Authentication

```
POST /api/auth/register

POST /api/auth/login
```

---

## Exams

```
GET /api/exams

POST /api/exams

PUT /api/exams/:id

DELETE /api/exams/:id
```

---

## Questions

```
POST /api/questions

GET /api/questions/:examId

PUT /api/questions/:id

DELETE /api/questions/:id
```

---

## Results

```
GET /api/results

GET /api/results/exam/:id
```

---

## Admin

```
GET /api/admin/stats
```

---

## Export

```
GET /api/export/excel/:examId
```

---

#  Student Workflow

```
Register

↓

Login

↓

Dashboard

↓

View Exams

↓

Attempt Exam

↓

AI Monitoring

↓

Submit Exam

↓

View Results
```

---

#  Admin Workflow

```
Login

↓

Dashboard

↓

Create Exam

↓

Add Questions

↓

Manage Exams

↓

View Results

↓

Analytics

↓

Export Reports
```

---

#  AI Proctoring Workflow

```
Start Exam

↓

Enable Camera

↓

Track Student

↓

Detect Tab Switch

↓

Monitor Fullscreen

↓

Count Violations

↓

Auto Submit
```

---

#  Analytics

Admin Dashboard provides:

- Total Exams
- Total Students
- Total Questions
- Total Attempts
- Student Performance
- Score Distribution
- Analytics Reports

---

#  Excel Export

Admin can export:

- Student Name
- Email
- Exam
- Score
- Percentage
- Submission Date

Generated using ExcelJS.

---

#  Security Features

 JWT Authentication

 Password Encryption

 Protected Routes

 Role Based Access

 Fullscreen Detection

 Tab Switching Detection

 AI Monitoring

---

#  Project Screenshots

## Home Page

![Home](screenshots/home.png)

---

## Student Dashboard

![Student](screenshots/student-dashboard.png)

---

## Admin Dashboard

![Admin](screenshots/admin-dashboard.png)

---

## Exam Page

![Exam](screenshots/exam-page.png)

---

## Results

![Results](screenshots/results.png)

---

#  Future Enhancements

- Live Video Proctoring

- Voice Detection

- Multiple Face Detection

- OTP Authentication

- Email Notifications

- AI Cheating Detection

- Mobile Application

- Cloud Deployment

- Certificate Generation

---

#  Documentation

Project documentation includes:

- System Architecture
- DFD Level 0
- DFD Level 1
- ER Diagram
- Use Case Diagram
- Database Schema
- API Documentation

---

#  Contributors

## Developer

**Pappu**

B.Tech Computer Science Engineering

---

#  License

This project is licensed under the MIT License.

---

<div align="center">

##  If you like this project, don't forget to star the repository!

### SECUREEXAM-AI
### SMART AI-BASED ONLINE EXAMINATION PLATFORM

🔒 Secure | 🤖 AI-Powered | 📊 Analytics | 📚 Smart Assessment

Built with ❤️ using React, Node.js, Express, MongoDB, and AI.

</div>
