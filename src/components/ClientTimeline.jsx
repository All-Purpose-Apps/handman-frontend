import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CustomClientTimeline = ({ client }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const events = [
        {
            key: 'created',
            label: 'Created',
            completed: !!client.createdAt,
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
            completed: client.isPaid || false,
            date: client.isPaidDate ? new Date(client.isPaidDate).toLocaleDateString() : null,
        },
        {
            key: 'followUp',
            label: 'Follow Up',
            completed: client.followUpCompleted || false,
            date: client.followUpDate ? new Date(client.followUpDate).toLocaleDateString() : null,
        },
    ];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                overflowX: 'auto',
                padding: 2,
            }}
        >
            {events.map((event, index) => (
                <Box
                    key={event.key}
                    sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: 'center',
                        minWidth: isSmallMobile ? '100px' : '150px',
                        textAlign: 'center',
                        mb: isMobile ? 2 : 0,
                    }}
                >
                    <Box>
                        {event.completed ? (
                            <CheckCircleIcon color="success" fontSize={isSmallMobile ? 'medium' : 'large'} />
                        ) : (
                            <HourglassEmptyIcon color="disabled" fontSize={isSmallMobile ? 'medium' : 'large'} />
                        )}
                        <Typography variant={isSmallMobile ? 'body1' : 'h6'} sx={{ mt: 1 }}>
                            {event.label}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {event.date || 'N/A'}
                        </Typography>
                        <Typography
                            variant="body2"
                            color={event.completed ? 'textSecondary' : 'error'}
                        >
                            {event.completed ? 'Completed' : 'Pending'}
                        </Typography>
                    </Box>
                    {index < events.length - 1 && (
                        <Divider
                            orientation={isMobile ? 'horizontal' : 'vertical'}
                            flexItem
                            sx={{
                                height: isMobile ? 'auto' : '50px',
                                width: isMobile ? '80%' : 'auto',
                                mx: isMobile ? 0 : 2,
                                my: isMobile ? 2 : 0,
                                backgroundColor: 'grey.400',
                            }}
                        />
                    )}
                </Box>
            ))}
        </Box>
    );
};

export default CustomClientTimeline;