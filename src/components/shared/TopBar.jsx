import { useCalendar } from '../../contexts/CalendarContext';
import { useAuth } from '../../contexts/AuthContext';
import { VIEW_MODES } from '../../utils/constants';
import { getInitials } from '../../utils/colorUtils';
import { LogOut } from 'lucide-react';

export default function TopBar() {
  const { viewMode, setViewMode } = useCalendar();
  const { user, partnerData } = useAuth();

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <div className="event-creator-avatar" style={{ background: 'var(--primary-500)', width: 32, height: 32 }}>
          {getInitials(user?.displayName)}
        </div>
        {partnerData && (
          <div className="event-creator-avatar" style={{ background: 'var(--accent-500)', width: 32, height: 32, marginLeft: -12, border: '2px solid var(--bg-primary)' }}>
            {getInitials(partnerData?.displayName)}
          </div>
        )}
      </div>

      <div className="view-selector">
        <button
          className={viewMode === VIEW_MODES.MONTH ? 'active' : ''}
          onClick={() => setViewMode(VIEW_MODES.MONTH)}
        >
          Mois
        </button>
        <button
          className={viewMode === VIEW_MODES.WEEK ? 'active' : ''}
          onClick={() => setViewMode(VIEW_MODES.WEEK)}
        >
          Sem
        </button>
        <button
          className={viewMode === VIEW_MODES.DAY ? 'active' : ''}
          onClick={() => setViewMode(VIEW_MODES.DAY)}
        >
          Jour
        </button>
      </div>

      <div className="top-bar-right">
        {/* Can be settings icon or context menu */}
      </div>
    </div>
  );
}
