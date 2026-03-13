/**
 * ICS Parser — Parse .ics (iCalendar) files for event import
 * Supports Samsung Calendar, Apple Calendar, Google Calendar exports
 */

export function parseICSFile(icsContent) {
  const events = [];
  const lines = unfoldLines(icsContent);
  let currentEvent = null;
  let inEvent = false;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
      continue;
    }

    if (line === 'END:VEVENT') {
      if (currentEvent) {
        const parsed = buildEvent(currentEvent);
        if (parsed) events.push(parsed);
      }
      inEvent = false;
      currentEvent = null;
      continue;
    }

    if (inEvent && currentEvent) {
      const { key, params, value } = parseLine(line);
      if (key) {
        currentEvent[key] = { value, params };
      }
    }
  }

  return events;
}

function unfoldLines(content) {
  // ICS spec: lines starting with space/tab are continuations
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
}

function parseLine(line) {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return {};

  const keyPart = line.substring(0, colonIndex);
  const value = line.substring(colonIndex + 1);

  const semiIndex = keyPart.indexOf(';');
  const key = semiIndex === -1 ? keyPart : keyPart.substring(0, semiIndex);
  const params = semiIndex === -1 ? '' : keyPart.substring(semiIndex + 1);

  return { key: key.toUpperCase(), params, value };
}

function buildEvent(raw) {
  const title = raw['SUMMARY']?.value || 'Événement importé';
  const description = raw['DESCRIPTION']?.value?.replace(/\\n/g, '\n')?.replace(/\\,/g, ',') || '';
  const location = raw['LOCATION']?.value?.replace(/\\,/g, ',') || '';

  const startDate = parseICSDate(raw['DTSTART']);
  const endDate = parseICSDate(raw['DTEND']) || startDate;

  if (!startDate) return null;

  const allDay = raw['DTSTART']?.params?.includes('VALUE=DATE') ||
    raw['DTSTART']?.value?.length === 8;

  // Parse recurrence
  let recurrence = 'none';
  if (raw['RRULE']) {
    const rrule = raw['RRULE'].value;
    if (rrule.includes('FREQ=DAILY')) recurrence = 'daily';
    else if (rrule.includes('FREQ=WEEKLY')) recurrence = 'weekly';
    else if (rrule.includes('FREQ=MONTHLY')) recurrence = 'monthly';
    else if (rrule.includes('FREQ=YEARLY')) recurrence = 'yearly';
  }

  return {
    title,
    description,
    location,
    startDate,
    endDate,
    allDay,
    category: 'other',
    color: '#6b7280',
    recurrence,
    reminders: [15],
    imported: true,
  };
}

function parseICSDate(field) {
  if (!field?.value) return null;
  const val = field.value;

  // DATE-TIME format: 20230115T120000Z or 20230115T120000
  if (val.length >= 15) {
    const year = parseInt(val.slice(0, 4));
    const month = parseInt(val.slice(4, 6)) - 1;
    const day = parseInt(val.slice(6, 8));
    const hour = parseInt(val.slice(9, 11));
    const minute = parseInt(val.slice(11, 13));
    const second = parseInt(val.slice(13, 15));

    if (val.endsWith('Z')) {
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
    return new Date(year, month, day, hour, minute, second);
  }

  // DATE format: 20230115
  if (val.length === 8) {
    const year = parseInt(val.slice(0, 4));
    const month = parseInt(val.slice(4, 6)) - 1;
    const day = parseInt(val.slice(6, 8));
    return new Date(year, month, day);
  }

  return null;
}

export function generateICS(events) {
  let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//NousDeux//Calendar//FR\r\nCALSCALE:GREGORIAN\r\n';

  for (const event of events) {
    ics += 'BEGIN:VEVENT\r\n';
    ics += `SUMMARY:${escapeICS(event.title)}\r\n`;
    if (event.description) ics += `DESCRIPTION:${escapeICS(event.description)}\r\n`;
    if (event.location) ics += `LOCATION:${escapeICS(event.location)}\r\n`;

    if (event.allDay) {
      ics += `DTSTART;VALUE=DATE:${formatICSDate(event.startDate)}\r\n`;
      ics += `DTEND;VALUE=DATE:${formatICSDate(event.endDate)}\r\n`;
    } else {
      ics += `DTSTART:${formatICSDateTime(event.startDate)}\r\n`;
      ics += `DTEND:${formatICSDateTime(event.endDate)}\r\n`;
    }

    ics += `UID:${crypto.randomUUID()}@nousdeux.app\r\n`;
    ics += 'END:VEVENT\r\n';
  }

  ics += 'END:VCALENDAR\r\n';
  return ics;
}

function formatICSDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function formatICSDateTime(date) {
  const d = new Date(date);
  return `${formatICSDate(d)}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
}

function escapeICS(text) {
  return text.replace(/,/g, '\\,').replace(/\n/g, '\\n').replace(/;/g, '\\;');
}
