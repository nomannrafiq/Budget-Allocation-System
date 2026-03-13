import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from './context/AppContext'
import './App.css'

import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const { isLoggedIn, loading, user } = useContext(AppContext)

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
      
      <Route 
        path="/admindashboard" 
        element={isLoggedIn && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
      />
      
      <Route 
        path="/" 
        element={isLoggedIn ? (
          user?.role === 'admin' ? 
            <Navigate to="/admindashboard" /> : 
            <div className="welcome"><h1>Member Dashboard Coming Soon</h1></div>
        ) : (
          <Navigate to="/login" />
        )} 
      />
    </Routes>
  )
}

export default App