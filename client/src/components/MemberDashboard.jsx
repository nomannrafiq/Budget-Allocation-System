import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import '../styles/MemberDashboard.css'

function MemberDashboard() {
  const { user, logout } = useContext(AppContext)
  const navigate = useNavigate()
  const [currentPhase, setCurrentPhase] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [phaseNames] = useState({
    0: 'SETUP',
    1: 'PROPOSAL',
    2: 'VOTING',
    3: 'SUMMARY'
  })
  const [proposalDescription, setProposalDescription] = useState('')
  const [proposalCost, setProposalCost] = useState('')

  // Fetch current phase on mount
  useEffect(() => {
    fetchCurrentPhase()
  }, [])

  const fetchCurrentPhase = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/phase/current')
      if (response.ok) {
        const data = await response.json()
        setCurrentPhase(data.current_phase)
      }
    } catch (err) {
      console.error('Error fetching phase:', err)
    }
  }

  const handleCreateProposal = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!proposalDescription || !proposalCost) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (proposalCost <= 0) {
      setError('Cost must be greater than 0')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          description: proposalDescription,
          cost: parseFloat(proposalCost)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Proposal created successfully!')
        setProposalDescription('')
        setProposalCost('')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to create proposal')
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
    <div className="member-dashboard">
      <div className="member-header">
        <div className="header-left">
          <h1>Budget Allocation System</h1>
          <p className="welcome-text">Welcome, {user?.username} (Member)</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          LOGOUT
        </button>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="member-content">
        
        {/* Phase Info */}
        <div className="phase-info">
          <p>Current Phase: <span className="phase-badge">{currentPhase} - {phaseNames[currentPhase]}</span></p>
        </div>

        {/* Phase 1: Create Proposals */}
        {currentPhase === 1 && (
          <div className="section">
            <h2>Create Proposal</h2>
            <p className="section-desc">Submit your budget allocation idea</p>
            
            <form onSubmit={handleCreateProposal}>
              <div className="form-group">
                <label>Proposal Description</label>
                <textarea
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  placeholder="Describe your proposal in detail"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Estimated Cost ($)</label>
                <input
                  type="number"
                  value={proposalCost}
                  onChange={(e) => setProposalCost(e.target.value)}
                  placeholder="Enter cost amount"
                  disabled={loading}
                  min="0"
                  step="100"
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'CREATE PROPOSAL'}
              </button>
            </form>
          </div>
        )}

        {/* Phase 2: Vote on Proposals */}
        {currentPhase === 2 && (
          <div className="section">
            <h2>Vote on Proposals</h2>
            <p className="section-desc">Cast your vote on team proposals</p>
            {

            }
          </div>
        )}

        {/* Phase 3: View Summary */}
        {currentPhase === 3 && (
          <div className="section">
            <h2>Budget Summary & Results</h2>
            <p className="section-desc">See the results of voting</p>
            {
              
            }
          </div>
        )}

        {/* Phase 0: Waiting Message */}
        {currentPhase === 0 && (
          <div className="section waiting-section">
            <h2>Waiting for Admin</h2>
            <p className="section-desc">Admin is setting up the budget. Please wait...</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default MemberDashboard