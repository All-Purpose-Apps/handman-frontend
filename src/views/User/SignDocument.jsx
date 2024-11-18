import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Import required styles
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { Button, Box, Typography, CircularProgress } from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import { makeStyles } from '@mui/styles';


// Configure the correct worker source for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const useStyles = makeStyles({
    sigCanvas: {
        border: '1px solid #000',
        width: '100%',
        height: 200,
    },
});


const SignDocument = () => {

    const classes = useStyles();
    const sigCanvas = useRef({});

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Sign Document
            </Typography>
            <Box sx={{ border: '1px solid #ccc', marginBottom: 2, justifyItems: 'center' }}>
                <Document
                    file="http://localhost:3000/api/invoices/download-pdf/url?https://storage.googleapis.com/invoicesproposals/invoices/invoice_1001.pdf?t=1731537880822"
                    error={<div>Failed to load PDF</div>}
                    loading={<div>Loading PDF...</div>}
                >
                    <Page pageNumber={1} renderTextLayer={false} />
                </Document>
            </Box>
            <Box sx={{ marginBottom: 2 }}>
                <Typography variant="h6">Provide Signature</Typography>
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ className: classes.sigCanvas }}
                />
            </Box>
            <Button variant="contained" color="primary">
                Submit
            </Button>
        </Box>
    );
};

export default SignDocument;