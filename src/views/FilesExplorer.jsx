import { useState, useEffect } from "react";
import { FileManager } from "@cubone/react-file-manager";
import Frame from 'react-frame-component';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress
import Box from '@mui/material/Box'; // Import Box for centering

function App() {
    const [files, setFiles] = useState([
        {
            name: "Documents",
            isDirectory: true,
            path: "/Documents",
            updatedAt: "2024-09-09T10:30:00Z",
        },
        {
            name: "Pictures",
            isDirectory: true,
            path: "/Pictures",
            updatedAt: "2024-09-09T11:00:00Z",
        },
        {
            name: "Pic.png",
            isDirectory: false,
            path: "/Pictures/Pic.png",
            updatedAt: "2024-09-08T16:45:00Z",
            size: 2048,
        },
    ]);

    const [styleLoaded, setStyleLoaded] = useState(false);

    const handleStyleLoad = () => {
        setStyleLoaded(true);
    };

    return (
        <Frame
            style={{ width: '100%', height: '800px', border: 'none' }}
            head={
                <>
                    <link
                        rel="stylesheet"
                        href="https://unpkg.com/@cubone/react-file-manager/dist/style.css"
                        onLoad={handleStyleLoad}
                    />
                </>
            }
        >
            {styleLoaded ? (
                <FileManager files={files} />
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            )}
        </Frame>
    );
}

export default App;
