import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NoMatch() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/dashboard');
    }, [navigate]);

    return (
        <div>Redirecting...</div>
    );
}
