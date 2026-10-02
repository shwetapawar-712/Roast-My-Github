# Roast My GitHub

> **Your GitHub tells a story. We just make it brutally honest.**

Roast My GitHub is an AI-powered GitHub analysis platform that evaluates developer profiles and repositories using real GitHub data, generates verified scores and insights, and turns the results into personalized AI-powered roasts.

## ✨ Features

### 👤 GitHub Profile Analysis

Analyze a GitHub profile based on repository activity, project quality, documentation, presentation, and security-related signals.

### 📦 Repository Analysis

Evaluate an individual repository across multiple categories and identify its strengths, weaknesses, and overall quality.

### 🔥 AI-Powered Roast

Get a personalized roast generated from the actual analysis of your GitHub profile or repository instead of a generic AI response.

### ⚔️ Compare Two Repositories

Put two repositories head-to-head and compare them across multiple categories:

* Activity
* Documentation
* Code Quality
* Presentation
* Security
* Overall Score
* Strengths & Findings

The comparison also provides AI-generated insights based on the analyzed differences.

### 🛡️ Verified AI Output

The application separates analysis from AI generation. Scores and metrics are calculated by the analysis engine first, while AI is used for interpretation and roast generation.

This helps prevent AI-generated responses from inventing or contradicting numerical results.

---

## 🧠 How It Works

```text
GitHub Profile / Repository
            │
            ▼
        GitHub API
            │
            ▼
      Analysis Engine
            │
            ▼
     Verified Scoring
            │
       ┌────┴────┐
       ▼         ▼
  Dashboard   Gemini AI
                 │
                 ▼
          Roast / Insights
```

---

## 🛠️ Tech Stack

**Frontend**

* React
* Vite
* JavaScript
* CSS
* Context API

**Backend**

* Node.js
* Express
* REST APIs

**APIs & AI**

* GitHub API
* Google Gemini API

---

## 📂 Project Structure

```text
roast-my-github/
├── backend/
│   ├── routes/
│   ├── services/
│   │   └── analyzer/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── compare/
│   │   │   └── ui/
│   │   ├── pages/
│   │   ├── context/
│   │   └── api/
│   └── package.json
│
└── .gitignore
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/shwetapawar-712/Roast-My-Github.git
cd Roast-My-Github
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=your_model
```

Start the backend:

```bash
npm start
```

### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

> Keep API keys and other sensitive credentials inside `.env`. Never commit them to the repository.

---

## 🎯 Project Goal

Roast My GitHub combines **GitHub analytics, automated scoring, repository comparison, and generative AI** into a single developer-focused platform.

Instead of presenting developers with only raw GitHub statistics, the platform turns repository data into **actionable insights, comparisons, and personalized feedback** — with a little roast along the way.

---

## 🔮 Future Scope

* GitHub profile progress tracking
* Historical score comparison
* Developer badges and achievements
* Multi-profile comparison
* Shareable analysis cards
* More advanced repository metrics
* Improved personalized AI feedback

---

## 👩‍💻 Author

**Shweta Pawar**

[GitHub](https://github.com/shwetapawar-712)

---

⭐ If you find the project interesting, consider starring the repository.
