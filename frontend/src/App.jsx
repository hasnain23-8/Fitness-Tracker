import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkoutLog from './pages/WorkoutLog';
import Steps from './pages/Steps';
import Weight from './pages/Weight';
import Goals from './pages/Goals';
import Friends from './pages/Friends';
import Profile from './pages/Profile';

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-mesh">
    <Navbar />
    <main className="flex-1 md:ml-64 pt-14 md:pt-0 overflow-x-hidden">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/workouts"  element={<ProtectedRoute><Layout><WorkoutLog /></Layout></ProtectedRoute>} />
            <Route path="/steps"     element={<ProtectedRoute><Layout><Steps /></Layout></ProtectedRoute>} />
            <Route path="/weight"    element={<ProtectedRoute><Layout><Weight /></Layout></ProtectedRoute>} />
            <Route path="/goals"     element={<ProtectedRoute><Layout><Goals /></Layout></ProtectedRoute>} />
            <Route path="/friends"   element={<ProtectedRoute><Layout><Friends /></Layout></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
