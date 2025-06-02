import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Link,
    Paper,
    TextField,
    InputAdornment,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SearchIcon from '@mui/icons-material/Search';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFiles } from '../store/filesSlice'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

const FilesExplorer = () => {
    const dispatch = useDispatch();
    const { items: files, loading, error } = useSelector((state) => state.files);
    const [searchTerm, setSearchTerm] = useState('');

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
            <Paper elevation={3} sx={{ p: 2 }}>
                <TextField
                    label="Search files"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2 }}
                />
                <SimpleTreeView sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {Object.keys(files).map((folderKey, folderIndex) => {
                        return (
                            < TreeItem key={folderKey} itemId={`folder-${folderIndex}`} label={folderKey}>
                                {files[folderKey]
                                    .filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map((file, fileIndex) => (
                                        <TreeItem
                                            key={`${folderKey}-${fileIndex}`}
                                            itemId={`${folderKey}-${fileIndex}`}
                                            label={
                                                <Link href={file.url} target="_blank" rel="noopener" underline="hover">
                                                    {file.name.split('/').pop()}
                                                </Link>
                                            }
                                        />
                                    ))}
                            </TreeItem>
                        );
                    })}
                </SimpleTreeView>
            </Paper>
        </Box >
    );
};

export default FilesExplorer;