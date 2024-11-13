import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Initialize sign-in progress from localStorage
let signInInProgress = JSON.parse(localStorage.getItem('signInInProgress')) || false;

export const handleGoogleSignIn = async (auth) => {
  if (signInInProgress) return; // Prevent multiple popups
  signInInProgress = true;
  localStorage.setItem('signInInProgress', JSON.stringify(signInInProgress));
  console.log(signInInProgress);

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

    // Get the OAuth credential
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (credential) {
      // This gives you a Google Access Token.
      const accessToken = credential.accessToken;
      localStorage.setItem('accessToken', accessToken);
    } else {
      console.error('No credential returned from Google sign-in.');
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
  } finally {
    signInInProgress = false; // Reset the flag
    localStorage.setItem('signInInProgress', JSON.stringify(signInInProgress));
    console.log(signInInProgress);
  }
};

// Listen for the window close or refresh event to reset signInInProgress in localStorage
window.addEventListener('beforeunload', () => {
  localStorage.setItem('signInInProgress', JSON.stringify(false));
});
