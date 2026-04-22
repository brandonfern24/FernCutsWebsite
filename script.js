// ── GOOGLE CALENDAR CONFIG ──
// STEP 1: Go to https://console.cloud.google.com
// STEP 2: Create a project → Enable "Google Calendar API"
// STEP 3: Create OAuth 2.0 credentials (Web Application)
//         Add https://brandonfern24.github.io to Authorized JavaScript origins
// STEP 4: Copy your Client ID below
const GOOGLE_CLIENT_ID = '257269245803-cm4fti2cjomaagvrl2akhp6782s9ga9a.apps.googleusercontent.com';
const CALENDAR_ID = 'brandonfern24@gmail.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let tokenClient;
let pendingFormData = null;

// ── LOAD GOOGLE IDENTITY SERVICES ──
function initGoogleAuth() {
  if (typeof google === 'undefined') return;
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        showToast('❌ Auth failed. Please try again.', true);
        return;
      }
      if (pendingFormData) {
        createCalendarEvent(pendingFormData, tokenResponse.access_token);
      }
    },
  });
}

// ── FORM SUBMIT ──
function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const data = {
    firstName: form.querySelector('input[placeholder="First name"]').value.trim(),
    lastName:  form.querySelector('input[placeholder="Last name"]').value.trim(),
    phone:     form.querySelector('input[type="tel"]').value.trim(),
    email:     form.querySelector('input[type="email"]').value.trim(),
    date:      form.querySelector('input[type="date"]').value,
    time:      form.querySelector('input[type="time"]').value,
    service:   form.querySelector('select').value,
  };

  if (!data.date || !data.time) {
    showToast('⚠️ Please select a date and time.', true);
    return;
  }

  pendingFormData = data;

  if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    showToast('⚠️ Add your Google Client ID to script.js', true);
    return;
  }

  if (typeof google === 'undefined') {
    showToast('⚠️ Google API not loaded. Check connection.', true);
    return;
  }

  setButtonState(true);
  tokenClient.requestAccessToken({ prompt: '' });
}

// ── CREATE CALENDAR EVENT ──
async function createCalendarEvent(data, accessToken) {
  const { firstName, lastName, phone, email, date, time, service } = data;

  // Build start/end datetimes (1 hour appointment)
  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime   = new Date(startDateTime.getTime() + 60 * 60 * 1000);

  const toISO = (d) => d.toISOString().replace('.000Z', '-05:00'); // Eastern Time offset

  const event = {
    summary: `✂️ ${service} — ${firstName} ${lastName}`,
    description: `Client: ${firstName} ${lastName}\nService: ${service}\nPhone: ${phone}\nEmail: ${email}`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'America/New_York',
    },
    attendees: [
      { email: CALENDAR_ID },
      { email: email, displayName: `${firstName} ${lastName}` },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email',  minutes: 60 },
        { method: 'popup',  minutes: 30 },
      ],
    },
  };

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Unknown error');
    }

    const created = await response.json();
    console.log('Event created:', created.htmlLink);

    showToast('✦ Appointment Booked! Check your email.');
    document.querySelector('.appt-form').reset();
    pendingFormData = null;

  } catch (err) {
    console.error('Calendar error:', err);
    showToast(`❌ Error: ${err.message}`, true);
  } finally {
    setButtonState(false);
  }
}

// ── UI HELPERS ──
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.borderColor = isError ? '#e05555' : 'var(--gold)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

function setButtonState(loading) {
  const btn = document.querySelector('.btn-submit');
  btn.textContent = loading ? 'Booking...' : 'Make Appointment';
  btn.disabled = loading;
  btn.style.opacity = loading ? '0.6' : '1';
}

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.08 });

document.querySelectorAll('section:not(#home)').forEach(s => observer.observe(s));

// Init Google Auth once GSI script loads
window.addEventListener('load', initGoogleAuth);
