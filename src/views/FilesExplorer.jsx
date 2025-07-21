import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileManager } from "@cubone/react-file-manager";
import Frame from 'react-frame-component';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress
import Box from '@mui/material/Box'; // Import Box for centering
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
                loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'red' }}>
                        Error: {error}
                    </Box>
                ) : (
                    <FileManager files={files}
                        enableFilePreview={false}
                        permissions={{ create: false, copy: false, upload: false, download: false, move: false, delete: false, rename: false }}
                        onFileOpen={handleFileOpen}
                        layout={'list'}
                    />
                )
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            )}
        </Frame>
    );
}

export default App;
