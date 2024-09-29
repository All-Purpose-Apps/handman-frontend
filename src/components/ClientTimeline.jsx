import React from 'react';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import { Typography } from '@mui/material';

const ClientTimeline = ({ client }) => {
    // Determine the status of each event based on client data
    const events = [
        {
            key: 'inquiry',
            label: 'Inquiry',
            completed: !!client.createdAt, // If client has a creation date, inquiry is completed
            date: client.createdAt ? new Date(client.createdAt).toLocaleDateString() : null,
        },
        {
            key: 'proposal',
            label: 'Proposal',
            completed: client.proposals && client.proposals.length > 0,
            date: client.proposals && client.proposals.length > 0 ? 'Sent' : null,
        },
        {
            key: 'appointments',
            label: 'Appointments',
            completed: client.appointments && client.appointments.length > 0,
            date: client.appointments && client.appointments.length > 0
                ? client.appointments.map((appt) => new Date(appt).toLocaleDateString()).join(', ')
                : null,
        },
        {
            key: 'invoices',
            label: 'Invoices',
            completed: client.invoices && client.invoices.length > 0,
            date: client.invoices && client.invoices.length > 0 ? 'Issued' : null,
        },
        {
            key: 'paid',
            label: 'Paid',
            completed: client.isPaid || false, // Assuming there's an 'isPaid' flag in client data
            date: client.isPaidDate ? new Date(client.isPaidDate).toLocaleDateString() : null,
        },
        {
            key: 'followUp',
            label: 'Follow Up',
            completed: client.followUpCompleted || false, // Assuming there's a 'followUpCompleted' flag
            date: client.followUpDate ? new Date(client.followUpDate).toLocaleDateString() : null,
        },
    ];

    return (
        <Timeline position="alternate">
            {events.map((event, index) => (
                <TimelineItem key={event.key}>
                    <TimelineOppositeContent color="textSecondary">
                        {event.date}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot color={event.completed ? 'primary' : 'grey'} />
                        {index < events.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                        <Typography variant="h6">{event.label}</Typography>
                        <Typography color="textSecondary">
                            {event.completed ? 'Completed' : 'Pending'}
                        </Typography>
                    </TimelineContent>
                </TimelineItem>
            ))}
        </Timeline>
    );
};

export default ClientTimeline;