import { useState, useEffect } from 'react'

function Phase3Dashboard({ currentPhase }) {
  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSummary()
  }, [])

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

  return (
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

      {/* Accepted Proposals Section */}
      <div className="section">
        <h2>✅ Accepted Proposals</h2>
        <p className="section-desc">Proposals with score ≥ 2.0 (ranked by voting score)</p>

        {loadingSummary ? (
          <div className="loading-text">Loading accepted proposals...</div>
        ) : summary && summary.proposals.length > 0 ? (
          <>
            {summary.proposals.filter(p => (p.avg_score || 0) >= 2).length > 0 ? (
              <div className="results-table">
                <div className="table-header">
                  <div className="col-rank">Rank</div>
                  <div className="col-proposal">Proposal</div>
                  <div className="col-score">Avg Score</div>
                  <div className="col-cost">Cost</div>
                </div>
                {summary.proposals
                  .filter(p => (p.avg_score || 0) >= 2)
                  .map((proposal, index) => {
                    const avgScore = proposal.avg_score || 0
                    return (
                      <div key={proposal.id} className="table-row accepted">
                        <div className="col-rank">#{index + 1}</div>
                        <div className="col-proposal">
                          <div className="proposal-title">Proposal #{proposal.id}</div>
                          <div className="proposal-description-small">{proposal.description}</div>
                        </div>
                        <div className="col-score">
                          <span className="score-badge">{avgScore.toFixed(1)}</span>
                          <span className="score-votes">({proposal.vote_count} votes)</span>
                        </div>
                        <div className="col-cost">${proposal.cost.toLocaleString()}</div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="empty-state">
                <p>No proposals met the acceptance criteria</p>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No proposals available</p>
          </div>
        )}
      </div>

      {/* Rejected Proposals Section */}
      <div className="section">
        <h2>❌ Rejected Proposals</h2>
        <p className="section-desc">Proposals with score &lt; 2.0 (ranked by voting score)</p>

        {loadingSummary ? (
          <div className="loading-text">Loading rejected proposals...</div>
        ) : summary && summary.proposals.length > 0 ? (
          <>
            {summary.proposals.filter(p => (p.avg_score || 0) < 2).length > 0 ? (
              <div className="results-table">
                <div className="table-header">
                  <div className="col-rank">Rank</div>
                  <div className="col-proposal">Proposal</div>
                  <div className="col-score">Avg Score</div>
                  <div className="col-cost">Cost</div>
                </div>
                {summary.proposals
                  .filter(p => (p.avg_score || 0) < 2)
                  .map((proposal, index) => {
                    const avgScore = proposal.avg_score || 0
                    return (
                      <div key={proposal.id} className="table-row rejected">
                        <div className="col-rank">#{index + 1}</div>
                        <div className="col-proposal">
                          <div className="proposal-title">Proposal #{proposal.id}</div>
                          <div className="proposal-description-small">{proposal.description}</div>
                        </div>
                        <div className="col-score">
                          <span className="score-badge">{avgScore.toFixed(1)}</span>
                          <span className="score-votes">({proposal.vote_count} votes)</span>
                        </div>
                        <div className="col-cost">${proposal.cost.toLocaleString()}</div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="empty-state">
                <p>No rejected proposals</p>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No proposals available</p>
          </div>
        )}
      </div>

      {/* All Proposals Summary Section */}
      <div className="section">
        <h2>📋 All Proposals Summary</h2>
        <p className="section-desc">Complete list of all proposals with voting results</p>

        {loadingSummary ? (
          <div className="loading-text">Loading all proposals...</div>
        ) : summary && summary.proposals.length > 0 ? (
          <div className="results-table">
            <div className="table-header all-proposals-header">
              <div className="col-rank">Rank</div>
              <div className="col-proposal">Proposal</div>
              <div className="col-score">Avg Score</div>
              <div className="col-cost">Cost</div>
              <div className="col-status">Status</div>
            </div>
            {summary.proposals.map((proposal, index) => {
              const avgScore = proposal.avg_score || 0
              const isAccepted = avgScore >= 2
              return (
                <div key={proposal.id} className="table-row">
                  <div className="col-rank">#{index + 1}</div>
                  <div className="col-proposal">
                    <div className="proposal-title">Proposal #{proposal.id}</div>
                    <div className="proposal-description-small">{proposal.description}</div>
                  </div>
                  <div className="col-score">
                    <span className="score-badge">{avgScore.toFixed(1)}</span>
                    <span className="score-votes">({proposal.vote_count} votes)</span>
                  </div>
                  <div className="col-cost">${proposal.cost.toLocaleString()}</div>
                  <div className="col-status">
                    <span className={`status-badge ${isAccepted ? 'accepted' : 'rejected'}`}>
                      {isAccepted ? '✓ Accepted' : '✗ Rejected'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No proposals available</p>
          </div>
        )}
      </div>
    </>
  )
}

export default Phase3Dashboard