import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCalendar } from '../../contexts/CalendarContext';
import { useToast } from '../shared/Toast';
import { parseICSFile, generateICS } from '../../services/icsParser';
import { importEvents } from '../../services/eventService';
import { FileUp, FileDown, CalendarDays, CheckCircle2 } from 'lucide-react';

export default function ImportExport() {
  const { userData } = useAuth();
  const { events } = useCalendar();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [previewEvents, setPreviewEvents] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.ics')) {
      toast.error('Le fichier doit être au format .ics');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedEvents = parseICSFile(e.target.result);
        if (parsedEvents.length === 0) {
          toast.warning('Aucun événement trouvé dans ce fichier.');
        } else {
          setPreviewEvents(parsedEvents);
        }
      } catch (err) {
        console.error(err);
        toast.error('Erreur lors de la lecture du fichier ICS.');
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (!userData?.pairId || !previewEvents) return;
    setLoading(true);
    try {
      await importEvents(userData.pairId, previewEvents, userData.id);
      toast.success(`${previewEvents.length} événements importés avec succès !`);
      setPreviewEvents(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error("Erreur lors de l'import : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (events.length === 0) {
      toast.info('Il n\'y a aucun événement à exporter.');
      return;
    }

    try {
      const ics = generateICS(events);
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `calendrier_nousdeux_${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Calendrier exporté avec succès !');
    } catch (err) {
      toast.error('Erreur lors de l\'export.');
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-section-title">Import & Export (.ICS)</div>
      
      {!previewEvents ? (
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div
            className="import-zone"
            style={{ flex: 1 }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept=".ics"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <FileUp className="import-zone-icon" size={24} style={{ margin: '0 auto' }} />
            <div className="import-zone-text" style={{ marginTop: 'var(--space-2)' }}>Importer ICS</div>
          </div>

          <div
            className="import-zone"
            style={{ flex: 1 }}
            onClick={handleExport}
          >
            <FileDown className="import-zone-icon" size={24} style={{ margin: '0 auto' }} />
            <div className="import-zone-text" style={{ marginTop: 'var(--space-2)' }}>Exporter ICS</div>
          </div>
        </div>
      ) : (
        <div className="import-preview">
          <div className="import-preview-header">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CalendarDays size={18} className="text-primary-500" />
              {previewEvents.length} événements trouvés
            </h4>
          </div>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: 'var(--space-4)' }}>
            {previewEvents.slice(0, 5).map((ev, i) => (
              <div key={i} className="import-preview-item">
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>{ev.title}</span>
              </div>
            ))}
            {previewEvents.length > 5 && (
              <div className="import-preview-item" style={{ color: 'var(--text-tertiary)' }}>
                ...et {previewEvents.length - 5} autres
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              disabled={loading}
              onClick={() => {
                setPreviewEvents(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Annuler
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
              onClick={confirmImport}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Tout importer'}
            </button>
          </div>
        </div>
      )}
      
      <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-xs)', marginTop: 'var(--space-3)' }}>
        Pour importer depuis Samsung ou Apple Calendar, ouvre ton application calendrier, choisis "Partager" ou "Exporter" vers un format .ics, puis importe ce fichier ici.
      </p>
    </div>
  );
}
