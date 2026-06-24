# SleepSync AI – Intelligent Sleep Quality and Lifestyle Coach

SleepSync AI is a premium, modern health-tech web application designed to track sleep habits, predict sleep disorder risks (None, Insomnia, Sleep Apnea) using a Random Forest machine learning classifier, and offer customized wellness advice through a Gemini-powered AI Sleep Coach.

---

## 🚀 Key Features

* **Intelligent Sleep Score**: Daily score calculated from sleep duration, quality, stress levels, physical activity, step counts, and mood.
* **ML Disorder Risk Assessment**: Uses a trained Python Random Forest Classifier (trained on the Sleep Health and Lifestyle dataset) to evaluate disorder risks and display prediction confidence.
* **AI Sleep Coach**: Context-aware chat assistant integrated with the Gemini API (with robust local rule-based fallbacks) that provides personalized hygiene tips.
* **Interactive Analytics & Reports**: Beautiful visual trend analytics including Line, Bar, Area, Radar, and Pie charts displaying sleep duration, stress metrics, mood distribution, and weekly averages.
* **Restorative Yoga & Exercises**: Curated sleep-promoting Asanas (like Balasana, Savasana) with vector illustrations and video guides to follow along.
* **History Log & Data Exporter**: Searchable historical database of logs with options to delete, export to CSV, or download a compiled vector PDF report.
* **Theme-Aware UI**: Premium dark/light themes built with glassmorphism panels, transitions, and Outfit typography.

---

## 🛠️ Technology Stack

* **Frontend**: React, Tailwind CSS (v3), Framer Motion, Chart.js, Lucide Icons, jsPDF
* **Backend**: Node.js, Express, MongoDB Mongoose ODM, Helmet, CORS, Rate Limiters
* **Machine Learning**: Python 3.10+, Pandas, Scikit-learn (Random Forest Classifier)
* **AI Integration**: Gemini API (`@google/generative-ai`)

---

## 📦 Project Directory Layout

```
sleepsync-ai/
├── ml/                       # Machine Learning Classifier training & prediction scripts
├── backend/                  # Express REST API, Mongoose Schemas & Controller endpoints
└── frontend/                 # React SPA bundled with Vite and styled with Tailwind
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [MongoDB](https://www.mongodb.com/) (running locally at `mongodb://localhost:27017` or MongoDB Atlas URI)
* [Python 3.10+](https://www.python.org/) with `pandas`, `numpy`, and `scikit-learn` installed:
  ```bash
  pip install pandas numpy scikit-learn
  ```

---

### Step 1: Set Up Backend Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy `.env.example` to `.env` and fill in your variables:
   ```bash
   cp .env.example .env
   ```
   *Note: Set `GEMINI_API_KEY` to unlock AI chat coaching.*
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   *The backend will run on http://localhost:5000*

---

### Step 2: Set Up Frontend Client
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *The client will run on http://localhost:5173*

---

### Step 3: Default Credentials for Testing
To login as an Administrator and browse all system logs:
* **Email**: `admin@sleepsync.ai`
* **Password**: `password123`
