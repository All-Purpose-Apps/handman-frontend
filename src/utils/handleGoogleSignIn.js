import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Initialize sign-in progress from localStorage
let signInInProgress = JSON.parse(localStorage.getItem('signInInProgress')) || false;
let signInWindowOpen = false; // in-memory flag to prevent multiple popups

export const handleGoogleSignIn = async (auth) => {
  console.log('Starting Google sign-in...');
  const lastSignInTimestamp = parseInt(localStorage.getItem('lastSignInTimestamp'), 10);
  const now = Date.now();
  const timeout = 2 * 1000; // 2 seconds

  if (signInWindowOpen) {
    console.log('Popup already open, exiting.');
    return;
  }

  if (signInInProgress && (!lastSignInTimestamp || now - lastSignInTimestamp > timeout)) {
    console.warn('Sign-in flag reset due to timeout.');
    signInInProgress = false;
    localStorage.setItem('signInInProgress', 'false');
  }

  if (signInInProgress) {
    console.log('Sign-in already in progress, exiting.');
    return;
  }

  signInInProgress = true;
  signInWindowOpen = true;
  localStorage.setItem('signInInProgress', JSON.stringify(true));
  localStorage.setItem('lastSignInTimestamp', Date.now().toString());

  const provider = new GoogleAuthProvider();
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
    console.log('Popup sign-in result = true');

    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (credential) {
      const accessToken = credential.accessToken;
      localStorage.setItem('accessToken', accessToken);
      console.log('Access token received and stored.');
    } else {
      console.error('No credential returned from Google sign-in.');
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
  } finally {
    signInInProgress = false;
    signInWindowOpen = false;
    localStorage.setItem('signInInProgress', JSON.stringify(false));
    localStorage.removeItem('lastSignInTimestamp');
    console.log('Sign-in process complete, flag reset.');
  }
};
