import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import NoMatch from './views/NoMatch';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SettingsProvider } from './contexts/SettingsContext.jsx';
import AuthWatcher from './components/AuthWatcher.jsx';
import Login from './views/Auth/Login';
import Dashboard from './views/Dashboard.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';
import { getAuth } from 'firebase/auth';
import { routes } from './routes';
import ProtectedRoute from './views/ProtectedRoute.jsx';
import SignDocument from './views/User/SignDocument.jsx';
import Signature from './components/Signature.jsx';

const getRoutes = () => {
  return routes.map((route, index) => {
    const Component = route.component; // Extract the component
    if (route.protected) {
      // Wrap protected routes with ProtectedRoute
      return {
        path: route.path,
        element: <ProtectedRoute><Component /></ProtectedRoute>,
      };
    }
  });
};

const router = createBrowserRouter([
  {
    element: <SettingsProvider>
      <AuthProvider>
        <AuthWatcher />
        <MainLayout />
      </AuthProvider>
    </SettingsProvider>,
    children: [
      ...getRoutes(),
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: 'sign/:token',
    element: <SignDocument />,
  },
  {
    path: '/signature/:document/:id',
    element: <Signature />,
  },
]);

export default router;

// import { useEffect, useState } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import MainLayout from './layouts/MainLayout';
// import NoMatch from './views/NoMatch';
// import { routes } from './routes';
// import { AuthProvider } from './contexts/AuthContext.jsx';
// import Login from './views/Auth/Login';
// import ProtectedRoute from './views/ProtectedRoute';
// import AuthWatcher from './components/AuthWatcher.jsx';
// import SignDocument from './views/User/SignDocument.jsx';
// import { SettingsProvider } from './contexts/SettingsContext.jsx';
// import Signature from './components/Signature.jsx';
// import { SocketProvider } from './contexts/SocketContext.jsx';
// import { getAuth, signOut } from 'firebase/auth';
// import { CircularProgress, Box } from '@mui/material';


// export default function App() {

//   const auth = getAuth();
//   const user = auth.currentUser;

// const getRoutes = () => {
//   return routes.map((route, index) => {
//     const Component = route.component; // Extract the component
//     if (route.protected) {
//       // Wrap protected routes with ProtectedRoute
//       return (
//         <Route
//           key={index}
//           path={route.path}
//           element={
//             <ProtectedRoute>
//               <Component />
//             </ProtectedRoute>
//           }
//         />
//       );
//     } else {
//       // Public routes
//       return (
//         <Route
//           key={index}
//           path={route.path}
//           element={<Component />}
//         />
//       );
//     }
//   });
// };

//   const [authLoaded, setAuthLoaded] = useState(false);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(() => {
//       setAuthLoaded(true);
//     });
//     return unsubscribe;
//   }, []);

//   if (!authLoaded) {
//     return (
//       <Box
//         sx={{
//           height: '100vh',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           bgcolor: '#f4f6f8',
//         }}
//       >
//         <CircularProgress size={64} thickness={4} />
//       </Box>
//     );
//   }

//   return (
//     <SettingsProvider>
//       <AuthProvider>
//         <AuthWatcher />
//         <Routes>
//           <Route path="sign/:token" element={<SignDocument />} />
//           <Route path="/signature/:document/:id" element={<Signature />} />
//           <Route path="/login" element={<Login />} />
//           <Route
//             path="/"
//             element={
//               user?.email ? (
//                 <SocketProvider tenantId={user.email.split('@')[0]}>
//                   <MainLayout />
//                 </SocketProvider>
//               ) : (
//                 <MainLayout />
//               )
//             }
//           >
//             <Route index element={<Navigate to="/dashboard" replace />} />
//             {getRoutes()}
//             <Route path="*" element={<NoMatch />} />
//           </Route>
//         </Routes>
//       </AuthProvider>
//     </SettingsProvider>
//   );
// }