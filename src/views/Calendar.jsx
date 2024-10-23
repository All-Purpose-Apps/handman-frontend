// MyCalendar.js

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import {
    fetchCalendars,
    fetchCalendar,
    createCalendarEvent,
} from '../store/calendarSlice';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const dispatch = useDispatch();

    // Extract calendars and events from Redux state
    const { calendars, calendar: events, status, error } = useSelector((state) => state.calendar);

    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [selectedCalendarId, setSelectedCalendarId] = useState('');

    // Fetch Google Calendars on load
    useEffect(() => {
        dispatch(fetchCalendars());
    }, [dispatch]);

    // Set the first calendar as the default selection
    useEffect(() => {
        if (calendars && calendars.length > 0) {
            setSelectedCalendarId(calendars[0].id);
        }
    }, [calendars]);

    // Sync with selected Google Calendar
    useEffect(() => {
        if (!selectedCalendarId) return;
        dispatch(fetchCalendar({ calendarId: selectedCalendarId }));
    }, [selectedCalendarId, dispatch]);

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
                timeZone: 'America/New_York',
            },
            end: {
                dateTime: new Date(new Date(newEventDate).getTime() + 60 * 60 * 1000).toISOString(), // 1-hour event
                timeZone: 'America/New_York',
            },
        };

        try {
            await dispatch(
                createCalendarEvent({ eventData: eventDetails, calendarId: selectedCalendarId })
            ).unwrap();
            alert('Event successfully created!');
            // Optionally, refresh events after creating a new one
            dispatch(fetchCalendar({ calendarId: selectedCalendarId }));
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event.');
        }
    };

    // Handle loading and error states
    if (status === 'loading') {
        return <div>Loading calendars...</div>;
    }

    if (status === 'failed') {
        return <div>Error: {error}</div>;
    }

    return (
        <div style={{ height: '100vh', padding: '20px' }}>
            <h1>My Calendar</h1>

            <div style={{ marginBottom: '20px' }}>
                <h3>Select a Calendar</h3>
                <select value={selectedCalendarId} onChange={handleCalendarChange}>
                    {calendars &&
                        calendars.map((calendar) => (
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
                events={
                    events
                        ? events.map((event) => ({
                            title: event.summary,
                            start: new Date(event.start.dateTime || event.start.date),
                            end: new Date(event.end.dateTime || event.end.date),
                        }))
                        : []
                }
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
            />
        </div>
    );
};

export default MyCalendar;