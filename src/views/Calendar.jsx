import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { authenticateGoogle, listGoogleCalendarEvents, listGoogleCalendars, createGoogleCalendarEvent, getGoogleCalendarEventById } from '../utils/googleCalendarApi';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const [events, setEvents] = useState([]);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [isEventCreated, setIsEventCreated] = useState(false);
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendarId, setSelectedCalendarId] = useState('');

    // Fetch Google Calendars on load
    useEffect(() => {
        const fetchCalendars = async () => {
            await authenticateGoogle();
            const calendarList = await listGoogleCalendars();
            setCalendars(calendarList);
            // Set the first calendar as the default selection
            if (calendarList.length > 0) {
                setSelectedCalendarId(calendarList[0].id);
            }
        };

        fetchCalendars();
    }, []);
    // Sync with selected Google Calendar
    useEffect(() => {
        if (!selectedCalendarId) return;

        const syncGoogleCalendar = async () => {
            await authenticateGoogle();
            const googleEvents = await listGoogleCalendarEvents(selectedCalendarId);
            const mappedEvents = googleEvents.map(event => ({

                title: event.summary,
                start: new Date(event.start.dateTime || event.start.date),
                end: new Date(event.end.dateTime || event.end.date),
            }));

            setEvents(mappedEvents);
        };

        const event = getGoogleCalendarEventById("7bg837bv8ea9qom8c538cc2b20", selectedCalendarId);
        syncGoogleCalendar();
    }, [selectedCalendarId, isEventCreated]); // Re-sync when the calendar changes or a new event is created

    // Handle calendar selection
    const handleCalendarChange = (event) => {
        setSelectedCalendarId(event.target.value);
    };

    // Handle the creation of a new event
    const handleCreateEvent = async () => {
        const eventDetails = {
            summary: newEventTitle,
            start: {
                dateTime: new Date(newEventDate).toISOString(),
                timeZone: 'America/Los_Angeles',
            },
            end: {
                dateTime: new Date(new Date(newEventDate).getTime() + 60 * 60 * 1000).toISOString(), // 1-hour event
                timeZone: 'America/Los_Angeles',
            },
        };

        try {
            await authenticateGoogle(); // Ensure authentication
            const createdEvent = await createGoogleCalendarEvent(eventDetails, selectedCalendarId); // Create event on selected Google Calendar
            console.log('Event created: ', createdEvent);
            setIsEventCreated(true); // Trigger re-sync with the new event
            alert('Event successfully created!');
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event.');
        }
    };

    return (
        <div style={{ height: '100vh', padding: '20px' }}>
            <h1>My Calendar</h1>

            <div style={{ marginBottom: '20px' }}>
                <h3>Select a Calendar</h3>
                <select value={selectedCalendarId} onChange={handleCalendarChange}>
                    {calendars.map(calendar => (
                        <option key={calendar.id} value={calendar.id}>
                            {calendar.summary}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Create a New Event</h3>
                <input
                    type="text"
                    placeholder="Event Title"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    style={{ marginRight: '10px' }}
                />
                <input
                    type="datetime-local"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    style={{ marginRight: '10px' }}
                />
                <button onClick={handleCreateEvent}>Create Event</button>
            </div>

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
            />
        </div>
    );
};

export default MyCalendar;