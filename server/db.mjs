import sqlite3 from 'sqlite3';

export const db = new sqlite3.Database('budget.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    throw err;
  }
  
  console.log('Database connected, initializing tables...');
  
  // Create Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      salt TEXT NOT NULL,
      hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'member')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `, (err) => {
    if (err) console.error('Error creating Users table:', err);
    else console.log('✓ Users table ready');
  });

  // Create Proposals table
  db.run(`
    CREATE TABLE IF NOT EXISTS Proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      description TEXT NOT NULL,
      cost NUMERIC NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
    );
  `, (err) => {
    if (err) console.error('Error creating Proposals table:', err);
    else console.log('✓ Proposals table ready');
  });

  // Create Budgets table
  db.run(`
    CREATE TABLE IF NOT EXISTS Budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount NUMERIC NOT NULL,
      phase INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `, (err) => {
    if (err) console.error('Error creating Budgets table:', err);
    else console.log('✓ Budgets table ready');
  });

  // Create Votes table
  db.run(`
    CREATE TABLE IF NOT EXISTS Votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      score INTEGER NOT NULL CHECK(score >= 0 AND score <= 3),
      userId INTEGER NOT NULL,
      proposalId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY(proposalId) REFERENCES Proposals(id) ON DELETE CASCADE,
      UNIQUE(userId, proposalId)
    );
  `, (err) => {
    if (err) console.error('Error creating Votes table:', err);
    else console.log('✓ Votes table ready');
  });

  // Create system_state table
  db.run(`
    CREATE TABLE IF NOT EXISTS system_state (
      id INTEGER PRIMARY KEY,
      current_phase INTEGER DEFAULT 0 CHECK(current_phase >= 0 AND current_phase <= 3)
    );
  `, (err) => {
    if (err) console.error('Error creating system_state table:', err);
    else {
      console.log('✓ system_state table ready');
      // Initialize system state if not exists
      db.get('SELECT * FROM system_state WHERE id = 1', (err, row) => {
        if (!row) {
          db.run('INSERT INTO system_state (id, current_phase) VALUES (1, 0)', (err) => {
            if (err) console.error('Error initializing system_state:', err);
            else console.log('✓ System state initialized to Phase 0');
          });
        }
      });
    }
  });
});