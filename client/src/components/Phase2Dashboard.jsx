import { useState, useEffect, useContext } from 'react'
import { AppContext } from '../context/AppContext'

function Phase2Dashboard({ currentPhase, loadingVoting }) {
  const { user } = useContext(AppContext)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userVotes, setUserVotes] = useState({})
  const [votingInProgress, setVotingInProgress] = useState(null)
  const [votingProposals, setVotingProposals] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchVotingProposals()
  }, [])

  const fetchVotingProposals = async () => {
    setLoading(true)
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

  const nextPhaseAvailable = currentPhase >= 3

  return (
    <>
      {/* Vote on Proposals Section */}
      <div className="section">
        <h2>Vote on Proposals</h2>
        <p className="section-desc">Cast your vote on team proposals (0 = Reject, 3 = Accept)</p>

        {error && <div className="error-message-inline">{error}</div>}
        {success && <div className="success-message-inline">{success}</div>}

        {loading ? (
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

      {/* Next Button */}
      <div className="section navigation-section">
        <button
          className={`next-button ${!nextPhaseAvailable ? 'disabled' : ''}`}
          disabled={!nextPhaseAvailable}
          title={nextPhaseAvailable ? 'View Summary' : 'Waiting for Summary phase...'}
        >
          {nextPhaseAvailable ? 'View Summary →' : '⏳ Waiting for Summary phase...'}
        </button>
      </div>
    </>
  )
}

export default Phase2Dashboard