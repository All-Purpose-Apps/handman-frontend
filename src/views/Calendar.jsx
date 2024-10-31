import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
    Dialog, DialogActions, DialogContent, DialogTitle,
    Button, TextField
} from '@mui/material';

import {
    fetchCalendars,
    fetchCalendar,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent
} from '../store/calendarSlice';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const dispatch = useDispatch();
    const { calendars, events, status, error } = useSelector((state) => state.calendar);

    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [selectedCalendarId, setSelectedCalendarId] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchCalendars());
    }, [dispatch]);

    useEffect(() => {
        if (calendars && calendars.length > 0) {
            setSelectedCalendarId(calendars[0].id);
        }
    }, [calendars]);

    useEffect(() => {
        if (!selectedCalendarId) return;
        dispatch(fetchCalendar({ calendarId: selectedCalendarId }));
    }, [selectedCalendarId, dispatch]);

    const handleCalendarChange = (event) => {
        setSelectedCalendarId(event.target.value);
    };

    const handleCreateEvent = async () => {
        const eventDetails = {
            summary: newEventTitle,
            start: {
                dateTime: new Date(newEventDate).toISOString(),
                timeZone: 'America/New_York',
            },
            end: {
                dateTime: new Date(new Date(newEventDate).getTime() + 60 * 60 * 1000).toISOString(),
                timeZone: 'America/New_York',
            },
        };

        try {
            await dispatch(
                createCalendarEvent({ eventData: eventDetails, calendarId: selectedCalendarId })
            ).unwrap();
            alert('Event successfully created!');
            dispatch(fetchCalendar({ calendarId: selectedCalendarId }));
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event.');
        }
    };

    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleEditEvent = async () => {
        const updatedEvent = {
            ...selectedEvent,
            summary: selectedEvent.title,
        };

        try {
            await dispatch(
                updateCalendarEvent({ eventId: selectedEvent.id, eventData: updatedEvent, calendarId: selectedCalendarId })
            ).unwrap();
            alert('Event successfully updated!');
            setIsModalOpen(false);
            dispatch(fetchCalendar({ calendarId: selectedCalendarId }));
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Failed to update event.');
        }
    };

    const handleDeleteEvent = async () => {
        try {
            await dispatch(deleteCalendarEvent({ eventId: selectedEvent.id, calendarId: selectedCalendarId })).unwrap();
            alert('Event successfully deleted!');
            setIsModalOpen(false);
            dispatch(fetchCalendar({ calendarId: selectedCalendarId }));
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event.');
        }
    };

    return (
        <div style={{ height: '100vh', padding: '20px' }}>
            <h1>My Calendar</h1>

            <div style={{ marginBottom: '20px' }}>
                <h3>Select a Calendar</h3>
                <select value={selectedCalendarId} onChange={handleCalendarChange}>
                    {calendars && calendars.map((calendar) => (
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
                    events ? events.map((event) => ({
                        ...event,
                        title: event.summary,
                        start: new Date(event.start.dateTime || event.start.date),
                        end: new Date(event.end.dateTime || event.end.date),
                    })) : []
                }
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                onSelectEvent={handleEventSelect}
            />

            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Event Title"
                        value={selectedEvent?.title || ''}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                        fullWidth
                    />
                    <TextField
                        label="Event Date"
                        type="datetime-local"
                        value={selectedEvent ? new Date(selectedEvent.start).toISOString().slice(0, -8) : ''}
                        onChange={(e) =>
                            setSelectedEvent({
                                ...selectedEvent,
                                start: new Date(e.target.value).toISOString(),
                                end: new Date(new Date(e.target.value).getTime() + 60 * 60 * 1000).toISOString(),
                            })
                        }
                        fullWidth
                        style={{ marginTop: '10px' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditEvent} color="primary">Save</Button>
                    <Button onClick={handleDeleteEvent} color="secondary">Delete</Button>
                    <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MyCalendar;