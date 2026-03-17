import { useState, useEffect, useContext } from 'react'
import { AppContext } from '../context/AppContext'

function Phase1Dashboard({ currentPhase, allProposals, loadingProposals, onProposalCreated }) {
  const { user } = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')
  const [proposalCost, setProposalCost] = useState('')
  const [proposals, setProposals] = useState(allProposals)

  useEffect(() => {
    setProposals(allProposals)
  }, [allProposals])

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
        setProposals([...proposals, data])
        if (onProposalCreated) {
          onProposalCreated()
        }
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

  const nextPhaseAvailable = currentPhase >= 2

  return (
    <>
      {/* Create Proposal Section */}
      <div className="section">
        <h2>Create Proposal</h2>
        <p className="section-desc">Submit your budget allocation idea</p>

        {error && <div className="error-message-inline">{error}</div>}
        {success && <div className="success-message-inline">{success}</div>}
        
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

      {/* All Proposals Display */}
      <div className="section">
        <h2>All Proposals</h2>
        <p className="section-desc">View all team proposals</p>

        {loadingProposals ? (
          <div className="loading-text">Loading proposals...</div>
        ) : proposals.length === 0 ? (
          <div className="empty-state">
            <p>No proposals yet</p>
          </div>
        ) : (
          <div className="proposals-grid">
            {proposals.map((proposal) => (
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

      {/* Next Button */}
      <div className="section navigation-section">
        <button
          className={`next-button ${!nextPhaseAvailable ? 'disabled' : ''}`}
          disabled={!nextPhaseAvailable}
          title={nextPhaseAvailable ? 'Continue to Voting' : 'Waiting for Voting phase...'}
        >
          {nextPhaseAvailable ? 'Continue to Voting →' : '⏳ Waiting for Voting phase...'}
        </button>
      </div>
    </>
  )
}

export default Phase1Dashboard