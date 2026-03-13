import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CalendarProvider, useCalendar } from './contexts/CalendarContext';
import { VIEW_MODES } from './utils/constants';

import AuthGuard from './components/auth/AuthGuard';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import TopBar from './components/shared/TopBar';
import BottomNav from './components/shared/BottomNav';
import CalendarHeader from './components/calendar/CalendarHeader';
import MonthView from './components/calendar/MonthView';
import WeekView from './components/calendar/WeekView';
import DayView from './components/calendar/DayView';
import AgendaView from './components/calendar/AgendaView';
import EventModal from './components/events/EventModal';
import EventDetail from './components/events/EventDetail';
import MealsPage from './components/meals/MealsPage';
import SettingsPage from './components/settings/SettingsPage';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function CalendarViews() {
  const { viewMode, setViewMode } = useCalendar();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/agenda' && viewMode !== VIEW_MODES.AGENDA) {
      setViewMode(VIEW_MODES.AGENDA);
    } else if (location.pathname === '/' && viewMode === VIEW_MODES.AGENDA) {
      setViewMode(VIEW_MODES.MONTH);
    }
  }, [location.pathname, viewMode, setViewMode]);

  return (
    <div className="calendar-page page-enter page-enter-active">
      <TopBar />
      <CalendarHeader />

      {viewMode === VIEW_MODES.MONTH && <MonthView />}
      {viewMode === VIEW_MODES.WEEK && <WeekView />}
      {viewMode === VIEW_MODES.DAY && <DayView />}
      {viewMode === VIEW_MODES.AGENDA && <AgendaView />}

      <EventModal />
      <EventDetail />
    </div>
  );
}

function MainLayout({ children }) {
  return (
    <>
      <CalendarProvider>
        {children}
        <BottomNav />
      </CalendarProvider>
    </>
  );
}

function App() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ animation: 'pulse 1.5s ease infinite' }}>
            📅
          </div>
          <h1 className="gradient-text">CalenDuo</h1>
          <p style={{ color: 'var(--text-tertiary)' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return isLogin ? (
      <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
    );
  }

  return (
    <AuthGuard>
      <Routes>
        <Route path="/" element={<MainLayout><CalendarViews /></MainLayout>} />
        <Route path="/agenda" element={<MainLayout><CalendarViews /></MainLayout>} />
        <Route path="/meals" element={<MainLayout><MealsPage /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><SettingsPage /></MainLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthGuard>
  );
}

export default App;
