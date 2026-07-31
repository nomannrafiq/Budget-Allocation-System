// One place to change if the server ever moves off port 3001.
const API = process.env.API_URL || 'http://localhost:3001/api';

module.exports = { API };