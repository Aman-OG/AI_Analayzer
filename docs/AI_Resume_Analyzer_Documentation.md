# AI Resume Analyzer – Full Software Documentation

Version: 1.0.0  
Date: 2025-10-09  
Project: AI Resume Analyzer for Recruiters  

## Executive Summary

AI Resume Analyzer streamlines recruitment by parsing resumes, anonymizing PII, matching skills to job descriptions, and ranking candidates. It is a full‑stack app with a React + Vite + TypeScript frontend and a Node.js + Express backend using MongoDB for storage, Supabase for authentication, and Google Gemini for AI analysis. Recruiters create job descriptions, upload resumes, and view ranked candidates with explanations and warnings.

## Table of Contents

1. Introduction
2. System Overview
3. Architecture
4. Tech Stack
5. Repository Structure
6. Environments & Configuration
7. Setup & Installation
8. Data Models
9. API Specification
10. Processing Flow
11. Security & Privacy
12. Error Handling & Logging
13. Testing Strategy
14. Performance & Scalability
15. Deployment
16. CI/CD (Guidance)
17. Coding Standards & Conventions
18. Troubleshooting
19. Roadmap
20. Glossary

---

## 1. Introduction

This document provides complete technical documentation for AI Resume Analyzer, including architecture, configuration, data models, API reference, and operational guidance. It targets developers, DevOps, and technical stakeholders.

## 2. System Overview

- Recruiters authenticate via Supabase.  
- They create job descriptions defining title, textual description, and optional must‑have skills and focus areas.  
- They upload resumes (PDF/DOC/DOCX). The server extracts text, stores metadata, and asynchronously triggers Gemini analysis.  
- The Gemini prompt enforces JSON‑only output and PII exclusion.  
- The system validates/cleans Gemini output, performs additional PII checks, stores results, and exposes candidate lists per job.

## 3. Architecture

- Frontend: React (Vite, TypeScript) SPA consuming REST APIs with token attached via Axios interceptor.  
- Backend: Express API with authentication middleware validating Supabase JWTs; file upload via Multer with in‑memory storage; text extraction via `pdf-parse` and `mammoth`; AI analysis via Google Gemini SDK; MongoDB via Mongoose for persistence.  
- Authentication: Supabase session token; middleware verifies token and attaches user to requests.  
- Data: MongoDB collections for `JobDescription` and `Resume`.  
- Asynchronous processing: Resume upload schedules analysis via `triggerGeminiAnalysis` and updates status as it progresses.

## 4. Tech Stack

- Frontend: React 19, TypeScript, React Router, Tailwind CSS, Radix UI, Zod, React Hook Form.  
- Backend: Node.js, Express 5, Mongoose 8, Multer, pdf-parse, mammoth, Supabase JS, Google Generative AI SDK.  
- Database: MongoDB.  
- Auth: Supabase.  
- Testing: Jest, Supertest, mongodb-memory-server.  
- Build/Tooling: Vite, ESLint, TypeScript.

## 5. Repository Structure

Top-level highlights:

- `server/` – Express API, models, controllers, services, middleware, config.  
- `client/` – React app (Vite + TS).  
- `README.md` – Project overview and screenshots.  
- `docs/` – Project documentation (this file).

Server:

- `server/server.js` – Express app bootstrap and route mounting.  
- `server/config/db.js` – MongoDB connection.  
- `server/config/supabaseClient.js` – Supabase init/getter.  
- `server/config/gemini.js` – Gemini init/getters.  
- `server/models/*.js` – `JobDescription`, `Resume`.  
- `server/controllers/*.js` – `authController`, `jobController`, `resumeController`.  
- `server/routes/*.js` – `authRoutes`, `jobRoutes`, `resumeRoutes`.  
- `server/services/geminiService.js` – prompt building, analysis, PII scan, async processing.  
- `server/utils/resumeParser.js` – text extraction for PDF/DOC/DOCX.  
- `server/middleware/*.js` – `authMiddleware`, `uploadMiddleware`.  
- Tests: `server/services/geminiService.test.js`, `server/routes/resumeRoutes.test.js`.

Client:

- `client/src/services/*.ts` – `apiClient`, `jobService`, `resumeService`.  
- `client/src/contexts/AuthContext.tsx` – Supabase session management.  
- `client/src/pages/*.tsx`, `client/src/components/*` – UI pages and components.  
- `client/src/lib/*` – validators, utils, supabaseClient.

## 6. Environments & Configuration

Backend `.env` (server/):

- `PORT` – Server port (default 5001).  
- `MONGO_URI` – MongoDB connection string.  
- `SUPABASE_URL` – Supabase project URL.  
- `SUPABASE_ANON_KEY` – Supabase anon key.  
- `GEMINI_API_KEY` – Google Generative AI key.

Frontend `.env` (client/):

- `VITE_API_BASE_URL` – API base URL, e.g., `http://localhost:5001/api`.  
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` – Supabase credentials for the browser.

Notes:

- Ensure the frontend `VITE_API_BASE_URL` matches backend host/port.  
- Supabase keys differ for server and client contexts; keep secrets on the server where possible.

## 7. Setup & Installation

Prerequisites: Node.js LTS, npm, MongoDB instance (Atlas/local), Supabase project, Google Gemini API access.

Backend:

1. `cd server`  
2. `npm install`  
3. Create `.env` with variables from Section 6.  
4. Run dev: `npm run dev` (nodemon) or `npm start`.

Frontend:

1. `cd client`  
2. `npm install`  
3. Create `.env` with variables from Section 6.  
4. Run dev: `npm run dev` and open the printed URL.

## 8. Data Models

JobDescription (server/models/JobDescriptionModel.js):

- `userId: String` – Owner (Supabase user id).  
- `title: String` – Job title (required).  
- `descriptionText: String` – Job description (required).  
- `mustHaveSkills: String[]` – Optional must‑have skills.  
- `focusAreas: String[]` – Optional focus areas.  
- Timestamps, index on `userId`.

Resume (server/models/ResumeModel.js):

- `userId: String` – Uploader (Supabase user id).  
- `jobId: ObjectId` – Reference to JobDescription (required).  
- `originalFilename: String`, `fileType: String`, `uploadTimestamp: Date`.  
- `processingStatus: 'uploaded'|'extracting'|'processing'|'completed'|'error'`.  
- `extractedText: String` – Raw text extracted from file.  
- `geminiAnalysis: Mixed` – Parsed AI analysis JSON.  
- `score: Number`, `errorDetails: String`.  
- Timestamps, indexes on `(userId, jobId)` and `(jobId, processingStatus)`.

## 9. API Specification

Auth (server/routes/authRoutes.js):

- `POST /api/auth/signup` – Body: `{ email, password }`. Returns signup result; may require email confirmation depending on Supabase settings.  
- `POST /api/auth/login` – Body: `{ email, password }`. Returns `{ user, session }` with `access_token`.  
- `GET /api/auth/user` – Requires `Authorization: Bearer <token>`. Returns current user.  
- `POST /api/auth/logout` – Requires bearer token. Invalidates session.

Jobs (server/routes/jobRoutes.js):

- `POST /api/jobs` – Create job. Body: `{ title, descriptionText, mustHaveSkills?, focusAreas? }`.  
- `GET /api/jobs` – List jobs for authenticated user.  
- `GET /api/jobs/:id` – Get a job by id (owner only).  
- `PUT /api/jobs/:id` – Update fields.  
- `DELETE /api/jobs/:id` – Delete job (owner only).

Resumes (server/routes/resumeRoutes.js):

- `POST /api/resumes/upload` – Multipart form with fields: `jobId`, file field `resumeFile` (PDF/DOC/DOCX).  
  - Response: `{ message, resumeId }`. Triggers async analysis.  
- `GET /api/resumes/job/:jobId/candidates` – Returns processed candidates for a job, sorted by score, with top ~20% flagged.  
  - Response items: `{ candidateId, originalFilename, fileType, uploadTimestamp, score, skills?, yearsExperience?, education?, justification?, warnings?, isFlagged }`.

Global concerns:

- All non‑auth endpoints require bearer token validated by `authMiddleware`.  
- Errors use descriptive messages with appropriate HTTP status codes (400/401/403/404/500).

## 10. Processing Flow

1. Upload: Client posts `jobId` and `resumeFile`. Multer validates type and size (<= 10MB) and stores in memory.  
2. Extraction: `resumeParser.extractTextFromBuffer` uses `pdf-parse` or `mammoth` to extract raw text.  
3. Persist: Create `Resume` with status `uploaded`.  
4. Trigger: `triggerGeminiAnalysis(resumeId)` sets status to `processing`.  
5. Prompt: `constructPrompt` builds strict JSON‑only instruction with PII exclusion and schema.  
6. AI Call: `getGeminiModel().generateContent(prompt, generationConfig)` with retries and block handling.  
7. Parse: Strips ```json fences, extracts JSON object, parses safely with markers.  
8. PII Scan: Regex scans for email/phone; redacts in skills, warns for education/justification.  
9. Save: Writes `geminiAnalysis`, `score = fitScore`, sets status `completed`.  
10. Read: Client fetches candidates per job via `/job/:jobId/candidates`.

## 11. Security & Privacy

- Auth: Supabase JWT validated on server for every protected route; user is attached to `req.user`.  
- CORS: Enabled for cross‑origin dev; restrict origins in production.  
- Uploads: Allowed types PDF/DOC/DOCX, 10MB size limit. Use memory storage; consider scanning and persistent storage for production.  
- PII: Prompt requires anonymization; server adds PII detection/redaction for skills and warnings for other fields.  
- Data access: Jobs and candidate lists scoped to job owner.  
- Secrets: Store API keys/URIs in environment variables; never commit to VCS.  
- Logging: Avoid logging sensitive content in production.

## 12. Error Handling & Logging

- Controllers return semantic HTTP codes and messages.  
- Gemini service wraps JSON parse errors and API failures with retries and clear error messages.  
- On failures, resume documents record `processingStatus: 'error'` and short `errorDetails`.

## 13. Testing Strategy

- Unit/Integration: Jest + Supertest for routes and services with an in‑memory MongoDB (`mongodb-memory-server`).  
- Tests included:  
  - `server/services/geminiService.test.js` – prompt, trigger, JSON parsing, error and PII behavior via mocked Gemini.  
  - `server/routes/resumeRoutes.test.js` – upload flow and candidates endpoint with mocked auth and Gemini.  
- Suggested: Add tests for job routes, auth routes, and uploadMiddleware filters.

## 14. Performance & Scalability

- Asynchronous analysis to keep uploads fast.  
- Indexes on `Resume` support frequent queries (by `jobId`, status).  
- Consider queuing (e.g., BullMQ / Cloud Tasks) for high volume.  
- Tune Gemini token limits and temperature; cache stable results.  
- Use streaming storage (S3/GCS) for files once moving beyond memory storage.

## 15. Deployment

- Backend: Node.js service with environment‑specific `.env`. Ensure `MONGO_URI`, `SUPABASE_*`, and `GEMINI_API_KEY` are set.  
- Frontend: Static build via `npm run build` and deploy to static hosting (Vercel/Netlify/S3).  
- Networking: Expose backend over HTTPS; set `VITE_API_BASE_URL` accordingly.  
- Observability: Add structured logs and basic healthcheck (`GET /api`).

## 16. CI/CD (Guidance)

- CI: Install deps, run `npm test` in `server`, build client.  
- Enforce lint/format checks; fail on test failures.  
- CD: Deploy backend first, then client with updated API base URL.

## 17. Coding Standards & Conventions

- TypeScript for client; JS with JSDoc for server.  
- Consistent error messages; avoid leaking sensitive details.  
- Keep controllers thin; push cross‑cutting logic to services/middleware.  
- Prefer `.lean()` on read‑only queries.  
- Validate inputs (front and back); sanitize user strings used in prompts.

## 18. Troubleshooting

- 401 Unauthorized: Verify Supabase token in `Authorization` header.  
- Gemini errors: Ensure `GEMINI_API_KEY` is valid; inspect server logs for block reasons or JSON parse errors.  
- Empty extraction: Confirm file type and content; ensure `pdf-parse`/`mammoth` installed and mime type matches.  
- Mongo connection: Check `MONGO_URI` and network access.  
- CORS issues: Configure allowed origins.

## 19. Roadmap

- Queue/worker for analysis; retries with backoff and DLQ.  
- More PII detectors (names/addresses) with NLP; configurable policies.  
- Admin dashboards and audit logs.  
- Export candidates and analytics.  
- Fine‑tuned prompts per role and organization templates.

## 20. Glossary

- PII: Personally Identifiable Information.  
- Supabase: Backend‑as‑a‑service providing auth and Postgres.  
- Gemini: Google Generative AI large language model.  
- Multer: Express middleware for file uploads.

