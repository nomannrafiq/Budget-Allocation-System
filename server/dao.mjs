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
