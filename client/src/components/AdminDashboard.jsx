import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import '../styles/AdminDashboard.css' 


function AdminDashboard() {
  const { user, logout } = useContext(AppContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-left">
          <h1>Budget Allocation System</h1>
          <p className="welcome-text">Welcome, {user?.username} (Admin)</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          LOGOUT
        </button>
      </div>

      <div className="admin-content">
        {

        }
      </div>
    </div>
  )
}

export default AdminDashboard