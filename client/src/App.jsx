import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from './context/AppContext'
import './App.css'

import Login from './components/Login'

function App() {
  const { isLoggedIn, loading } = useContext(AppContext)

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
      <Route path="/" element={isLoggedIn ? <div className="welcome"><h1>Welcome!</h1></div> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App