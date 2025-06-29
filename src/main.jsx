import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from './store'
import "./assets/css/main.css"
import router from './router.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId="1040736667872-ag7rvp0srjd7b43r1n7bcdhe852cgj24.apps.googleusercontent.com">
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
)
