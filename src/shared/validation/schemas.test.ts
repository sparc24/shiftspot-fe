import { describe, expect, it } from 'vitest'

import { workerRegistrationSchema } from './schemas'

const validPayload = {
  name: 'Jane Doe',
  email: 'Jane.Doe@Example.com',
  phone: '9876543210',
  location: 'downtown',
  age: 25,
  skills: ['cleaning'],
}

describe('workerRegistrationSchema', () => {
  it('accepts a valid payload and normalizes email to lowercase', () => {
    const result = workerRegistrationSchema.parse(validPayload)
    expect(result.email).toBe('jane.doe@example.com')
    expect(result.name).toBe('Jane Doe')
  })

  it('rejects a name shorter than 2 characters', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, name: 'J' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email address', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects a phone number that is too short', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, phone: '123' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty location', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, location: '' })
    expect(result.success).toBe(false)
  })

  it('rejects age below 18 (boundary)', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, age: 17 })
    expect(result.success).toBe(false)
  })

  it('accepts age exactly 18 (boundary)', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, age: 18 })
    expect(result.success).toBe(true)
  })

  it('accepts age exactly 70 (boundary)', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, age: 70 })
    expect(result.success).toBe(true)
  })

  it('rejects age above 70 (boundary)', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, age: 71 })
    expect(result.success).toBe(false)
  })

  it('rejects an empty skills array', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, skills: [] })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown skill id', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, skills: ['not-a-skill'] })
    expect(result.success).toBe(false)
  })
})
