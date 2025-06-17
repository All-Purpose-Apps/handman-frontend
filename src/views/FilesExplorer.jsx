import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Link,
    Paper,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFiles, deleteFile, renameFile } from '../store/filesSlice'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

const FilesExplorer = () => {
    const dispatch = useDispatch();
    const { items, loading, error } = useSelector((state) => state.files);
    const { organized: files, folders } = items || {};
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [renamingFile, setRenamingFile] = useState(null);
    const [newFileName, setNewFileName] = useState('');
    const renameInputRef = useRef(null);

    useEffect(() => {
        if (renamingFile && renameInputRef.current) {
            renameInputRef.current.focus();
        }
    }, [renamingFile]);

    useEffect(() => {
        dispatch(fetchFiles());
        setNewFileName(selectedFile ? selectedFile.name : '');
    }, [dispatch, selectedFile]);


    const handleDeleteFile = async () => {
        if (!selectedFile) {
            console.warn("No file selected for deletion.");
            return;
        }

        const result = await dispatch(deleteFile(selectedFile.name));
        if (result.error) {
            console.error("Failed to delete file:", result.error.message);
            return;
        }
        if (result.payload) {
            console.log("File deleted successfully:", result.payload);
        } else {
            console.warn("File deletion did not return a payload.");
        }
        await dispatch(fetchFiles()); // Refresh the file list after deletion
        setDeleteDialogOpen(false);
    };



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
                    {files && Object.keys(files).map((folderKey, folderIndex) => {
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
                                                renamingFile?.name === file.name ? (
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <TextField
                                                            inputRef={renameInputRef}
                                                            size="small"
                                                            value={newFileName}
                                                            onChange={(e) => setNewFileName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    dispatch(renameFile({ oldName: renamingFile.name, newName: newFileName }));
                                                                    setRenamingFile(null);
                                                                    setNewFileName('');
                                                                }
                                                                if (e.key === 'Escape') {
                                                                    setRenamingFile(null);
                                                                    setNewFileName('');
                                                                }
                                                            }}
                                                            variant="outlined"
                                                            fullWidth
                                                        />
                                                        <Tooltip title="Save">
                                                            <IconButton size="small" onClick={() => {
                                                                // Dispatch renameFile action
                                                                dispatch(renameFile({ oldName: renamingFile.name, newName: newFileName }));
                                                                setRenamingFile(null);
                                                                setNewFileName('');
                                                            }}>
                                                                <SaveIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Cancel">
                                                            <IconButton size="small" onClick={() => {
                                                                setRenamingFile(null);
                                                                setNewFileName('');
                                                            }}>
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                ) : (
                                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                                        <Link href={file.url} target="_blank" rel="noopener" underline="hover">
                                                            {file.name.split('/').pop()}
                                                        </Link>
                                                        <Box ml={1} display="flex" gap={1}>
                                                            <Tooltip title="Open File">
                                                                <Box component="span" sx={{ cursor: 'pointer', '&:hover': { color: 'info.main' }, '&:active': { color: 'info.dark' } }}>
                                                                    <Link href={file.url} target="_blank" rel="noopener" aria-label="Open file">
                                                                        <OpenInNewIcon fontSize="small" />
                                                                    </Link>
                                                                </Box>
                                                            </Tooltip>
                                                            {/* <Tooltip title="Rename File">
                                                                <Box
                                                                    component="span"
                                                                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' }, '&:active': { color: 'primary.dark' } }}
                                                                    onClick={() => {
                                                                        setRenamingFile(file);
                                                                        setNewFileName(file.name.split('/').pop());
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </Box>
                                                            </Tooltip> */}
                                                            <Tooltip title="Delete File">
                                                                <Box
                                                                    component="span"
                                                                    sx={{ cursor: 'pointer', '&:hover': { color: 'error.main' }, '&:active': { color: 'error.dark' } }}
                                                                    onClick={() => {
                                                                        document.activeElement?.blur();
                                                                        setSelectedFile(file);
                                                                        setDeleteDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </Box>
                                                            </Tooltip>
                                                        </Box>
                                                    </Box>
                                                )
                                            }
                                        />
                                    ))}
                            </TreeItem>
                        );
                    })}
                </SimpleTreeView>
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Are you sure you want to delete this file?</DialogTitle>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleDeleteFile}
                            color="error"
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Box >
    );
};

export default FilesExplorer;