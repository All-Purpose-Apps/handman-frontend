import { gapi } from 'gapi-script';

const CLIENT_ID = '1040736667872-ag7rvp0srjd7b43r1n7bcdhe852cgj24.apps.googleusercontent.com'; // Replace with your actual client ID
const API_KEY = 'AIzaSyDpY9tQDhJAtQQ0TJd6ndco8zwpIN7qvaU'; // Replace with your actual API key
const CONTACTS_SCOPE = 'https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/contacts.readonly';
const CONTACTS_API = 'https://people.googleapis.com/v1/';

// Authenticate Google Contacts API
export const authenticateGoogleContacts = async () => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: ['https://people.googleapis.com/$discovery/rest?version=v1'],
          scope: CONTACTS_SCOPE,
        });
        const authInstance = gapi.auth2.getAuthInstance();
        const isSignedIn = authInstance.isSignedIn.get();

        if (!isSignedIn) {
          // User is not signed in, prompt sign-in with required scopes
          await authInstance.signIn({ scope: CONTACTS_SCOPE });
        } else {
          // User is signed in, check if they have granted the required scopes
          const currentUser = authInstance.currentUser.get();
          const grantedScopes = currentUser.getGrantedScopes();

          if (!CONTACTS_SCOPE.split(' ').every((scope) => grantedScopes.includes(scope))) {
            // Request additional scopes if not all are granted
            await authInstance.signIn({ scope: CONTACTS_SCOPE, prompt: 'consent' });
          }
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Fetch a list of Google Contacts
export const listGoogleContacts = async () => {
  try {
    const response = await gapi.client.request({
      path: `${CONTACTS_API}people/me/connections`,
      params: {
        personFields: 'names,emailAddresses,phoneNumbers,externalIds,metadata,addresses',
        pageSize: 1000, // Adjust as needed
      },
    });

    const contacts = response.result.connections || [];

    // Filter out your own contact
    const filteredContacts = contacts.filter((contact) => !contact.metadata?.sources?.some((source) => source.type === 'PROFILE'));

    const formattedContacts = filteredContacts.map((contact) => {
      const name = contact.names ? contact.names[0].displayName : '';
      const firstName = contact.names ? contact.names[0].givenName : '';
      const lastName = contact.names ? contact.names[0].familyName : '';
      const email = contact.emailAddresses ? contact.emailAddresses[0].value : '';
      const phone = contact.phoneNumbers ? contact.phoneNumbers[0].value : '';
      const address = contact.addresses ? contact.addresses[0].formattedValue : '';
      return { ...contact, name, email, phone, address, firstName, lastName };
    });

    return formattedContacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

// Sync Google Contacts (list all contacts and possibly compare to local contacts)
export const syncGoogleContacts = async () => {
  const contacts = await listGoogleContacts();
  // You can add logic here to compare with local contacts if needed
  return contacts;
};

// Create a new contact in Google Contacts
export const createGoogleContact = async (contactDetails) => {
  const { givenName, familyName, email } = contactDetails;

  const newContact = {
    names: [
      {
        givenName,
        familyName,
      },
    ],
    emailAddresses: [
      {
        value: email,
      },
    ],
  };

  try {
    const response = await gapi.client.request({
      path: `${CONTACTS_API}people:createContact`,
      method: 'POST',
      body: newContact,
    });
    return response.result;
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
};

export const getContact = async (searchValue) => {
  try {
    const contacts = await listGoogleContacts();

    const matchedContact = contacts.find((contact) => {
      const resourceName = contact.resourceName;
      return resourceName == searchValue;
    });

    if (matchedContact) {
      return matchedContact;
    } else {
      console.warn('No contact found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching contact by resourcename', error);
    throw error;
  }
};
