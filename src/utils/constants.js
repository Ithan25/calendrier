export const CATEGORIES = [
  { id: 'couple', name: 'Couple', color: '#ec4899', icon: '💕' },
  { id: 'work', name: 'Travail', color: '#3b82f6', icon: '💼' },
  { id: 'personal', name: 'Personnel', color: '#8b5cf6', icon: '👤' },
  { id: 'sport', name: 'Sport', color: '#22c55e', icon: '🏃' },
  { id: 'health', name: 'Santé', color: '#ef4444', icon: '❤️' },
  { id: 'social', name: 'Social', color: '#f59e0b', icon: '🎉' },
  { id: 'travel', name: 'Voyage', color: '#06b6d4', icon: '✈️' },
  { id: 'other', name: 'Autre', color: '#6b7280', icon: '📌' },
];

export const RECURRENCE_OPTIONS = [
  { id: 'none', label: 'Jamais' },
  { id: 'daily', label: 'Tous les jours' },
  { id: 'weekly', label: 'Toutes les semaines' },
  { id: 'biweekly', label: 'Toutes les 2 semaines' },
  { id: 'monthly', label: 'Tous les mois' },
  { id: 'yearly', label: 'Tous les ans' },
];

export const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const WEEKDAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const VIEW_MODES = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  AGENDA: 'agenda',
};

export const DEFAULT_EVENT = {
  title: '',
  description: '',
  location: '',
  startDate: null,
  endDate: null,
  allDay: false,
  category: 'personal',
  color: '#8b5cf6',
  recurrence: 'none',
  reminders: [15],
};
