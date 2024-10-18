import { PDFDocument } from 'pdf-lib';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { getAuth } from 'firebase/auth'; // Use Firebase Auth for authenticated user
import { google } from 'googleapis';

// Create a proposal, modify the PDF, and upload it to Firebase Storage
export async function createProposal(invoice) {
  const fileRef = ref(storage, 'gs://handmanpro-c29ca.appspot.com/ProposalTemplate.pdf');
  const downloadURL = await getDownloadURL(fileRef);
  const { invoiceNumber, invoiceDate, client } = invoice;
  const { firstName, lastName, phone, email, address } = client;

  // Fetch the proposal template
  const formBytes = await fetch(downloadURL).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(formBytes);
  const form = pdfDoc.getForm();

  // Fill the form with client and invoice data
  const proposalNameField = form.getTextField('Proposal Name');
  const proposalAddressField = form.getTextField('Proposal Address');
  const proposalTelephoneField = form.getTextField('Proposal Telephone');
  const proposalEmailField = form.getTextField('Proposal Email');
  const dateField = form.getTextField('Date');

  proposalNameField.setText(`${firstName} ${lastName}`);
  proposalAddressField.setText(address);
  proposalTelephoneField.setText(phone);
  proposalEmailField.setText(email);
  dateField.setText(new Date(invoiceDate).toLocaleDateString());

  form.flatten(); // Flatten the form to prevent further editing

  // Save the modified PDF
  const pdfBytes = await pdfDoc.save();

  // Upload the PDF to Firebase Storage
  const storagePath = `proposals/proposal_${invoiceNumber}.pdf`;
  const pdfRef = ref(storage, storagePath);
  await uploadBytes(pdfRef, pdfBytes);

  // Get the download URL for the uploaded PDF
  const uploadedPDFURL = await getDownloadURL(pdfRef);
  return uploadedPDFURL;
}

// Get Gmail API client using Firebase Auth
async function getGoogleAuth() {
  const auth = getAuth(); // Get the current authenticated Firebase user
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not authenticated.');
  }

  // Get the Firebase ID token
  const idToken = await user.getIdToken(true);

  // Initialize the OAuth2 client for Gmail API
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({
    id_token: idToken,
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/gmail.send', // Gmail API scope
  });

  return oAuth2Client;
}

// Function to send an email with the PDF URL attached
async function sendEmailWithFirebaseAuth(to, subject, message, pdfURL) {
  const auth = await getGoogleAuth(); // Get the authenticated OAuth2 client
  const gmail = google.gmail({ version: 'v1', auth });

  const emailBody = `
    To: ${to}
    Subject: ${subject}

    ${message}

    Here is your attached proposal:
    ${pdfURL}
  `;

  const rawMessage = Buffer.from(emailBody).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  // Send the email using Gmail API
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: rawMessage,
    },
  });
}

// Main function to handle creating the proposal and sending the email
export async function handleProposalAndEmail(invoice) {
  try {
    // Step 1: Create the proposal and upload the PDF to Firebase Storage
    const pdfURL = await createProposal(invoice);

    // Step 2: Send the email with the PDF URL attached
    await sendEmailWithFirebaseAuth(invoice.client.email, 'Your Proposal is Ready', 'Please find your proposal attached as per your request.', pdfURL);

    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error occurred while processing the proposal or sending the email:', error);
  }
}
