# Reddit Agent

AI Agent that helps you analyze and interact with Reddit content. The agent can search subreddits, create summaries, find high-engagement threads, and draft relevant comments.

## Features

- 🔍 Search any subreddit for latest posts
- 📝 Create summaries of interesting discussions
- 📊 Find threads with high engagement
- 💬 Draft relevant comments for threads

## Setup

### Backend
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI server:
```bash
uvicorn main:app --reload
```

### Frontend
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Type a subreddit name (e.g., 'programming' or 'technology')
3. The agent will:
   - Search for latest posts
   - Create summaries
   - Find high-engagement threads
   - Draft relevant comments

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: FastAPI, Python
- AI: Portia, ACI
