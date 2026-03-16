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
  const [allProposals, setAllProposals] = useState([])
  const [loadingProposals, setLoadingProposals] = useState(false)
  const [votingProposals, setVotingProposals] = useState([])
  const [loadingVoting, setLoadingVoting] = useState(false)
  const [userVotes, setUserVotes] = useState({})
  const [votingInProgress, setVotingInProgress] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  // Fetch current phase and proposals on mount
  useEffect(() => {
    fetchCurrentPhase()
    fetchAllProposals()
  }, [])

  // Fetch voting proposals when Phase 2
  useEffect(() => {
    if (currentPhase === 2) {
      fetchVotingProposals()
    }
  }, [currentPhase])

  // Fetch summary when Phase 3
  useEffect(() => {
    if (currentPhase === 3) {
      fetchSummary()
    }
  }, [currentPhase])

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

  const fetchVotingProposals = async () => {
    setLoadingVoting(true)
    try {
      const response = await fetch(`http://localhost:3001/api/proposals/voting/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setVotingProposals(data)
      } else if (response.status === 404) {
        setVotingProposals([])
      }
    } catch (err) {
      console.error('Error fetching voting proposals:', err)
    } finally {
      setLoadingVoting(false)
    }
  }

  const fetchSummary = async () => {
    setLoadingSummary(true)
    try {
      const response = await fetch('http://localhost:3001/api/summary')
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      } else {
        console.error('Summary fetch failed:', response.status)
        setError('Failed to load summary')
      }
    } catch (err) {
      console.error('Summary fetch error:', err)
      setError('Connection error while loading summary')
    } finally {
      setLoadingSummary(false)
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
        fetchAllProposals()
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

  const handleCastVote = async (proposalId, score) => {
    setError('')
    setSuccess('')
    setVotingInProgress(proposalId)

    try {
      const response = await fetch('http://localhost:3001/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          proposalId: proposalId,
          score: score
        })
      })

      const data = await response.json()

      if (response.ok) {
        setUserVotes({
          ...userVotes,
          [proposalId]: score
        })
        setSuccess('Vote submitted successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to submit vote')
      }
    } catch (err) {
      setError('Connection error')
      console.error(err)
    } finally {
      setVotingInProgress(null)
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

        {/* All Proposals Display (Phases 1, 2, 3) */}
        {(currentPhase === 1 || currentPhase === 2 || currentPhase === 3) && (
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
          <div className="section">
            <h2>Vote on Proposals</h2>
            <p className="section-desc">Cast your vote on team proposals (0 = Reject, 3 = Accept)</p>

            {loadingVoting ? (
              <div className="loading-text">Loading proposals for voting...</div>
            ) : votingProposals.length === 0 ? (
              <div className="empty-state">
                <p>No proposals available to vote on</p>
              </div>
            ) : (
              <div className="voting-grid">
                {votingProposals.map((proposal) => (
                  <div key={proposal.id} className="voting-card">
                    <div className="voting-header">
                      <h3>Proposal #{proposal.id}</h3>
                      <span className="voting-cost">${proposal.cost.toLocaleString()}</span>
                    </div>

                    <p className="voting-description">{proposal.description}</p>

                    <div className="voting-controls">
                      <div className="vote-scale">
                        {[0, 1, 2, 3].map((score) => (
                          <button
                            key={score}
                            className={`vote-btn ${userVotes[proposal.id] === score ? 'active' : ''}`}
                            onClick={() => handleCastVote(proposal.id, score)}
                            disabled={votingInProgress === proposal.id}
                            title={
                              score === 0 ? 'Reject' :
                              score === 1 ? 'Weak Accept' :
                              score === 2 ? 'Accept' :
                              'Strong Accept'
                            }
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                      <div className="vote-labels">
                        <span className="label-reject">Reject</span>
                        <span className="label-accept">Accept</span>
                      </div>
                    </div>

                    {userVotes[proposal.id] !== undefined && (
                      <div className="vote-submitted">
                        ✓ Your vote: {userVotes[proposal.id]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Phase 3: View Summary */}
        {currentPhase === 3 && (
          <>
            {/* Budget Summary Section */}
            <div className="section">
              <h2>💰 Budget Summary</h2>
              <p className="section-desc">Overview of total budget allocation</p>

              {loadingSummary ? (
                <div className="loading-text">Loading budget summary...</div>
              ) : summary ? (
                <>
                  <div className="summary-cards">
                    <div className="summary-card">
                      <div className="summary-label">Total Budget</div>
                      <div className="summary-value">${summary.budget.total.toLocaleString()}</div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-label">Amount Allocated</div>
                      <div className="summary-value accent-green">${summary.budget.spent.toLocaleString()}</div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-label">Remaining Budget</div>
                      <div className="summary-value accent-cyan">${summary.budget.remaining.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(summary.budget.spent / summary.budget.total) * 100}%` }}
                    ></div>
                    <div className="progress-text">
                      {Math.round((summary.budget.spent / summary.budget.total) * 100)}% Allocated
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>No budget data available</p>
                </div>
              )}
            </div>

            {/* Summary Statistics Section */}
            {summary && (
              <div className="section">
                <h2>📊 Statistics</h2>
                <p className="section-desc">Voting results overview</p>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Total Proposals</div>
                    <div className="stat-value">{summary.summary.total_proposals}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Accepted</div>
                    <div className="stat-value accent-green">{summary.summary.accepted}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Rejected</div>
                    <div className="stat-value accent-red">{summary.summary.rejected}</div>
                  </div>
                </div>
              </div>
            )}
          </>
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