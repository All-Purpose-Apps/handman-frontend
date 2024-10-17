import { Card, CardContent, Typography } from '@mui/material';
import { formatPhoneNumber } from '../utils/formatPhoneNumber';

export default function ClientCard({ client, handleCardClick }) {
    return (
        <Card
            variant="outlined"
            onClick={() => handleCardClick(client._id)}
            style={{
                cursor: 'pointer',
                width: '100%',  // Ensures that all cards have the same width inside the Grid
                maxWidth: 350,  // You can adjust this value to change the card's maximum width
                margin: 'auto', // Centers the card within its grid item
            }}
        >
            <CardContent>
                <Typography variant="h5">
                    {client.firstName + ' ' + client.lastName}
                </Typography>
                <Typography color="textSecondary">
                    <strong>Email: </strong>{client.email}
                </Typography>
                <Typography color="textSecondary">
                    <strong>Phone: </strong> {formatPhoneNumber(client.phone)}
                </Typography>
                <Typography color="textSecondary">
                    <strong>Address: </strong>
                    {client.address}
                </Typography>
                <Typography color="textSecondary">
                    <strong>Status: </strong>{client.status}
                </Typography>
            </CardContent>
        </Card>
    );
}