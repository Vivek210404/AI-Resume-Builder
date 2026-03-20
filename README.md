# 🚀 AI-Powered Resume Builder using MERN + Gemini + Tailwind UI

------------------------------------------------------------------------

## 🌐 Live Demo

- **Frontend:** https://ai-resume-builder-f.vercel.app
- **Backend:** https://ai-resume-builder-hazel-omega.vercel.app

## ⭐ About the Project

**Resume Builder** is a modern web application that helps users create
professional resumes quickly. It uses **Gemini AI** (via
OpenAI-compatible API) for content generation and analysis, including:

-   Resume Summary
-   Skills & Experience Bullets
-   Project Descriptions
-   **ATS Resume Analysis** (score, strengths, weaknesses, missing
    keywords, section feedback)

The app is built with **React + Tailwind CSS** and supports AI features,
CRUD, live preview, and PDF export.

------------------------------------------------------------------------

## ✨ Features

### 🎨 Frontend

-   UI built with **React 19 + Vite + Tailwind CSS v4**
-   Multiple resume templates
-   Live resume preview
-   Responsive layout

### 🤖 AI Integration

-   Gemini AI (via OpenAI-compatible API)
-   Auto-generate Resume Summary
-   AI-generated Skills & Experience
-   Upload existing PDF resume and extract content
-   **Analyze Resume with AI** --- ATS score, strengths, weaknesses,
    missing keywords, section-wise feedback

### 🟩 Backend + Database

-   Node.js + Express
-   MongoDB (user & resume data)
-   JWT auth
-   CRUD for resumes

### 📤 Extra Features

-   Export to PDF
-   Edit & update resumes
-   Save & manage multiple resumes
-   Public/private resume sharing

------------------------------------------------------------------------

## 🧰 Tech Stack

| Layer     | Technologies |
|-----------|--------------|
| Frontend  | React 19, Vite, Tailwind CSS, Redux, React Router, Lucide Icons |
| Backend   | Node.js, Express.js |
| Database  | MongoDB (Mongoose) |
| AI        | Gemini (OpenAI-compatible API) |
| Tools     | Git, GitHub |


------------------------------------------------------------------------

## 🖼️ Screenshots

| Home Page | AI Enhance | Resume Preview | AI Resume Analysis |
|----------|------------|----------------|-------------------|
| ![Home](./screenshots/Home.png) | ![AI Enhance](./screenshots/ai%20enhance.png) | ![Preview](./screenshots/preview.png) | ![Analysis](./screenshots/analyze.png) |



------------------------------------------------------------------------

## 🔧 Installation

Clone the repo:

``` bash
git clone https://github.com/Vivek210404/AI-Resume-Builder
cd AI-Resume-Builder
```

Install dependencies:

``` bash
cd client && npm install
cd ../server && npm install
```

### 🔑 Environment Variables

Create `.env` inside `server` folder:

``` env
MONGO_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
OPENAI_MODEL=gemini-3.0-flash
```

### ▶ Run Locally

Start Backend:

``` bash
cd server
npm run server
```

Start Frontend:

``` bash
cd client
npm run dev
```

Open app at: http://localhost:5173
