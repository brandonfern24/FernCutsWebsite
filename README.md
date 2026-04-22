# FernCutsWebsite — Google Calendar Setup

To make appointments automatically appear in your Google Calendar, follow these steps:

## Step 1 — Create a Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click **"New Project"** → name it `FernCuts` → click **Create**

## Step 2 — Enable Google Calendar API
1. In the left menu go to **APIs & Services → Library**
2. Search for **Google Calendar API** → click it → click **Enable**

## Step 3 — Create OAuth Credentials
1. Go to **APIs & Services → Credentials**
2. Click **"+ Create Credentials" → OAuth 2.0 Client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: `FernCuts`
   - Support email: `Brandonfern24@gmail.com`
   - Add scope: `https://www.googleapis.com/auth/calendar.events`
   - Add test user: `Brandonfern24@gmail.com`
4. Back in Credentials → Application type: **Web application**
5. Under **Authorized JavaScript origins** add:
   - `https://brandonfern24.github.io`
6. Click **Create** → Copy the **Client ID**

## Step 4 — Add Client ID to script.js
Open `script.js` and replace line 8:
```
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';
```
With your actual Client ID:
```
const GOOGLE_CLIENT_ID = '123456789-abc.apps.googleusercontent.com';
```

## Step 5 — Deploy
Push all 3 files (`index.html`, `style.css`, `script.js`) to your GitHub repo.

## How It Works
When a client fills out the form and clicks **Make Appointment**:
1. Google pops up a one-time sign-in prompt (only first use)
2. The appointment is added to your `brandonfern24@gmail.com` Google Calendar
3. A confirmation email is sent to both you and the client
4. The event includes: client name, service, phone, and email in the notes
