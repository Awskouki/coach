# 📖 User Guide - Carthage Coach Manager

## Table of Contents
1. [Overview](#overview)
2. [Landing Page (Public)](#landing-page-public)
3. [Admin Dashboard](#admin-dashboard)
4. [Features Guide](#features-guide)
5. [Tips & Best Practices](#tips--best-practices)

---

## Overview

Carthage Coach Manager is a complete gym management system with:
- **Public Landing Page** - Marketing website for potential clients
- **Admin Dashboard** - Full management system for coaches

---

## Landing Page (Public)

### What Users See:
- **Hero Section** - Eye-catching introduction
- **Services** - Personal training, group classes, nutrition, flexible schedule
- **About** - Why choose your coaching
- **Testimonials** - Success stories
- **Contact** - Phone, email, location
- **Sign-Up Form** - Easy registration

### Sign-Up Process:
1. User clicks "Join Now" button
2. Fills out form:
   - Name *
   - Phone *
   - Email
   - Weight (kg) *
   - Height (cm) *
   - Goal (weight loss, muscle gain, etc.)
   - Subscription Plan (3 or 6 months)
   - Payment Method (cash or bank transfer)
   - Message (optional)
3. Submits form
4. Request appears in admin dashboard

---

## Admin Dashboard

### Accessing Admin:
1. Go to: `yoursite.com/admin`
2. Enter password: `admin123` (change this!)
3. Access dashboard

### Dashboard Sections:

#### 1. **Dashboard (Home)**
- Overview of your gym
- Active clients count
- Today's sessions
- Pending payments
- Total revenue
- Recent clients list
- Upcoming sessions

#### 2. **Sign-Ups**
- View pending sign-up requests
- See all client information:
  - Name, phone, email
  - Weight, height
  - Goal
  - Subscription plan
  - Payment method
  - Message
- Actions:
  - **Approve & Add** - Pre-fills add client form
  - **Reject** - Removes request

#### 3. **Clients**
- **Left Panel:** Client list with search
- **Right Panel:** Selected client profile

**Client Profile Includes:**
- Personal info (name, phone, email)
- Current weight & height (editable)
- Weight tracker chart
- Progress history
- Nutrition & regime plan (editable)
- Financial info
- Payment status
- Subscription type
- Actions: Delete client

**Adding New Client:**
1. Click "+ Add Client" button
2. Fill in form:
   - Name *
   - Phone
   - Email
   - Weight (kg) *
   - Height (cm) *
   - Regime/diet plan
   - Subscription type
   - Payment method
3. Save

**Editing Client:**
- Click on client in list
- Edit any field directly
- Changes auto-save to localStorage

**Deleting Client:**
- Select client
- Click "Delete" button
- Confirm deletion
- Client and their sessions are removed

#### 4. **Schedule**
- **Calendar View** - Monthly calendar with sessions
- **Upcoming Sessions** - Next 48 hours
- **Smart Reminders** - Notification system

**Scheduling Session:**
1. Click "Quick Schedule" button
2. Session created for first client
3. Edit date/time as needed

**Session Actions:**
- 📋 **Copy** - Copy reminder message to clipboard
- 🔔 **Bell** - Send browser notification
- ✅ **Check** - Mark session as completed

**Smart Reminders:**
- Browser notifications (free)
- SMS/WhatsApp (requires Twilio setup)
- Copy-to-clipboard for manual sending

#### 5. **Payments**
- **Financial Overview Table:**
  - Client name
  - Subscription plan
  - Amount (450 or 800 TND)
  - Payment status (paid/pending)
  - Payment method

- **Bank Transfer Info:**
  - Account details
  - IBAN
  - Copy button

- **Quick Stats:**
  - Pending approvals
  - Monthly projection

---

## Features Guide

### 1. Client Management (CRUD)

**Create:**
- Add new clients manually
- Or approve from sign-ups

**Read:**
- View all clients
- Search by name or phone
- See detailed profiles
- Track progress over time

**Update:**
- Edit weight/height (auto-tracks in progress)
- Update contact info
- Modify regime/diet plan
- Change payment status
- Update subscription type

**Delete:**
- Remove clients
- Confirmation required
- Associated sessions also deleted

### 2. Progress Tracking

**Weight Tracker:**
- Automatic chart generation
- Shows weight changes over time
- Orange gradient visualization
- Hover to see exact values

**How it Works:**
- When you update client's weight or height
- New data point added to progress array
- Chart updates automatically
- One entry per day (updates if same day)

### 3. Session Management

**Creating Sessions:**
- Quick schedule button
- Manual date/time selection
- Assign to specific client

**Session Status:**
- **Scheduled** - Upcoming session
- **Completed** - Finished session
- **Cancelled** - Cancelled session

**Reminders:**
- Browser notifications (instant)
- Copy message for WhatsApp/SMS
- Automatic formatting with client name and time

### 4. Payment Tracking

**Payment Status:**
- **Paid** - Green badge
- **Pending** - Yellow badge

**Subscription Plans:**
- 3 Months - 450 TND
- 6 Months - 800 TND

**Payment Methods:**
- Cash
- Bank Transfer

**Updating Payment:**
- Select client
- Change payment status in profile
- Updates immediately

### 5. Sign-Up Management

**Workflow:**
1. User submits sign-up on landing page
2. Request appears in "Sign-Ups" tab
3. Review all information
4. Click "Approve & Add"
5. Form pre-fills with sign-up data
6. Adjust if needed
7. Save as new client
8. Sign-up request removed

**Rejecting:**
- Click trash icon
- Confirm rejection
- Request removed

---

## Tips & Best Practices

### Daily Routine:
1. **Morning:**
   - Check Sign-Ups tab for new requests
   - Review today's sessions in Dashboard
   - Send reminders for upcoming sessions

2. **During Day:**
   - Mark completed sessions
   - Update client progress after sessions
   - Respond to new sign-ups

3. **Evening:**
   - Review tomorrow's schedule
   - Update any pending payments
   - Backup important data

### Client Management:
- ✅ Update weight after each session
- ✅ Keep regime plans current
- ✅ Track payment status regularly
- ✅ Add notes in regime field
- ✅ Use search to find clients quickly

### Session Management:
- ✅ Schedule sessions in advance
- ✅ Send reminders 2 hours before
- ✅ Mark completed immediately
- ✅ Use copy button for WhatsApp reminders

### Data Management:
- ✅ Export data weekly (copy from localStorage)
- ✅ Keep backup of client list
- ✅ Don't delete clients unless necessary
- ✅ Use browser bookmarks for quick access

### Security:
- ✅ Always logout when done
- ✅ Don't share admin URL publicly
- ✅ Change default password
- ✅ Use strong password
- ✅ Don't leave computer unlocked

### Performance:
- ✅ Clear old sessions periodically
- ✅ Archive completed clients if needed
- ✅ Keep browser updated
- ✅ Use Chrome or Firefox for best experience

---

## Keyboard Shortcuts

- `Ctrl + F` - Search in client list
- `Esc` - Close modals
- `Tab` - Navigate form fields
- `Enter` - Submit forms

---

## Data Storage

All data is stored in browser's localStorage:

**Keys:**
- `coach_clients` - All client data
- `coach_sessions` - All sessions
- `signup_requests` - Pending sign-ups
- `admin_authenticated` - Login status
- `last_activity` - Session timeout tracking
- `login_attempts` - Rate limiting

**Viewing Data:**
1. Open browser DevTools (F12)
2. Go to Application tab
3. Click Local Storage
4. Select your domain
5. See all stored data

**Exporting Data:**
```javascript
// Run in browser console
const clients = localStorage.getItem('coach_clients');
console.log(clients);
// Copy and save to file
```

**Importing Data:**
```javascript
// Run in browser console
const data = '...'; // Your backed up data
localStorage.setItem('coach_clients', data);
location.reload();
```

---

## Troubleshooting

### Can't Login:
- Check password is correct
- Wait if locked out (15 minutes)
- Clear browser cache
- Try incognito mode

### Sign-ups Not Showing:
- Check Sign-Ups tab (not Dashboard)
- Refresh page
- Check localStorage for `signup_requests`

### Client Data Lost:
- Check if accidentally deleted
- Restore from backup
- Check browser localStorage

### Sessions Not Saving:
- Check browser console for errors
- Verify localStorage not full
- Try different browser

### Reminders Not Working:
- Enable browser notifications
- Check notification permissions
- Use copy button as backup

### Chart Not Showing:
- Add at least 2 weight entries
- Check progress array has data
- Refresh page

---

## Mobile Usage

The dashboard works on mobile but is optimized for desktop. For best experience:

**Recommended:**
- Use desktop/laptop for admin tasks
- Use mobile for quick checks

**Mobile Tips:**
- Rotate to landscape for better view
- Use search to find clients quickly
- Pin admin URL to home screen
- Use copy button for reminders

---

## Browser Compatibility

**Fully Supported:**
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

**Minimum Versions:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Getting Help

### Common Questions:

**Q: How do I change my password?**
A: See SECURITY.md for instructions

**Q: Can I have multiple admins?**
A: Not currently - future feature

**Q: Is my data backed up?**
A: No automatic backup - export manually

**Q: Can I export client data?**
A: Yes - copy from localStorage or use export feature (future)

**Q: Does it work offline?**
A: Yes - all data is local

**Q: Can I customize colors/branding?**
A: Yes - edit CSS in src/index.css

---

## Feature Requests

Want a new feature? Consider:
- Client mobile app
- Automated SMS reminders
- Payment integration
- Workout plan builder
- Meal plan generator
- Progress photos
- Client portal
- Multiple coaches
- Attendance tracking
- Revenue reports

---

## Updates & Changelog

### Version 1.0 (Current)
- ✅ Landing page
- ✅ Admin dashboard
- ✅ Client management (CRUD)
- ✅ Session scheduling
- ✅ Payment tracking
- ✅ Sign-up management
- ✅ Progress tracking
- ✅ Smart reminders
- ✅ Security features

### Planned Features:
- Export/Import data
- Email notifications
- Client portal
- Mobile app
- Payment integration
- Advanced analytics

---

**Need more help? Check README.md, SECURITY.md, and DEPLOYMENT.md**
