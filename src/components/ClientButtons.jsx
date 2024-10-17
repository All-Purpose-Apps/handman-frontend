import { Button, Typography } from '@mui/material';

export default function ClientButtons({ lastSyncedAt, handleSyncGoogleContacts, handleOpenModal }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary" style={{ marginRight: '20px' }}>
                Last Synced: {lastSyncedAt || 'Never'}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleSyncGoogleContacts} sx={{ m: 2 }}>
                Sync Google Contacts
            </Button>
            <Button variant="contained" color="primary" onClick={handleOpenModal}>
                Add Client
            </Button>
        </div>
    )
}
