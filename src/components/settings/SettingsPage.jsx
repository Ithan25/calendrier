import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/authService';
import { useToast } from '../shared/Toast';
import { User, LogOut, Bell, Moon, Sun } from 'lucide-react';
import PairingSetup from './PairingSetup';
import ImportExport from './ImportExport';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.info('Déconnexion réussie.');
    } catch (err) {
      toast.error('Erreur lors de la déconnexion.');
    }
  };



  return (
    <div className="settings-page">
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>Paramètres</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Gère ton compte et tes préférences</p>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Ton profil</div>
        <div className="settings-card">
          <div className="settings-item">
            <div className="settings-item-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary-500)' }}>
              <User size={20} />
            </div>
            <div className="settings-item-content">
              <div className="settings-item-title">{user.displayName || 'Utilisateur'}</div>
              <div className="settings-item-desc">{user.email}</div>
            </div>
          </div>
        </div>
      </div>

      <PairingSetup />

      <ImportExport />

      <div className="settings-section">
        <div className="settings-section-title">Application</div>
        <div className="settings-card">


          <div className="settings-item">
            <div className="settings-item-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
              <Bell size={20} />
            </div>
            <div className="settings-item-content">
              <div className="settings-item-title">Notifications Push</div>
              <div className="settings-item-desc">Autoriser les rappels</div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <button
          className="btn btn-secondary btn-full"
          onClick={handleLogout}
          style={{ height: 56, color: 'var(--error)' }}
        >
          <LogOut size={18} /> Se déconnecter
        </button>
      </div>
      
      <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '10px', marginTop: 'var(--space-8)' }}>
        Nous Deux — v1.0.0
      </div>
    </div>
  );
}
