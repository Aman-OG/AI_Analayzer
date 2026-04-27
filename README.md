# 🧠 AI Resume Analyzer - Complete Project Documentation

Welcome to the **AI Resume Analyzer**, an enterprise-grade recruitment and candidate screening platform. This application leverages the power of Large Language Models (LLMs) to automate the tedious process of reading, parsing, and scoring resumes, allowing hiring teams to focus on interviewing the best talent.

This document serves as the complete technical and functional blueprint of the project.

---

## 🌟 1. Project Overview & Value Proposition

The AI Resume Analyzer solves a fundamental problem in recruitment: the manual review of hundreds of unstructured resumes. By utilizing a cutting-edge AI approach (Groq's fast inference for high-volume screening and deep interview prep), this platform:
- **Reduces Time-to-Hire**: Screens 100s of resumes in seconds.
- **Reduces Human Bias**: Evaluates candidates strictly against predefined job criteria.
- **Improves Quality of Hire**: Provides detailed, actionable justifications for every score, highlighting "warning flags" and "missing skills" that humans might miss.

---

## 🚀 2. Deep Dive: Core Features

### 📋 Intelligent Job Management
- **Custom Selection Criteria**: Define jobs not just by a description, but by explicit "Must-Have Skills" and "Focus Areas".
- **Database Persistence**: Jobs are saved securely to Supabase, associated specifically with the authenticated recruiter's user ID.

### 📥 High-Performance Resume Ingestion
- **Bulk Upload**: Drag-and-drop support for bulk PDF and DOCX uploads.
- **Deduplication Engine**: Calculates an MD5 hash of the file buffer on upload. If an identical file was already analyzed for a specific job, the backend instantly reuses the completed analysis, saving AI tokens and returning results in milliseconds.
- **Format Agnostic**: Utilizes `pdf-parse` for PDFs and `mammoth` for DOCX to reliably extract raw text regardless of the visual layout.

### 🤖 The AI Analysis Pipeline
- **Real-Time Scoring**: Extracted text is fed to Groq (running `llama3-8b-8192` for blazing-fast token generation).
- **Structured JSON Output**: The AI is strictly prompted to return a JSON schema containing:
  - `score` (1-10)
  - `justification` (Why the score was given)
  - `strengths` (Array of matched skills)
  - `missing_skills` (Crucial missing elements)
  - `warning_flags` (Employment gaps, generic descriptions, etc.)
- **Asynchronous Processing**: Resumes are initially marked as `processing`. The UI uses a custom `useResumePolling` hook to fetch updates, providing a seamless, real-time experience as AI responses stream into the database.

### 🎯 Candidate Management & Workflow
- **Tagging & Tracking**: Move candidates through workflow stages: `Applied`, `Shortlisted`, `Interviewed`, `Rejected`. Bulk tag updates are supported.
- **Pinning**: Important candidates can be pinned to the top of the list.
- **Top Performer Highlighting**: The system automatically highlights the top 20% of candidates based on dynamic score thresholds.

### 🎙️ AI Interview Guide Generation
- **Deep Candidate Comparison**: Select multiple top candidates and generate a bespoke Interview Guide.
- **Groq Powered**: This feature utilizes Groq's high-performance inference to look holistically at the selected candidates, generating specific technical and behavioral questions tailored to probe their unique weaknesses and verify their claimed strengths.

---

## 🏗️ 3. Architecture & Tech Stack

The platform is a decoupled Client/Server architecture.

### Frontend (`/client`)
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite (esbuild) for optimal development speed.
- **Styling**: Tailwind CSS. The UI features a bespoke "Tech Premium" design system characterized by deep ocean blues, slate backgrounds, and meticulous glassmorphism effects. **No generic component libraries**—all UI components are custom-built for maximum flexibility and accessibility.
- **State & Routing**: Context API for global auth state; `react-router-dom` for navigation.

### Backend (`/server`)
- **Runtime**: Node.js + Express.js.
- **Database & Auth**: Supabase (PostgreSQL).
- **File Storage**: Supabase Storage Buckets (files are temporarily uploaded, processed, and their URLs stored).
- **AI SDKs**: 
  - `groq-sdk` (Llama 3 for mass screening and interview guide generation).

---

## 🗄️ 4. Database Schema (Supabase)

The system relies on two primary tables secured by Row Level Security (RLS):

**`job_descriptions`**
- `id` (UUID, PK)
- `user_id` (UUID, FK -> auth.users)
- `title` (String)
- `company` (String)
- `description_text` (Text)
- `must_have_skills` (Text Array)
- `focus_areas` (Text Array)

**`resumes`**
- `id` (UUID, PK)
- `job_id` (UUID, FK -> job_descriptions)
- `user_id` (UUID, FK -> auth.users)
- `original_filename` (String)
- `file_type` (Enum: pdf, docx)
- `file_hash` (String - used for deduplication)
- `extracted_text` (Text)
- `processing_status` (Enum: processing, completed, failed)
- `gemini_analysis` (JSONB - stores the structured AI output, legacy column name mapped to aiAnalysis in the codebase)
- `score` (Integer 1-10)
- `tag_status` (Enum: applied, shortlisted, interviewed, rejected)
- `is_pinned` (Boolean)

---

## 🔐 5. Security & Privacy Features

1. **Supabase Row Level Security (RLS)**: Database policies ensure that a user can only `SELECT`, `INSERT`, `UPDATE`, or `DELETE` rows where the `user_id` matches their authenticated session token.
2. **PII Redaction**: The AI prompts explicitly instruct the model to ignore and redact names, genders, ages, and locations during the scoring phase to ensure strictly skill-based, unbiased evaluation.
3. **Transient Processing**: While files are uploaded to Supabase Storage for tracking, the heavy text extraction happens securely in-memory on the Node server.

---

## 🎨 6. UI/UX & Accessibility

The platform was recently overhauled to feature a premium, professional design system:
- **Gradient-Free Aesthetics**: Replaced noisy gradients with solid, high-contrast professional color scales (`slate-900`, `blue-600`).
- **Dark Mode Native**: Complete support for system-preference or toggled Dark Mode.
- **Reduced Motion**: Implements a `useReducedMotion` hook that gracefully disables complex animations (like `animate-slide-up`, `stagger`) for users who prefer reduced motion, complying with modern accessibility standards.

---

## 🔌 7. Core API Endpoints

- `POST /api/jobs` - Create a new job requirement.
- `GET /api/jobs` - Retrieve all jobs for the authenticated user.
- `POST /api/resumes/upload` - Multipart upload for resumes. Triggers async parsing and Groq analysis.
- `GET /api/resumes/candidates/:jobId` - Fetch all candidates for a specific job, sorted by score.
- `PATCH /api/resumes/:id/status` - Update workflow status (e.g., to "Shortlisted").
- `POST /api/resumes/interview-guide` - Triggers Groq to build an interview guide based on candidate IDs.

---

## 🛠️ 8. Setup & Development Instructions

### Prerequisites
- Node.js (v18+ recommended)
- A Supabase Project (URL and Anon Key)
- API Keys for Groq

### Backend Setup (`/server`)
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example` and add your keys:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   GROQ_API_KEY=your_groq_key
   ```
4. Start the development server: `npm run dev`

### Frontend Setup (`/client`)
1. Navigate to the client directory: `cd client`
2. Install dependencies: `npm install`
3. Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server: `npm run dev`

### Building for Production
- **Client**: Run `npm run build` in the `client` directory. The output will be in the `dist` folder, ready to be served by any static hosting provider (Vercel, Netlify).
- **Server**: Run `npm start` in the `server` directory to run the production Node process. Ensure environment variables are set in your deployment environment.
