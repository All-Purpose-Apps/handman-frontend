import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Box, Typography, Stack } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
    sigCanvas: {
        border: '1px solid #000',
        width: '100%',
        height: 200,
    },
});

const Signature = () => {
    const classes = useStyles();
    const sigCanvas = useRef({});
    const navigate = useNavigate();

    const handleClearSignature = () => {
        sigCanvas.current.clear();
    };

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
                        onClick={() => {
                            const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
                            console.log(dataURL);
                        }}
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