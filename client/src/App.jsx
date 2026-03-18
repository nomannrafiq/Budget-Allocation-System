import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from './context/AppContext'
import './App.css'

import Signup from './components/Signup'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import MemberDashboard from './components/MemberDashboard'

function App() {
  const { isLoggedIn, loading, user } = useContext(AppContext)

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!isLoggedIn ? <Signup /> : <Navigate to="/" />} />

      
      <Route 
        path="/admindashboard" 
        element={isLoggedIn && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
      />

      <Route 
        path="/memberdashboard" 
        element={isLoggedIn && user?.role === 'member' ? <MemberDashboard /> : <Navigate to="/login" />} 
      />
      
      <Route 
        path="/" 
        element={isLoggedIn ? (
          user?.role === 'admin' ? 
            <Navigate to="/admindashboard" /> : 
            <Navigate to="/memberdashboard" />
        ) : (
          <Navigate to="/login" />
        )} 
      />
    </Routes>
  )
}

export default App