import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Phase0Dashboard from './Phase0Dashboard'
import Phase1Dashboard from './Phase1Dashboard'
import Phase2Dashboard from './Phase2Dashboard'
import Phase3Dashboard from './Phase3Dashboard'
import '../styles/MemberDashboard.css'

function MemberDashboard() {
  const { user, logout } = useContext(AppContext)
  const navigate = useNavigate()
  const [currentPhase, setCurrentPhase] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [phaseNames] = useState({
    0: 'SETUP',
    1: 'PROPOSAL',
    2: 'VOTING',
    3: 'SUMMARY'
  })
  const [allProposals, setAllProposals] = useState([])
  const [loadingProposals, setLoadingProposals] = useState(false)

  // Fetch current phase and proposals on mount
  useEffect(() => {
    fetchCurrentPhase()
    fetchAllProposals()
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

  const fetchAllProposals = async () => {
    setLoadingProposals(true)
    try {
      const response = await fetch('http://localhost:3001/api/proposals')
      if (response.ok) {
        const data = await response.json()
        setAllProposals(data)
      }
    } catch (err) {
      console.error('Error fetching proposals:', err)
    } finally {
      setLoadingProposals(false)
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

        {/* Phase 0: Waiting Message */}
        {currentPhase === 0 && (
          <Phase0Dashboard />
        )}

        {/* Phase 1: Create Proposals */}
        {currentPhase === 1 && (
          <Phase1Dashboard 
            currentPhase={currentPhase}
            allProposals={allProposals}
            loadingProposals={loadingProposals}
            onProposalCreated={fetchAllProposals}
          />
        )}

        {/* All Proposals Display (Phases 2, 3) */}
        {(currentPhase === 2 || currentPhase === 3) && (
          <div className="section">
            <h2>All Proposals</h2>
            <p className="section-desc">View all team proposals</p>

            {loadingProposals ? (
              <div className="loading-text">Loading proposals...</div>
            ) : allProposals.length === 0 ? (
              <div className="empty-state">
                <p>No proposals yet</p>
              </div>
            ) : (
              <div className="proposals-grid">
                {allProposals.map((proposal) => (
                  <div key={proposal.id} className="proposal-card">
                    <div className="proposal-header">
                      <h3>Proposal #{proposal.id}</h3>
                      <span className="proposal-cost">${proposal.cost.toLocaleString()}</span>
                    </div>
                    <p className="proposal-description">{proposal.description}</p>
                    <div className="proposal-meta">
                      <span className="proposal-by">By: User {proposal.userId}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Vote on Proposals */}
        {currentPhase === 2 && (
          <Phase2Dashboard 
            currentPhase={currentPhase}
            loadingVoting={loadingProposals}
          />
        )}

        {/* Phase 3: View Summary */}
        {currentPhase === 3 && (
          <Phase3Dashboard 
            currentPhase={currentPhase}
          />
        )}

      </div>
    </div>
  )
}

export default MemberDashboard