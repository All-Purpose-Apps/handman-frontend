import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Initialize sign-in progress from localStorage
let signInInProgress = JSON.parse(localStorage.getItem('signInInProgress')) || false;

export const handleGoogleSignIn = async (auth) => {
  console.log('Starting Google sign-in...');
  const lastSignInTimestamp = parseInt(localStorage.getItem('lastSignInTimestamp'), 10);
  const now = Date.now();
  const timeout = 2 * 60 * 1000; // 2 minutes

  if (signInInProgress && (!lastSignInTimestamp || now - lastSignInTimestamp > timeout)) {
    console.warn('Sign-in flag reset due to timeout.');
    signInInProgress = false;
    localStorage.setItem('signInInProgress', 'false');
  }

  if (signInInProgress) {
    console.log('Sign-in already in progress, exiting.');
    return; // Prevent multiple popups
  }
  signInInProgress = true;
  console.log('Sign-in flag set, opening popup...');
  localStorage.setItem('signInInProgress', JSON.stringify(signInInProgress));
  localStorage.setItem('lastSignInTimestamp', Date.now().toString());

  const provider = new GoogleAuthProvider();

  // Request additional scopes
  provider.addScope('https://www.googleapis.com/auth/contacts');
  provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
  provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
  provider.addScope('https://www.googleapis.com/auth/gmail.send');
  provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
  provider.addScope('https://www.googleapis.com/auth/gmail.modify');
  provider.addScope('https://www.googleapis.com/auth/cloud-platform');
  provider.addScope('https://www.googleapis.com/auth/devstorage.read_only');

  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Popup sign-in result:', result);

    // Get the OAuth credential
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (credential) {
      // This gives you a Google Access Token.
      const accessToken = credential.accessToken;
      localStorage.setItem('accessToken', accessToken);
      console.log('Access token received and stored.');
    } else {
      console.error('No credential returned from Google sign-in.');
      console.log('No OAuth credential returned.');
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
    console.log('Sign-in error details:', error);
  } finally {
    signInInProgress = false; // Reset the flag
    localStorage.setItem('signInInProgress', JSON.stringify(signInInProgress));
    localStorage.removeItem('lastSignInTimestamp');
    console.log('Sign-in process complete, flag reset.');
  }
};
