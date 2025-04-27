import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
} from '@mui/material';

const SettingsPage = () => {
    const { urgentDays, setUrgentDays } = useSettings();

    const handleUrgentDaysChange = (e) => {
        setUrgentDays(Number(e.target.value)); // Ensure the value is stored as a number
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                backgroundColor: '#f5f5f5',
                padding: 3,
            }}
        >
            <Card sx={{ maxWidth: 400, width: '100%' }}>
                <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Settings Page
                    </Typography>
                    <FormControl fullWidth sx={{ marginTop: 2 }} >
                        <InputLabel id="urgent-days-label">Days until urgent</InputLabel>
                        <Select
                            labelId="urgent-days-label"
                            value={urgentDays}
                            onChange={handleUrgentDaysChange}
                            label="Days until urgent"
                        >
                            {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
                                <MenuItem key={day} value={day}>
                                    {day} {day === 1 ? 'day' : 'days'}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="body1" sx={{ marginTop: 2 }}>
                        Currently set to: {urgentDays} {urgentDays === 1 ? 'day' : 'days'}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SettingsPage;