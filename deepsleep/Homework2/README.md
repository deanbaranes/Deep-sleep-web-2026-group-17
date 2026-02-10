# 🌌 Deep Sleep Web (2026) - Group 12

**Deep Sleep Web** is an advanced sleep monitoring platform designed for students, teachers, and researchers. The application combines sleep data tracking with gamification elements (Galactic Game) to encourage consistent logging, while providing powerful analytics tools for educational staff and researchers.

---

## 🚀 Features

### 🎓 For Students
* **Sleep Logging:** Intuitive interface for daily sleep data entry.
* **Galactic Gamification:** Maintain a "Sleep Streak" to level up and unlock galactic achievements in the interactive game.
* **Personal Dashboard:** Real-time visualization of personal sleep trends and game progress.

### 👨‍🏫 For Teachers
* **Class Management:** Overview of aggregate class data and student participation.
* **Engagement Tracking:** Identify students who may need support based on sleep patterns.
* **Student Insights:** Monitor overall class health and sleep consistency.

### 🔬 For Researchers (Admin)
* **Advanced Analytics:** Interactive charts (Pie & Bar) powered by Recharts for deep data insights.
* **Dynamic Surveys:** Create, manage, and deploy custom research questions to students.
* **Data Portability:** Export full research datasets to **Excel (XLSX)** for external analysis.
* **User Management:** Full administrative control over teacher and student accounts.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS
* **Backend:** Node.js, Express
* **Database & Auth:** Firebase (Firestore, Authentication)
* **Deployment:** Vercel
* **Visualization:** Recharts
* **Utility Libraries:** Axios, ExcelJS, Lucide React

---

## 📂 Project Structure

```text
deepsleep/Homework2/
├── backend/              # Node.js Backend Application
│   ├── config/           # Firebase admin SDK & configurations
│   ├── routes/           # API Endpoints (auth, sleep, teacher, research)
│   └── services/         # Business Logic (stats, management, DB services)
├── src/
│   └── client/           # Frontend React Application (Vite)
│       ├── components/   # UI: Dashboard, Galactic Game, Stats view
│       ├── context/      # App State Management (AppContext)
│       ├── data/         # Static Questions & Level Configurations
│       └── utils/        # Helpers: Excel Export & Translation tools
├── public/               # Static assets & Icons
├── api/                  # Vercel serverless functions entry point
├── server.js             # Main Express server configuration
├── vercel.json           # Vercel deployment settings
└── .env.example          # Template for environment variables