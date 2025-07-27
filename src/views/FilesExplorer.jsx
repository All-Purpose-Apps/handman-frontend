import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileManager } from "@cubone/react-file-manager";
import Frame from 'react-frame-component';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { fetchFiles } from "../store/filesSlice";

function App() {
    const dispatch = useDispatch();
    const { items: files, loading, error } = useSelector((state) => state.files);
    const [styleLoaded, setStyleLoaded] = useState(false);

    useEffect(() => {
        dispatch(fetchFiles());
    }, [dispatch]);

    const handleStyleLoad = () => {
        setStyleLoaded(true);
    };

    const handleFileOpen = (file) => {
        if (!file.isDirectory) {
            window.open(file.url, '_blank');
        }
    };

    return (
        // 1. Use a container to hold both the loader and the frame
        <Box sx={{ width: '100%', height: '800px' }}>

            {/* 2. Show this loader while the stylesheet inside the Frame is loading */}
            {!styleLoaded && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

            {/* 3. The Frame component loads in the background */}
            <Frame
                // 4. Use style to hide the frame until the stylesheet is loaded
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: styleLoaded ? 'block' : 'none' // Key change!
                }}
                head={
                    <>
                        <link
                            rel="stylesheet"
                            href="https://unpkg.com/@cubone/react-file-manager/dist/style.css"
                            // This will trigger the state change and make the Frame visible
                            onLoad={handleStyleLoad}
                        />
                    </>
                }
            >
                {/* This internal logic is for data loading and remains the same. */}
                {/* It will run once the frame is visible. */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'red' }}>
                        Error: {error}
                    </Box>
                ) : (
                    <FileManager
                        files={files}
                        enableFilePreview={false}
                        permissions={{ create: false, copy: false, upload: false, download: false, move: false, delete: false, rename: false }}
                        onFileOpen={handleFileOpen}
                        layout={'list'}
                    />
                )}
            </Frame>
        </Box>
    );
}

export default App;