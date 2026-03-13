import { useAuth } from '../../contexts/AuthContext';

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();

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

  if (!user) return null;

  return children;
}
