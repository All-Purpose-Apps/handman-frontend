import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import NoMatch from './views/NoMatch';
import { routes } from './routes';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Login from './views/Auth/Login';
import ProtectedRoute from './views/ProtectedRoute';
import AuthWatcher from './components/AuthWatcher.jsx';
import SignDocument from './views/User/SignDocument.jsx';

export default function App() {
  const getRoutes = () => {
    return routes.map((route, index) => {
      const Component = route.component; // Extract the component
      if (route.protected) {
        // Wrap protected routes with ProtectedRoute
        return (
          <Route
            key={index}
            path={route.path}
            element={
              <ProtectedRoute>
                <Component />
              </ProtectedRoute>
            }
          />
        );
      } else {
        // Public routes
        return (
          <Route
            key={index}
            path={route.path}
            element={<Component />}
          />
        );
      }
    });
  };

  return (
    <AuthProvider>
      <AuthWatcher />
      <Routes>
        <Route path="sign/:token" element={<SignDocument />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<MainLayout />}>
          {getRoutes()}
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}