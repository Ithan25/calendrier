import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../shared/Toast';
import { createPair, joinPair, unpair } from '../../services/pairingService';
import { getInitials } from '../../utils/colorUtils';
import { Link, Check, Smartphone, KeyRound, AlertCircle } from 'lucide-react';

export default function PairingSetup() {
  const { user, userData, pairData, partnerData, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const isPaired = !!userData?.pairId;
  const isPending = isPaired && !partnerData;
  const ownCode = pairData?.inviteCode;

  const handleCreatePair = async () => {
    setLoading(true);
    try {
      await createPair(user.uid);
      await refreshUserData();
      toast.success('Code généré avec succès !');
    } catch (err) {
      console.error('Error in createPair:', err);
      toast.error(err.message || 'Erreur lors de la génération du code.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPair = async (e) => {
    e.preventDefault();
    if (!inviteCode || inviteCode.length !== 6) {
      toast.error('Le code doit contenir 6 caractères.');
      return;
    }

    setLoading(true);
    try {
      await joinPair(user.uid, inviteCode);
      await refreshUserData();
      toast.success('Comptes liés avec succès ! 🎉');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la liaison.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpair = async () => {
    if (confirm('Es-tu sûr de vouloir séparer les comptes ? Les événements communs resteront, mais vous ne serez plus synchronisés.')) {
      setLoading(true);
      try {
        await unpair(userData.pairId, user.uid);
        await refreshUserData();
        toast.info('Comptes séparés.');
      } catch (err) {
        toast.error('Erreur lors de la séparation.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (isPaired && partnerData) {
    return (
      <div className="settings-section">
        <div className="settings-section-title">En couple avec</div>
        <div className="partner-card">
          <div className="partner-avatar">
            {getInitials(partnerData.displayName)}
          </div>
          <div className="partner-info">
            <div className="partner-name">{partnerData.displayName}</div>
            <div className="partner-email">{partnerData.email}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleUnpair} disabled={loading}>
            Séparer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="settings-section-title">Synchronisation</div>
      <div className="pairing-card">
        {isPending ? (
          <>
            <div className="pairing-status" style={{ marginBottom: 'var(--space-4)', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              <AlertCircle size={18} /> En attente du partenaire
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
              Partage ce code à ta moitié pour qu'elle rejoigne ton calendrier :
            </p>
            <div className="pairing-code">{ownCode}</div>
            <button className="btn btn-secondary" onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(ownCode);
                toast.success('Code copié !');
              }
            }}>
              Copier le code
            </button>

            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-secondary)' }}>
              <button className="btn btn-ghost btn-sm" onClick={handleUnpair} disabled={loading}>
                Annuler
              </button>
            </div>
          </>
        ) : (
          <>
            <Smartphone size={32} style={{ color: 'var(--primary-400)', margin: '0 auto var(--space-4)' }} />
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Lier vos calendriers</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
              Génère un code pour inviter ta moitié, ou saisis son code pour la rejoindre.
            </p>

            <button className="btn btn-primary btn-full" onClick={handleCreatePair} disabled={loading} style={{ marginBottom: 'var(--space-6)' }}>
              <KeyRound size={18} /> Générer un code
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', margin: 'var(--space-4) 0', color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-secondary)' }} />
              OU
              <div style={{ flex: 1, height: 1, background: 'var(--border-secondary)' }} />
            </div>

            <form onSubmit={handleJoinPair}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                J'ai un code d'invitation
              </p>
              <div className="pairing-input">
                <input
                  type="text"
                  placeholder="ABCDEF"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 6))}
                  maxLength={6}
                />
                <button type="submit" className="btn btn-secondary" disabled={loading || inviteCode.length !== 6}>
                  <Link size={18} /> Lier
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
