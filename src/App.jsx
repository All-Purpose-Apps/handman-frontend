import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './views/Dashboard'
import NoMatch from './views/NoMatch'
import { routes } from './routes'

export default function App() {
  const getRoutes = () => {
    return routes.map((route, index) => {
      return (
        <Route
          key={index}
          path={route.path}
          element={<route.component />}
        />
      )
    })
  }
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="*" element={<NoMatch />} />
          {getRoutes()}
        </Route>
      </Routes>
    </>
  )
}
