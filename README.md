# 🏃‍♂️ Fitness Tracker

A premium, full-stack fitness tracking application designed to help you monitor your workouts, set goals, and compete with friends. Built with a modern, high-performance tech stack and a stunning "Glassmorphism" UI.

## 🚀 Key Features

- **Personalized Dashboards**: Track your daily steps, weight, and fitness progress with beautiful interactive charts (Recharts).
- **Workout Logging**: Easily record and manage your exercise routines with categorized logs.
- **Social & Friends**: Search for friends, build a network, and compare your progress on the leaderboard.
- **Dynamic Themes**: Seamlessly switch between a sleek **Dark Mode** and a clean **Light Mode**.
- **Secure Authentication**: Built-in authentication using JWT (LocalStorage-based) and secure password hashing (BCrypt).
- **Cloud Database**: Powered by **Neon PostgreSQL** for ultra-fast, reliable data storage.

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS (with custom Glassmorphism UI)
- **Charts**: Recharts
- **State Management**: React Context API
- **Icons**: Lucide React
- **HTTP Client**: Axios

### **Backend**
- **Modern Core**: Node.js & Express
- **Database**: PostgreSQL (via Neon)
- **ORM/Driver**: `pg` (custom parameterized queries)
- **Security**: BCrypt, JSON Web Tokens (JWT)
- **File Storage**: Static uploads for profile pictures

## 📦 Getting Started

### **1. Clone the Repository**
```bash
git clone https://github.com/hasnain23-8/Fitness-Tracker.git
cd Fitness-Tracker
```

### **2. Setup Backend**
1. Navigate to the `backend` folder.
2. Create a `.env` file with your **DATABASE_URL** and **JWT_SECRET**.
3. Install dependencies and start:
```bash
npm install
node server.js
```

### **3. Setup Frontend**
1. Navigate to the `frontend` folder.
2. Install dependencies and start the dev server:
```bash
npm install
npm run dev
```

## 📐 Project Structure

```text
Fitness-Tracker/
├── backend/            # Express.js Server & API
│   ├── controllers/    # API Business Logic
│   ├── middleware/     # Auth & Error Handlers
│   ├── routes/         # API Route definitions
│   └── uploads/        # Static Profile Pictures
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── context/    # Auth & Theme State
│   │   ├── pages/      # Page Components
│   │   └── services/   # Axios API Client
│   └── public/         # Static Assets
└── database/           # SQL Schema definitions
```

## 📄 License
This project is licensed under the ISC License.
