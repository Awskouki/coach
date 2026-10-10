<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Carthage Coach Manager

A comprehensive gym management system for Coach Aymen with client management, session scheduling, payment tracking, and smart reminders.

View your app in AI Studio: https://ai.studio/apps/42e45b2b-d28e-4c47-8efe-19579d0869b9

## Features

- **Landing Page**: Public marketing website with sign-up form
- **Admin Dashboard**: Complete management system with:
  - Client management (CRUD operations)
  - Session scheduling with calendar view
  - Payment tracking
  - Sign-up request management
  - **Smart Reminders**: Send session reminders via browser notifications, SMS, or WhatsApp

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

## URL Structure

**Public Landing Page:**
- URL: `http://localhost:3000/`
- What users see: Marketing website with sign-up form
- **No admin button visible** - completely hidden from users

**Admin Access (Hidden):**
- URL: `http://localhost:3000/admin`
- Type this URL directly in your browser
- Not linked anywhere on the public site
- Password: `admin123`

**Admin Dashboard:**
- URL: `http://localhost:3000/admin/dashboard`
- Accessible only after login

## Smart Reminders

The app includes a reminder system for session notifications:

### Browser Notifications (Ready to Use)
- Click "Enable" in the Smart Reminders section to allow browser notifications
- Use the bell icon (🔔) next to any session to send a browser notification
- Works immediately without any configuration

### Copy to Clipboard (Manual Sending)
- Click the copy icon (📋) next to any session to copy the reminder message
- Paste the message into WhatsApp, SMS, or any messaging app
- Perfect for manual reminders

### SMS/WhatsApp Integration (Requires Setup)
To enable automatic SMS/WhatsApp reminders:

1. Sign up for a [Twilio account](https://www.twilio.com/try-twilio)
2. Get your Account SID, Auth Token, and Phone Number
3. Open `src/utils/reminderService.ts`
4. Update the `SMS_CONFIG` object:
   ```typescript
   const SMS_CONFIG = {
     enabled: true, // Change to true
     twilioAccountSid: 'YOUR_ACCOUNT_SID',
     twilioAuthToken: 'YOUR_AUTH_TOKEN',
     twilioPhoneNumber: 'YOUR_TWILIO_PHONE',
     whatsappEnabled: true, // For WhatsApp support
   };
   ```
5. Set up a backend API endpoint to call Twilio (see `sendSMSReminder` function)

**Note**: SMS/WhatsApp requires a backend server to securely handle Twilio credentials. The current implementation is frontend-only and uses browser notifications + manual copy-paste.

## Default Credentials

- **Admin Password**: `admin123` (⚠️ **Change this before deploying!**)
- See [SECURITY.md](SECURITY.md) for how to change password and security best practices

## Data Storage

All data is stored in browser localStorage:
- `coach_clients`: Client information
- `coach_sessions`: Session schedules
- `signup_requests`: Pending sign-ups from landing page

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Motion (Framer Motion)
- Recharts
- Lucide Icons
