import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, List, Utensils, Settings, Plus } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openNewEvent } = useCalendar();

  const isHome = location.pathname === '/';
  const isAgenda = location.pathname === '/agenda';
  const isMeals = location.pathname === '/meals';
  const isSettings = location.pathname === '/settings';

  const handleAddClick = () => {
    if (isHome || isAgenda) {
      openNewEvent();
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${isHome ? 'active' : ''}`}>
        <Calendar />
        <span>Calendrier</span>
      </Link>
      
      <Link to="/agenda" className={`nav-item ${isAgenda ? 'active' : ''}`}>
        <List />
        <span>Agenda</span>
      </Link>

      <button className="nav-add-btn" onClick={handleAddClick}>
        <Plus size={28} />
      </button>

      <Link to="/meals" className={`nav-item ${isMeals ? 'active' : ''}`}>
        <Utensils />
        <span>Repas</span>
      </Link>

      <Link to="/settings" className={`nav-item ${isSettings ? 'active' : ''}`}>
        <Settings />
        <span>Paramètres</span>
      </Link>
    </nav>
  );
}
