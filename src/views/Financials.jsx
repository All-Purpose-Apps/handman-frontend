import axios from 'axios';
import { useEffect } from 'react';
export default function Financials() {

    const fetchContacts = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            console.error('No access token found.');
            return;
        }

        try {
            const response = await axios.get(
                'http://localhost:3000/api/google/contacts',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        withCredentials: true,
                    },
                }
            );
            console.log('Contacts:', response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    useEffect(() => {
        fetchContacts();
    }
        , []);

    return (
        <div>Financials</div>
    );
}