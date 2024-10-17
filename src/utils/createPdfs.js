import { PDFDocument, rgb } from 'pdf-lib';
import download from 'downloadjs';
import { formatPhoneNumber } from './formatPhoneNumber';
import moment from 'moment';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function createProposal(invoice) {
  const fileRef = ref(storage, 'gs://handmanpro-c29ca.appspot.com/ProposalTemplate.pdf');
  const downloadURL = await getDownloadURL(fileRef);
  const { invoiceNumber, invoiceDate } = invoice;
  const { firstName, lastName, phone, email, address } = invoice.client;
  const formBytes = await fetch(downloadURL).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(formBytes);

  const form = pdfDoc.getForm();
  const invoiceNumberField = form.getTextField('Invoice Number');
  const proposalNameField = form.getTextField('Proposal Name');
  const proposalAddressField = form.getTextField('Proposal Address');
  const proposalTelephoneField = form.getTextField('Proposal Telephone');
  const proposalEmailField = form.getTextField('Proposal Email');
  const workAtNameField = form.getTextField('Work At Name');
  const workAtAddressField = form.getTextField('Work At Address');
  const workAtTelephoneField = form.getTextField('Work At Telephone');
  const workAtEmailField = form.getTextField('Work At Email');
  const dateField = form.getTextField('Date');
  const descriptionOfWorkField = form.getTextField('Description of Work');
  const regularPriceField = form.getTextField('Regular Price');
  const discountPriceField = form.getTextField('Discount Price');
  const packagePriceField = form.getTextField('Package Price');
  const customerPrintNameField = form.getTextField('Customer Print Name');
  const dateAcceptedField = form.getTextField('Date Accepted');

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  firstPage.drawText(invoiceNumber, {
    x: 513,
    y: 692,
    size: 18,
    color: rgb(0.75, 0, 0.0039),
  });

  const itemDescriptions = () => {
    const jsonArray = JSON.stringify(invoice.items);
    const data = JSON.parse(jsonArray);
    const descriptions = data.map((item) => item.description);
    const result = descriptions.join('\n');
    return result;
  };

  firstPage.drawText(itemDescriptions(), {
    x: 40,
    y: 500,
    size: 12,
    color: rgb(0, 0, 0),
  });

  proposalNameField.setText(firstName + ' ' + lastName);
  proposalAddressField.setText(address);
  proposalTelephoneField.setText(formatPhoneNumber(phone));
  proposalEmailField.setText(email);
  workAtNameField.setText(firstName + ' ' + lastName);
  workAtAddressField.setText(address);
  workAtTelephoneField.setText(formatPhoneNumber(phone));
  workAtEmailField.setText(email);
  dateField.setText(new Date(invoiceDate).toLocaleDateString());

  form.flatten();

  const pdfBytes = await pdfDoc.save();
  download(pdfBytes, 'Testing', 'application/pdf');
}
