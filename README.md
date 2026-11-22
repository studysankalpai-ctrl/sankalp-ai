# SANKALP AI — Your Personal AI University Exam Mentor

[![Stack](https://img.shields.io/badge/Stack-MERN%20(MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node)-indigo.svg)](https://github.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS%20v4-blue.svg)](https://tailwindcss.com)
[![AI](https://img.shields.io/badge/AI-Groq%20BYOK%20(No%20RAG)-purple.svg)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**SANKALP AI** is a complete, production-grade university examination preparation platform that empowers university students to understand their curriculum syllabus, study previous-year question papers (PYQs), identify high-yield topics, generate structured university answers (2, 5, 10, and 15 marks), practice questions, take mock examinations, and follow adaptive study schedules.

---

## 🌟 Key Features

### Student Interface (Zero Authentication Friction)
- **No Student Login or Registration**: Students instantly browse published university curriculums without mandatory onboarding or email barriers.
- **Dynamic Academic Library**: Google Drive / Notion-style folder explorer with breadcrumbs, PDF previews, and instant downloads.
- **Integrated PDF Reader**: In-browser PDF viewing with 1-click university answer generator buttons (2M, 5M, 10M, 15M).
- **AI Examination Mentor**: University professor tutoring in English, Hindi, and Hinglish. Answers are grounded in the active curriculum, while out-of-syllabus questions are clearly labeled `[Outside Current Syllabus]` and thoroughly answered.
- **Bring Your Own Key (BYOK)**: Students connect their personal Groq API key (`gsk_...`) held exclusively in browser session memory. Zero database key storage.
- **Important Topics Engine**: Topics ranked by 5-year historical question frequency and syllabus weightage.
- **Exam Predictions**: Predictive question lists with historical confidence categories and official preparation advisory disclaimers.
- **Question Practice Bank**: Filter by unit, difficulty, marks, and question type; toggle reveal model answers; bookmark questions.
- **Mock Examination Simulation**: Timed university exams with question navigators, flags, and automated AI grading.
- **Adaptive Study Planner**: Input target exam date and daily available hours to generate a realistic study schedule.
- **Revision Centre**: Quick revision notes, key definitions, last-minute checklists, and interactive concept flashcards.
- **Local Data Persistence**: Browser-local bookmarks, study history, and JSON export/import.

### Private Admin Dashboard (`/admin`)
- **Secure JWT Authentication**: Dedicated administrative credentials (`admin@sankalp.ai` / `admin123456`).
- **Dynamic Program Management**: Create and manage unlimited courses (MCA, MBA, BCA, B.Tech), semesters, and subjects.
- **Hierarchical Folder Explorer**: Full recursive folder CRUD with parent-child links.
- **Syllabus Version Control**: Upload semester syllabus PDFs, set the currently active official version, and auto-extract text.
- **Previous-Year Question Paper Management**: Upload annual/supplementary papers, configure 5-year analysis collections, and trigger automated question parsing.
- **Question Verification Console**: Review, correct marks, edit unit mappings, and verify questions extracted from PDFs.
- **AI Trend Analysis Generator**: Synthesize examination frequency patterns and review before publishing to students.
- **Disk Storage & Audit Logs**: Real-time storage breakdowns and security logging.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide React, Zustand, React Router v7 |
| **Backend** | Node.js v22, Express.js, Multer, Helmet, CORS, Express Rate Limit, JWT |
| **Database** | MongoDB v7+ via Mongoose ODM (Text Search Indexes) |
| **AI Integration** | Groq OpenAI-Compatible API (BYOK) with Context Injection (No RAG) |
| **Document Processing** | `pdf-parse` server-side text & question extraction |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Seed default admin and curriculum
npm run seed

# Start backend server (runs on http://127.0.0.1:5000)
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to frontend in a new terminal
cd frontend

# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev
```

Open **`http://localhost:5173`** in your browser to access SANKALP AI.

---

## 🔐 Default Admin Credentials
- **URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@sankalp.ai`
- **Password**: `admin123456`

---

## 📚 Documentation Reference
- [Product Vision & Functional Spec](docs/product.md)
- [Engineering Architecture & Non-RAG Strategy](docs/engineering.md)
- [Database Schema Reference](docs/database-schema.md)
- [UI/UX Design System](docs/ui.md)
- [Production Setup & Deployment Guide](docs/setup-guide.md)

---

## 📄 License
MIT License. Developed for university examination preparation excellence.
