# Installation Instructions

## Prerequisites

Before running the application, ensure you have:
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance
- Supabase account
- Google Gemini API key

## Server Setup

### 1. Navigate to Server Directory

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- express
- mongoose
- dotenv
- cors
- helmet (security headers)
- express-rate-limit (rate limiting)
- express-mongo-sanitize (NoSQL injection prevention)
- @google/generative-ai (Gemini AI)
- @supabase/supabase-js (authentication)
- multer (file uploads)
- pdf-parse (PDF parsing)
- mammoth (DOCX parsing)

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your actual values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_strong_random_secret_key
GEMINI_API_KEY=your_gemini_api_key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
NODE_ENV=development
```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server should now be running on `http://localhost:5000`.

## Client Setup

### 1. Navigate to Client Directory

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NODE_ENV=development
```

### 4. Start the Client

```bash
npm run dev
```

The client should now be running on `http://localhost:5173`.

## Verification

1. Open your browser and navigate to `http://localhost:5173`
2. You should see the AI Resume Analyzer homepage
3. Try creating an account and logging in
4. Test uploading a resume

## Troubleshooting

### "npm: command not found"

Make sure Node.js and npm are installed and in your PATH:
```bash
node --version
npm --version
```

### CORS Errors

Ensure `ALLOWED_ORIGINS` in server `.env` includes your client URL.

### Rate Limiting Issues During Development

If you're hitting rate limits during testing, you can temporarily increase the limits in `server/middleware/rateLimitMiddleware.js`.

### Database Connection Errors

Verify your `MONGO_URI` is correct and your IP is whitelisted in MongoDB Atlas.

## Next Steps

- Review the [SECURITY.md](./SECURITY.md) for security best practices
- Read the main [README.md](../README.md) for feature documentation
- Check out the API documentation (if available)
