import { useState } from 'react';
import { loginUser } from '../../services/authService';
import { Mail, Lock, Calendar } from 'lucide-react';

export default function LoginForm({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(email, password);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo-icon">
          <Calendar size={32} />
        </div>
        <h1 className="gradient-text">Nous Deux</h1>
        <p>Votre calendrier partagé</p>
      </div>

      <div className="auth-card">
        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Se connecter'}
          </button>
        </form>

        <div className="auth-switch">
          Pas encore de compte ?{' '}
          <button onClick={onSwitchToRegister}>Créer un compte</button>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(code) {
  switch (code) {
    case 'auth/invalid-email': return 'Email invalide.';
    case 'auth/user-not-found': return 'Aucun compte trouvé avec cet email.';
    case 'auth/wrong-password': return 'Mot de passe incorrect.';
    case 'auth/invalid-credential': return 'Email ou mot de passe incorrect.';
    case 'auth/too-many-requests': return 'Trop de tentatives. Réessaie plus tard.';
    default: return 'Erreur de connexion. Vérifie tes identifiants.';
  }
}
