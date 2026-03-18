import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import '../styles/Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AppContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        login(data.user)
        navigate(data.user.role === 'admin' ? '/admindashboard' : '/memberdashboard')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError('Connection error: Make sure server is running on port 3001')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Budget Allocation System</h2>
        <h3>Login</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        

        <p className="signup-link">
          Don't have an account? 
          <button 
            type="button"
            onClick={() => navigate('/signup')}
            className="link-btn"
          >
            Sign up here
          </button>
        </p>

        <div className="test-credentials">
          <h4>Test Credentials:</h4>
          <p><strong>Admin:</strong> noman / 123</p>
          <p><strong>Members:</strong> sameer / 123, rafay / 123</p>
        </div>
      </div>
    </div>
  )
}

export default Login