# Deep Sleep Project 😴

A comprehensive sleep tracking and research dashboard designed for students and teachers. This application allows students to log their sleep patterns and researchers/teachers to analyze the data through an interactive dashboard.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify your `.env` file configuration (Port defaults to 3000/3333).

### Running the Application

This project requires both a backend API and a frontend client to be running simultaneously.

**1. Start the Backend API**
This runs the Express server for handling data requests.
```bash
npm run start
```
> **Note:** The server typically runs on `http://localhost:3333` (overriding default 3000 for development).

**2. Start the Frontend Application**
This runs the React + Vite development server.
```bash
npm run dev
```
> **Access the app at:** `http://localhost:5173`

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Tailwind CSS (Design System)
- **Backend:** Node.js, Express
- **Database:** Firebase (Admin SDK)
- **Data Visualization:** Recharts
- **Export Capabilities:** XLSX (Excel export)

## 📂 Project Structure

- `/src` - React frontend code
- `/src/client/components` - UI Components (TeacherDashboard, SleepForm, etc.)
- `/backend` - Express routes and controllers
- `/api` - API configuration
