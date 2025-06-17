import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ tenantId, children }) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!tenantId) return;

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            console.error('No access token found');
            return;
        }
        socketRef.current = io(`${import.meta.env.VITE_BACKEND_URL}`, {
            withCredentials: true,
            extraHeaders: {
                Authorization: `Bearer ${accessToken}`,
                'tenant-id': tenantId,
            },
        });

        socketRef.current.on('connect', () => {
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [tenantId]);

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};