import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app'

describe('CRM HTTP app', () => {
  const app = createApp()

  it('GET / returns api info', async () => {
    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ name: 'coffee cherry crm api', version: '1.0.0' })
  })

  it('GET /api/orders requires auth', async () => {
    const response = await request(app).get('/api/orders')

    expect(response.status).toBe(401)
  })

  it('GET /api/contacts requires auth', async () => {
    const response = await request(app).get('/api/contacts')

    expect(response.status).toBe(401)
  })
})
