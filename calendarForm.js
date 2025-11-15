const CLIENT_ID = "276239423773-t13v3p3lfgq7vt43raft0bacppva9kb2.apps.googleusercontent.com";
const API_KEY = "AIzaSyBtHzc0TY_f6jogwQqp-UVZiOX6YVko_vM";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let tokenClient;
let gapiInited = false;

// Called by gapi script when it loads
function gapiLoaded() {
  console.log("🔄 gapiLoaded() called - starting initialization...");
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  try {
    console.log("🔄 Initializing Google API client...");
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    console.log("✅ Google API initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing Google API:", error);
  }
}

window.addEventListener("load", function () {
  console.log("📍 Window load event fired");
  
  // Initialize tokenClient
  try {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: handleAuthResponse,
    });
    console.log("✅ Token client initialized");
  } catch (error) {
    console.error("❌ Error initializing token client:", error);
  }

  // Form submission handler
  const form = document.getElementById("calendarForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      console.log("📝 Form submitted. gapiInited:", gapiInited);
      
      if (!gapiInited) {
        alert("⏳ Google API still initializing. Please wait a moment and try again.");
        return;
      }
      
      if (!tokenClient) {
        alert("❌ Authentication not ready. Please refresh the page.");
        return;
      }
      
      console.log("🔐 Requesting access token...");
      tokenClient.requestAccessToken();
    });
  }

  // Menu toggle
  const menuIcon = document.getElementById("menu-icon");
  if (menuIcon) {
    menuIcon.addEventListener("click", function() {
      const navLinks = document.getElementById("nav-links");
      navLinks.classList.toggle("active");
      this.innerHTML = navLinks.classList.contains("active")
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });
  }
});

function handleAuthResponse(response) {
  console.log("🔐 Auth response received:", response);
  if (response && response.access_token) {
    addEventToCalendar();
  } else {
    alert("❌ Authentication failed. Please try again.");
  }
}

async function addEventToCalendar() {
  const fname = document.getElementById("fname").value;
  const lname = document.getElementById("lname").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const note = document.getElementById("note").value;

  console.log("📅 Creating event:", { fname, lname, phone, email, date, time });

  const startDateTime = new Date(`${date}T${time}:00-05:00`).toISOString();
  const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

  const event = {
    summary: `Meeting with ${fname} ${lname}`,
    description: `📞 Phone: ${phone}\n📧 Email: ${email}\n📝 Notes: ${note}`,
    start: { dateTime: startDateTime, timeZone: "America/New_York" },
    end: { dateTime: endDateTime, timeZone: "America/New_York" },
  };

  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: "293a45ffa92c6a39aa7432795e7a1c24a382a2a7cfc8141bcf1a0d808e7da465@group.calendar.google.com",
      resource: event,
    });
    alert("✅ Event added successfully!");
    console.log("Event created:", response.result);

    // Clear form
    document.getElementById("calendarForm").reset();

    // Refresh iframe
    document.querySelector('iframe').src = document.querySelector('iframe').src;
  } catch (error) {
    console.error("Error adding event:", error);
    alert("❌ Failed to add event. Check console for details.");
  }
}
// Setup menu icon toggle
document.addEventListener("DOMContentLoaded", function() {
  const menuIcon = document.getElementById("menu-icon");
  if (menuIcon) {
    menuIcon.addEventListener("click", function() {
      const navLinks = document.getElementById("nav-links");
      navLinks.classList.toggle("active");
      this.innerHTML = navLinks.classList.contains("active")
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });
  }
});