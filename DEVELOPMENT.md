# Development Setup Guide

## Local Development Environment

### Prerequisites
- Node.js 16+ and npm/yarn
- Python 3.8+
- VS Code with recommended extensions

### Setup Steps

1. **Install Dependencies**
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Install Python dependencies
   pip3 install -r requirements.txt
   ```

2. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local and add your actual SAJU_API_KEY
   ```

3. **Development Servers**

   **Option A: Run both servers separately**
   ```bash
   # Terminal 1: Start Next.js dev server
   npm run next-dev
   
   # Terminal 2: Start Flask API server
   npm run flask-dev
   ```

   **Option B: Run both servers concurrently**
   ```bash
   npm run dev
   ```

   **Option C: Use VS Code Tasks**
   - Open VS Code
   - Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Tasks: Run Task"
   - Select "Start Full Stack (Next.js + Flask)"

### Debugging

#### VS Code Debugging Configurations Available:
1. **Next.js: debug server-side** - Debug Next.js server-side code
2. **Next.js: debug client-side** - Debug client-side React code in browser
3. **Next.js: debug full stack** - Debug both server and client
4. **Flask API: debug server** - Debug Flask API with breakpoints
5. **Launch Full Stack** - Debug both Next.js and Flask simultaneously

#### Setting Breakpoints:
- **Frontend**: Set breakpoints in `app/page.tsx` for React debugging
- **Backend**: Set breakpoints in `api/saju.py` for Flask API debugging

### Development URLs
- **Next.js Frontend**: http://localhost:3000
- **Flask API**: http://localhost:5328/api/saju
- **Test API endpoint**: http://localhost:5328/api/python

### Vercel Deployment
This project is configured for Vercel deployment:
1. Connect your GitHub repository to Vercel
2. Set environment variable `SAJU_API_KEY` in Vercel dashboard
3. Deploy automatically on push to main branch

### Architecture
- **Frontend**: Next.js 13+ with App Router (TypeScript + Tailwind CSS)
- **Backend**: Flask API with OpenAI client for Saju GPT
- **Development**: Next.js proxies API calls to local Flask server
- **Production**: Vercel serverless functions handle both frontend and API
