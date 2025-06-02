import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
    Dialog, DialogActions, DialogContent, DialogTitle,
    Button, TextField, Paper, Grid, Typography, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

import {
    fetchCalendars,
    fetchCalendar,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent
} from '../store/calendarSlice';

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

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Select a Calendar</Typography>
                <FormControl fullWidth>
                    <InputLabel id="calendar-select-label">Calendar</InputLabel>
                    <Select
                        labelId="calendar-select-label"
                        value={selectedCalendarId}
                        label="Calendar"
                        onChange={handleCalendarChange}
                    >
                        {calendars && calendars.map((calendar) => (
                            <MenuItem key={calendar.id} value={calendar.id}>
                                {calendar.summary}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Paper>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Create a New Event</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={5}>
                        <TextField
                            fullWidth
                            label="Event Title"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <TextField
                            fullWidth
                            type="datetime-local"
                            label="Date & Time"
                            InputLabelProps={{ shrink: true }}
                            value={newEventDate}
                            onChange={(e) => setNewEventDate(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button variant="contained" color="primary" fullWidth sx={{ height: '100%' }} onClick={handleCreateEvent}>
                            Create
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    start: 'prev,next today',
                    center: 'title',
                    end: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                editable
                selectable
                events={
                    events ? events.map((event) => ({
                        id: event.id,
                        title: event.summary,
                        start: event.start.dateTime || event.start.date,
                        end: event.end?.dateTime || event.end?.date,
                    })) : []
                }
                eventClick={(info) => {
                    setSelectedEvent({
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start.toISOString(),
                        end: info.event.end?.toISOString(),
                    });
                    setIsModalOpen(true);
                }}
                dateClick={(info) => {
                    setNewEventDate(info.dateStr);
                }}
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
                        value={selectedEvent ? selectedEvent.start.slice(0, 16) : ''}
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