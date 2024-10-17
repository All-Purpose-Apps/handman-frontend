import { gapi } from 'gapi-script';

const CLIENT_ID = '1040736667872-ag7rvp0srjd7b43r1n7bcdhe852cgj24.apps.googleusercontent.com'; // Replace with your actual client ID
const API_KEY = 'AIzaSyDpY9tQDhJAtQQ0TJd6ndco8zwpIN7qvaU'; // Replace with your actual API key
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly';

// Function to authenticate user with Google
export const authenticateGoogle = async () => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: SCOPES,
        });
        const authInstance = gapi.auth2.getAuthInstance();
        const isSignedIn = authInstance.isSignedIn.get();

        if (!isSignedIn) {
          // User is not signed in, prompt sign-in with required scopes
          await authInstance.signIn({ scope: SCOPES });
        } else {
          // User is signed in, check if they have granted the required scopes
          const currentUser = authInstance.currentUser.get();
          const grantedScopes = currentUser.getGrantedScopes();

          if (!SCOPES.split(' ').every((scope) => grantedScopes.includes(scope))) {
            // Request additional scopes if not all are granted
            await authInstance.signIn({ scope: SCOPES, prompt: 'consent' });
          }
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Function to list all Google Calendars
export const listGoogleCalendars = async () => {
  try {
    const response = await gapi.client.calendar.calendarList.list(); // Fetch all calendars for the user
    return response.result.items; // Return the list of calendars
  } catch (error) {
    console.error('Error fetching calendars: ', error);
    throw error;
  }
};

// Function to list events from the specified calendar
export const listGoogleCalendarEvents = async (calendarId = 'primary') => {
  try {
    const events = await gapi.client.calendar.events.list({
      calendarId: calendarId, // Use the provided calendar ID or default to 'primary'
      timeMin: new Date().toISOString(), // Get events from now
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return events.result.items;
  } catch (error) {
    console.error('Error fetching events: ', error);
    throw error;
  }
};

// Function to create a new event in the specified calendar
export const createGoogleCalendarEvent = async (eventDetails, calendarId = 'primary') => {
  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: calendarId, // Use the provided calendar ID or default to 'primary'
      resource: eventDetails,
    });
    return response.result;
  } catch (error) {
    console.error('Error creating event: ', error);
    throw error;
  }
};

// Function to get a single event by its ID from the specified calendar
export const getGoogleCalendarEventById = async (eventId, calendarId = 'primary') => {
  try {
    const event = await gapi.client.calendar.events.get({
      calendarId: calendarId, // Use the provided calendar ID or default to 'primary'
      eventId: eventId, // The event ID
    });
    return event.result;
  } catch (error) {
    console.error('Error fetching event: ', error);
    throw error;
  }
};
