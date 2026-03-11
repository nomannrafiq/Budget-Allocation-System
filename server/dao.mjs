import {db} from './db.mjs';
import crypto from 'crypto';

const validRoles = ['admin', 'member'];

// ===== USER REGISTRATION =====

export const registerUser = (username, password, role) => {
  return new Promise((resolve, reject) => {
    if (!validRoles.includes(role)) {
      return reject(new Error('Invalid role provided. Must be "admin" or "member".'));
    }

    // Check if username already exists
    const checkUserQuery = 'SELECT username FROM Users WHERE username = ?';
    db.get(checkUserQuery, [username], (err, existingUser) => {
      if (err) {
        console.error('Database error while checking user:', err.message);
        return reject(new Error('Database error: ' + err.message));
      }
      if (existingUser) {
        console.log('Username already exists:', username);
        return reject(new Error('Username already exists. Please choose another one.'));
      }

      // Generate salt and hash password
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
        if (err) {
          console.error('Error during password hashing:', err.message);
          return reject(new Error('Error during password hashing: ' + err.message));
        }
        const hash = hashedPassword.toString('hex');

        // Insert user into database
        const insertUserQuery = 'INSERT INTO Users (username, salt, hash, role) VALUES (?, ?, ?, ?)';
        db.run(insertUserQuery, [username, salt, hash, role], function (err) {
          if (err) {
            console.error('Database error while inserting user:', err.message);
            return reject(new Error('Database error: ' + err.message));
          }

          resolve({
            id: this.lastID,
            username: username,
            role: role
          });
        });
      });
    });
  });
};


// ===== USER LOGIN =====

export const getUserByCredentials = (username, password) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM Users WHERE username = ?';
    db.get(query, [username], (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        reject(new Error('Database error: ' + err.message));
        return;
      }

      if (!row) {
        console.log('User not found');
        resolve(false);
        return;
      }

      console.log('User found:', row.username);

      const user = {
        id: row.id,
        username: row.username,
        role: row.role
      };

      // Verify password
      crypto.scrypt(password, row.salt, 64, (err, hashedPassword) => {
        if (err) {
          console.error('Error during password hashing:', err.message);
          reject(new Error('Error during password hashing: ' + err.message));
          return;
        }

        if (crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) {
          resolve(user);
        } else {
          resolve(false);
        }
      });
    });
  });
};

// ===== GET USER BY ID =====

export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM Users WHERE id = ?';
    db.get(query, [id], (err, row) => {
      if (err) {
        reject(new Error('Database error: ' + err.message));
      } else if (!row) {
        resolve(null);
      } else {
        const user = {
          id: row.id,
          username: row.username,
          role: row.role
        };
        resolve(user);
      }
    });
  });
};

// ===== PROPOSAL FUNCTIONS =====

// List all proposals
export const getAllProposals = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Proposals', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

export const getProposalById = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM Proposals WHERE id = ?';
    db.get(query, [id], (err, row) => {
      if (err) {
      console.error('Error fetching proposal:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// ===== GET USER PROPOSALS =====

export const getProposalsByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Proposals WHERE userId = ?';
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        console.error('Error fetching user proposals:', err.message);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

// ===== CREATE PROPOSAL =====

export const createProposal = (userId, description, cost) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO Proposals (userId, description, cost) VALUES (?, ?, ?)';
    db.run(query, [userId, description, cost], function (err) {
      if (err) {
        console.error('Error creating proposal:', err.message);
        reject(err);
      } else {
        resolve({ id: this.lastID, userId, description, cost });
      }
    });
  });
};

// ===== UPDATE PROPOSAL =====

export const updateProposal = (id, description, cost) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE Proposals SET description = ?, cost = ? WHERE id = ?';
    db.run(query, [description, cost, id], function (err) {
      if (err) {
        console.error('Error updating proposal:', err.message);
        reject(err);
      } else {
        resolve({ id, description, cost });
      }
    });
  });
};

// ===== DELETE PROPOSAL =====

export const deleteProposal = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM Proposals WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Error deleting proposal:', err.message);
        reject(err);
      } else {
        resolve({ id });
      }
    });
  });
};

// ===== GET PROPOSALS FOR VOTING =====

export const getProposalsForVoting = (userId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM Proposals WHERE userId != ?';
    db.all(query, [userId], (err, rows) => {
      if (err) {
        console.error('Error fetching proposals for voting:', err.message);
        reject(new Error('Database error: ' + err.message));
      } else {
        resolve(rows || []);
      }
    });
  });
};


