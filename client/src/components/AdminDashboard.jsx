import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import '../styles/AdminDashboard.css'

function AdminDashboard() {
  const { user, logout } = useContext(AppContext)
  const navigate = useNavigate()
  const [budgetAmount, setBudgetAmount] = useState('')
  const [currentBudget, setCurrentBudget] = useState(null)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [phaseNames] = useState({
    0: 'SETUP',
    1: 'PROPOSAL',
    2: 'VOTING',
    3: 'SUMMARY'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch current budget and phase on mount
  useEffect(() => {
    fetchBudgetAndPhase()
  }, [])

  const fetchBudgetAndPhase = async () => {
    try {
      const budgetRes = await fetch('http://localhost:3001/api/budget')
      if (budgetRes.ok) {
        const budgetData = await budgetRes.json()
        setCurrentBudget(budgetData)
      }

      const phaseRes = await fetch('http://localhost:3001/api/phase/current')
      if (phaseRes.ok) {
        const phaseData = await phaseRes.json()
        setCurrentPhase(phaseData.current_phase)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  const handleSetBudget = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!budgetAmount || budgetAmount <= 0) {
      setError('Please enter a valid budget amount')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(budgetAmount) })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Budget set successfully!')
        setCurrentBudget(data.budget)
        setBudgetAmount('')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to set budget')
      }
    } catch (err) {
      setError('Connection error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePhaseTransition = async (newPhase) => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/phase/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: newPhase })
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentPhase(newPhase)
        setSuccess(`Moved to Phase ${newPhase} - ${phaseNames[newPhase]}`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to transition phase')
      }
    } catch (err) {
      setError('Connection error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

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

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-content">
        
        {/* Budget Section */}
        <div className="section">
          <h2>Set Budget</h2>
          <p className="section-desc">Define the total budget for this cycle</p>
          
          <form onSubmit={handleSetBudget}>
            <div className="form-group">
              <label>Budget Amount ($)</label>
              <input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="Enter budget amount"
                disabled={loading}
                min="0"
                step="100"
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Setting...' : 'SET BUDGET'}
            </button>
          </form>

          {currentBudget && (
            <div className="current-info">
              <p><strong>Current Budget:</strong> ${currentBudget.amount.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Phase Section */}
        <div className="section">
          <h2>System Phase Management</h2>
          <p className="section-desc">Control which phase of the budget process the system is in</p>

          <div className="current-phase">
            <p>Current Phase: <span className="phase-badge">{currentPhase} - {phaseNames[currentPhase]}</span></p>
          </div>

          <div className="phase-grid">
            {[0, 1, 2, 3].map((phase) => (
              <div key={phase} className={`phase-card ${currentPhase === phase ? 'active' : ''}`}>
                <h3>Phase {phase}</h3>
                <p className="phase-name">{phaseNames[phase]}</p>
                <p className="phase-desc">
                  {phase === 0 && 'Setup budget'}
                  {phase === 1 && 'Create proposals'}
                  {phase === 2 && 'Vote on proposals'}
                  {phase === 3 && 'View results'}
                </p>
                {currentPhase !== phase && (
                  <button
                    className="phase-btn"
                    onClick={() => handlePhaseTransition(phase)}
                    disabled={loading}
                  >
                    Move to Phase {phase}
                  </button>
                )}
                {currentPhase === phase && (
                  <div className="phase-active">✓ Current</div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard