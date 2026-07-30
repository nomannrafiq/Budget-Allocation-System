import request from 'supertest'
import app from '../index.mjs'

describe('Authentication Routes', () => {
  
  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'noman',
          password: '123'
        })
      
      expect(res.statusCode).toBe(200)
      expect(res.body.user).toBeDefined()
      expect(res.body.user.role).toBe('admin')
    })

    test('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'noman',
          password: 'wrongpassword'
        })
      
      expect(res.statusCode).toBe(401)
      expect(res.body.message).toBeDefined()
    })

    test('should reject missing username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          password: '123'
        })
      
      expect(res.statusCode).toBe(400)
    })

    test('should reject missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'noman'
        })
      
      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST /api/auth/register', () => {
    test('should create new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: `testuser_${Date.now()}`,
          password: 'testpass123',
          role: 'member'
        })
      
      expect(res.statusCode).toBe(201)
      expect(res.body.user).toBeDefined()
    })

    test('should reject duplicate username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'noman',
          password: 'password123',
          role: 'member'
        })
      
      expect(res.statusCode).toBe(409)
    })

    test('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
        })
      
      expect(res.statusCode).toBe(400)
    })
  })
})