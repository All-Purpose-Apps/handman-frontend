import { Card, CardContent, Typography } from '@mui/material';
import { formatPhoneNumber } from '../utils/formatPhoneNumber';

export default function ClientCard({ client, handleCardClick }) {
    return (
        <Card variant="outlined" onClick={() => handleCardClick(client._id)}
            style={{ cursor: 'pointer' }}
        >
            <CardContent>
                <Typography variant="h5">{client.name}</Typography>
                <Typography color="textSecondary">
                    <strong>Email: </strong>{client.email}
                </Typography>
                <Typography color="textSecondary"><strong>
                    Phone: </strong> {formatPhoneNumber(client.phone)}</Typography>
                <Typography color="textSecondary">
                    <strong>Address: </strong>
                    {client.address}</Typography>
                <Typography color="textSecondary"><strong>
                    Status: </strong>{client.status}</Typography>
            </CardContent>
        </Card>
    )
}
