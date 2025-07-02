//React Router
import { createBrowserRouter } from 'react-router';
//MainLayout and Contexts
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SettingsProvider } from './contexts/SettingsContext.jsx';
//routes
import { routes } from './routes';
//components
import Login from './views/Auth/Login';
import SignDocument from './views/User/SignDocument.jsx';
import Signature from './components/Signature.jsx';
import NoMatch from './views/NoMatch.jsx';

const getRoutes = () => {
  return routes.map((route, index) => {
    const Component = route.component;
    return {
      path: route.path,
      element: <Component />,
    };
  });
};

const router = createBrowserRouter([
  {
    element: <SettingsProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </SettingsProvider>,
    children: [
      ...getRoutes(),
    ],
    errorElement: <NoMatch />,
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <NoMatch />,
  },
  {
    path: 'sign/:token',
    element: <SignDocument />,
    errorElement: <NoMatch />,
  },
  {
    path: '/signature/:document/:id',
    element: <Signature />,
    errorElement: <NoMatch />,
  },
  {
    path: '*',
    element: <NoMatch />,
  },
]);

export default router;