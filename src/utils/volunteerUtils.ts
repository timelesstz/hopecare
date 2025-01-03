import { Permission, VolunteerRole, VolunteerStats, VolunteerEvent } from '../types/volunteer';

export const hasPermission = (
  role: VolunteerRole,
  resource: Permission['resource'],
  action: Permission['actions'][number]
): boolean => {
  const permission = role.permissions.find(p => p.resource === resource);
  return permission ? permission.actions.includes(action) : false;
};

export const calculateImpactScore = (
  hoursLogged: number,
  eventsAttended: number,
  teamSize: number
): number => {
  const hourScore = hoursLogged * 2;
  const eventScore = eventsAttended * 10;
  const teamScore = teamSize * 5;
  return Math.round(hourScore + eventScore + teamScore);
};

export const getUpcomingEvents = (events: VolunteerEvent[]): VolunteerEvent[] => {
  const now = new Date();
  return events
    .filter(event => new Date(event.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const formatEventDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatEventTime = (time: string): string => {
  const [start, end] = time.split('-');
  return `${formatTime(start)} - ${formatTime(end)}`;
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

export const getRoleLevel = (role: VolunteerRole): number => {
  const levels = {
    junior: 1,
    senior: 2,
    lead: 3,
    coordinator: 4
  };
  return levels[role.level] || 0;
};

export const canManageTeam = (role: VolunteerRole): boolean => {
  return ['lead', 'coordinator'].includes(role.level);
};

export const canEditSettings = (role: VolunteerRole): boolean => {
  return role.level === 'coordinator';
};

export const calculateVolunteerStats = (
  hoursLogged: number,
  eventsAttended: number,
  teamSize: number
): VolunteerStats => {
  return {
    hoursLogged,
    eventsAttended,
    teamSize,
    impactScore: calculateImpactScore(hoursLogged, eventsAttended, teamSize)
  };
};