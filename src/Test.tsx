import { useEffect, useState } from "react";
import {
  initializeGapiClient,
  listCalendars,
  listEvents,
  addEvent,
} from "./services/gapiService";
import { initializeGisClient } from "./services/gisService";

const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/calendar";

const FIXED_EVENT = {
  summary: "Office Hours",
  location: "Online",
  description: "Weekly office hours for students",
  start: {
    dateTime: "2024-12-01T10:00:00-05:00",
    timeZone: "America/New_York",
  },
  end: {
    dateTime: "2024-12-01T11:00:00-05:00",
    timeZone: "America/New_York",
  },
};

function GoogleCalendar() {
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [tokenClient, setTokenClient] = useState<any | null>(null);
  const [calendars, setCalendars] = useState<string>("");
  const [events, setEvents] = useState<string>("");

  useEffect(() => {
    const loadScripts = () => {
      const gapiScript = document.createElement("script");
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.onload = () =>
        (window as any).gapi.load("client", onGapiLoaded);
      document.body.appendChild(gapiScript);

      const gisScript = document.createElement("script");
      gisScript.src = "https://accounts.google.com/gsi/client";
      gisScript.onload = onGisLoaded;
      document.body.appendChild(gisScript);
    };

    loadScripts();
  }, []);

  const onGapiLoaded = async () => {
    await initializeGapiClient(
      import.meta.env.VITE_CALENDAR_API_KEY,
      DISCOVERY_DOCS
    );
    setGapiInited(true);
    maybeEnableButtons();
  };

  const onGisLoaded = () => {
    const client = initializeGisClient(
      import.meta.env.VITE_CALENDAR_CLIENT_ID,
      SCOPES,
      async (response: any) => {
        if (response.error) {
          console.error(response.error);
          return;
        }
        await refreshCalendarsAndEvents();
      }
    );
    setTokenClient(client);
    setGisInited(true);
    // maybeEnableButtons();
  };

  // const maybeEnableButtons = () => {
  //   if (gapiInited && gisInited) {
  //     document.getElementById("authorize_button")!.style.visibility = "visible";
  //   }
  // };

  const handleAuthClick = () => {
    if (tokenClient) {
      tokenClient.callback = async (resp: any) => {
        if (resp.error) throw resp;
        await refreshCalendarsAndEvents();
      };

      const token = (window as any).gapi.client.getToken();
      if (!token) {
        tokenClient.requestAccessToken({ prompt: "consent" });
      } else {
        tokenClient.requestAccessToken({ prompt: "" });
      }
    }
  };

  const handleSignoutClick = () => {
    const token = (window as any).gapi.client.getToken();
    if (token) {
      (window as any).google.accounts.oauth2.revoke(token.access_token);
      (window as any).gapi.client.setToken(null);
      setCalendars("");
      setEvents("");
    }
  };

  const refreshCalendarsAndEvents = async () => {
    try {
      const calendarsList = await listCalendars();
      const calendarOutput = calendarsList
        .map((cal) => `Name: ${cal.summary}, ID: ${cal.id}`)
        .join("\n");
      setCalendars(calendarOutput);

      const eventsList = await listEvents(import.meta.env.VITE_CALENDAR_ID);
      const eventsOutput = eventsList
        .map(
          (event) =>
            `${event.summary} (${event.start.dateTime || event.start.date})`
        )
        .join("\n");
      setEvents(eventsOutput);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddEvent = async () => {
    try {
      const result = await addEvent(
        import.meta.env.VITE_CALENDAR_ID,
        FIXED_EVENT
      );
      alert(`Event created: ${result.htmlLink}`);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <div>
      <p>Google Calendar API Quickstart</p>
      {/* <button id="authorize_button" onClick={handleAuthClick}>
        Authorize
      </button>
      <button id="signout_button" onClick={handleSignoutClick}>
        Sign Out
      </button>
      <button onClick={handleAddEvent}>Add Event</button> */}
      <iframe
        src={import.meta.env.VITE_CALENDAR_EMBED_URL}
        style={{ border: 0 }}
        width="800"
        height="600"
      ></iframe>
      <pre id="calendars" style={{ whiteSpace: "pre-wrap" }}>
        {calendars}
      </pre>
      <pre id="content" style={{ whiteSpace: "pre-wrap" }}>
        {events}
      </pre>
    </div>
  );
}

export default GoogleCalendar;
