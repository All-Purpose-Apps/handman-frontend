import React, { useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Link,
    Paper,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFiles } from '../store/filesSlice'


const FilesExplorer = () => {
    console.log('FilesExplorer rendered');
    const dispatch = useDispatch();
    const { items: files, loading, error } = useSelector((state) => state.files);
    console.log(JSON.stringify(files, null, 2));
    useEffect(() => {
        dispatch(fetchFiles())
    }, [dispatch]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <Typography color="error">Error: {error}</Typography>
            </Box>
        );
    }

    return (
        <Box p={2}>
            <Typography variant="h5" gutterBottom>
                File Explorer
            </Typography>
            <Paper elevation={3}>
                <List>
                    {Object.entries(files).flatMap(([folder, fileList]) =>
                        fileList.map((file, index) => (
                            <ListItem key={`${folder}-${index}`} divider>
                                <ListItemIcon>
                                    {file.isFolder ? <FolderIcon /> : <InsertDriveFileIcon />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        file.isFolder ? (
                                            file.name
                                        ) : (
                                            <Link href={file.url} target="_blank" rel="noopener">
                                                {file.name}
                                            </Link>
                                        )
                                    }
                                    secondary={
                                        file.isFolder
                                            ? 'Folder'
                                            : `Size: ${(file.size / 1024).toFixed(2)} KB | Type: ${file.contentType} | Updated: ${new Date(file.updated).toLocaleString()}`
                                    }
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            </Paper>
        </Box>
    );
};

export default FilesExplorer;