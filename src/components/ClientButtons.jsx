import { Button, Typography, useTheme, useMediaQuery } from '@mui/material';

export default function ClientButtons({ lastSyncedAt, handleSyncGoogleContacts, handleOpenModal }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                width: '100%',
                justifyContent: isMobile ? 'center' : 'end',
            }}
        >
            <Button
                variant="contained"
                color="primary"
                onClick={handleSyncGoogleContacts}
                sx={{ m: isMobile ? 1 : 2 }}
            >
                Sync Google Contacts
            </Button>
            {isMobile && (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 1 }}>
                    Last Synced: {lastSyncedAt || 'Never'}
                </Typography>
            )}
            <Button variant="contained" color="primary" onClick={handleOpenModal}>
                Add Client
            </Button>
            {!isMobile && (
                <Typography variant="body2" color="textSecondary" style={{ marginLeft: '20px' }}>
                    Last Synced: {lastSyncedAt || 'Never'}
                </Typography>
            )}
        </div>
    )
}
