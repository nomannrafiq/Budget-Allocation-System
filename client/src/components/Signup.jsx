import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import '../styles/Login.css'

function Signup() {
  const navigate = useNavigate()
  const { login } = useContext(AppContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (password.length < 3) {
      setError('Password must be at least 3 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          password: password,
          role: 'member'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Account created successfully! Logging in...')
        setTimeout(() => {
          login(data.user)
          navigate('/memberdashboard')
        }, 1500)
      } else {
        setError(data.message || 'Signup failed')
      }
    } catch (err) {
      setError('Connection error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Create Account</h1>
        <p className="login-subtitle">Budget Allocation System</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              disabled={loading}
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
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Creating Account...' : 'SIGN UP'}
          </button>
        </form>

        <p className="signup-link">
          Already have an account? 
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="link-btn"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  )
}

export default Signup