import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Box, Typography, Stack } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';

const useStyles = makeStyles({
    sigCanvas: {
        border: '1px solid #000',
        width: '100%',
        height: 200,
    },
});

const Signature = () => {

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState(null);
    const classes = useStyles();
    const sigCanvas = useRef({});
    const navigate = useNavigate();
    const { document, id } = useParams();

    const handleClearSignature = () => {
        sigCanvas.current.clear();
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        const signatureData = sigCanvas.current.toDataURL('image/png');
        try {
            if (document === 'proposal') {
                const response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/proposals/internal-upload-pdf-with-signature/${id}`,
                    {
                        signature: signatureData,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                        withCredentials: true,
                    }
                );
                navigate(-1); // Navigate back after successful upload
            } else if (document === 'invoice') {
                const response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/invoices/internal-upload-pdf-with-signature/${id}`,
                    {
                        signature: signatureData,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                        withCredentials: true,
                    }
                );

                navigate(-1);
            } else {
                console.warn('Unsupported document type:', document);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setError('Failed to upload signature. Please try again.');
        } finally {
            setIsSubmitting(false);
        }

    }

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
            <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                minWidth={4}
                maxWidth={4}
                canvasProps={{ className: classes.sigCanvas }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Box>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleClearSignature}
                        sx={{ mr: 1 }}
                    >
                        Clear Signature
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Save Signature
                    </Button>
                </Box>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => { navigate(-1); }}
                >
                    Cancel
                </Button>
            </Box>
        </Box>
    );
};

export default Signature;