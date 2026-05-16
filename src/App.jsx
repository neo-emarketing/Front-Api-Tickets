import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Scanner from './pages/Scanner'
import PrivateRoute from './components/PrivateRoute'
import Reportes from './pages/Reportes'
import StaffManagement from './pages/StaffManagement'; 


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
  path="/reportes"
  element={
    <PrivateRoute allowedRoles={['admin', 'supervisor']}>
      <Reportes />
    </PrivateRoute>
  }
/>
        <Route
          path="/reportes"
          element={
            <PrivateRoute>
              <Reportes />
            </PrivateRoute>
          }
        />
        <Route
          path="/scanner"
          element={
            <PrivateRoute>
              <Scanner />
            </PrivateRoute>
          }
        />
        

<Route
  path="/staff"
  element={
    <PrivateRoute allowedRoles={['admin']}>
      <StaffManagement />
    </PrivateRoute>
  }
/>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App