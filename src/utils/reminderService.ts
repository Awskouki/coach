/**
 * Reminder Service
 * Handles session reminders via browser notifications and SMS/WhatsApp
 */

import { Session, Client } from '../types';

// SMS/WhatsApp Configuration (Add your Twilio credentials here)
const SMS_CONFIG = {
  enabled: false, // Set to true when you add Twilio credentials
  twilioAccountSid: '', // Add your Twilio Account SID
  twilioAuthToken: '', // Add your Twilio Auth Token
  twilioPhoneNumber: '', // Add your Twilio phone number
  whatsappEnabled: false, // Set to true for WhatsApp
};

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Show browser notification
 */
export const showBrowserNotification = (title: string, body: string, icon?: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'session-reminder',
      requireInteraction: true,
    });
  }
};

/**
 * Check for upcoming sessions and send reminders
 */
export const checkUpcomingSessions = (
  sessions: Session[],
  clients: Client[],
  reminderMinutes: number = 120 // Default: 2 hours before
): Session[] => {
  const now = new Date();
  const upcomingSessions: Session[] = [];

  sessions.forEach((session) => {
    if (session.status !== 'scheduled') return;

    const sessionTime = new Date(session.dateTime);
    const timeDiff = sessionTime.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    // Check if session is within reminder window (e.g., 2 hours before)
    if (minutesDiff > 0 && minutesDiff <= reminderMinutes) {
      upcomingSessions.push(session);
    }
  });

  return upcomingSessions;
};

/**
 * Format session reminder message
 */
export const formatReminderMessage = (session: Session, clientName: string): string => {
  const sessionTime = new Date(session.dateTime);
  const timeStr = sessionTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = sessionTime.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return `Hi ${clientName}! Reminder: You have a training session today at ${timeStr} (${dateStr}). See you soon! 💪`;
};

/**
 * Send SMS reminder via Twilio (requires backend or Twilio credentials)
 */
export const sendSMSReminder = async (
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; message: string }> => {
  if (!SMS_CONFIG.enabled) {
    return {
      success: false,
      message: 'SMS service not configured. Add your Twilio credentials to enable SMS reminders.',
    };
  }

  // This would require a backend API call to Twilio
  // For now, we'll return a placeholder response
  try {
    // Example: You would call your backend API here
    // const response = await fetch('/api/send-sms', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to: phoneNumber, message })
    // });

    console.log('SMS would be sent to:', phoneNumber);
    console.log('Message:', message);

    return {
      success: false,
      message: 'SMS API not configured. To enable:\n1. Sign up for Twilio\n2. Add credentials to reminderService.ts\n3. Set up a backend endpoint',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to send SMS: ' + (error as Error).message,
    };
  }
};

/**
 * Send WhatsApp reminder via Twilio
 */
export const sendWhatsAppReminder = async (
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; message: string }> => {
  if (!SMS_CONFIG.whatsappEnabled) {
    return {
      success: false,
      message: 'WhatsApp service not configured. Enable WhatsApp in Twilio and update SMS_CONFIG.',
    };
  }

  // Similar to SMS, this requires backend integration
  console.log('WhatsApp would be sent to:', phoneNumber);
  console.log('Message:', message);

  return {
    success: false,
    message: 'WhatsApp API not configured. Follow the same steps as SMS setup.',
  };
};

/**
 * Copy message to clipboard (manual sending option)
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Get reminder status
 */
export const getReminderStatus = (): {
  browserNotifications: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
} => {
  return {
    browserNotifications: Notification.permission === 'granted',
    smsEnabled: SMS_CONFIG.enabled,
    whatsappEnabled: SMS_CONFIG.whatsappEnabled,
  };
};

/**
 * Send a browser notification for a session reminder
 */
export const sendSessionReminder = (session: Session, clientName: string): boolean => {
  if (Notification.permission !== 'granted') return false;
  const message = formatReminderMessage(session, clientName);
  showBrowserNotification('Rappel de séance', message);
  return true;
};

/**
 * Initialize reminder system — checks upcoming sessions every 5 minutes
 */
export const initializeReminderSystem = (
  sessions: Session[],
  clients: Client[],
  onUpcoming?: (upcoming: Session[]) => void
): (() => void) => {
  const check = () => {
    const upcoming = checkUpcomingSessions(sessions, clients);
    onUpcoming?.(upcoming);
  };

  check();
  const intervalId = window.setInterval(check, 5 * 60 * 1000);
  return () => window.clearInterval(intervalId);
};
