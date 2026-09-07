import { describe, expect, it } from 'vitest'

import { workerRegistrationSchema } from './schemas'

const validPayload = {
  name: 'Jane Doe',
  email: 'Jane.Doe@Example.com',
  phone: '9876543210',
  location: 'New York',
  age: 25,
  skills: ['plumbing'],
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

  it('rejects a name longer than 80 characters (boundary)', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, name: 'a'.repeat(81) })
    expect(result.success).toBe(false)
  })

  it('accepts a name exactly 80 characters (boundary)', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, name: 'a'.repeat(80) })
    expect(result.success).toBe(true)
  })

  it('trims leading/trailing whitespace from name, email, and phone', () => {
    const result = workerRegistrationSchema.parse({
      ...validPayload,
      name: '  Jane Doe  ',
      email: '  jane.doe@example.com  ',
      phone: '  9876543210  ',
    })
    expect(result.name).toBe('Jane Doe')
    expect(result.email).toBe('jane.doe@example.com')
    expect(result.phone).toBe('9876543210')
  })

  it('accepts a phone number with a leading + and separators', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, phone: '+1 234-567-8901' })
    expect(result.success).toBe(true)
  })

  it('rejects a phone number longer than 15 characters (boundary)', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, phone: '1234567890123456' })
    expect(result.success).toBe(false)
  })

  it('rejects age that is not a whole number', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, age: 25.5 })
    expect(result.success).toBe(false)
  })

  it('accepts multiple valid skills', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, skills: ['plumbing', 'electrical'] })
    expect(result.success).toBe(true)
  })

  it('accepts free-text location (not constrained to a fixed list)', () => {
    const result = workerRegistrationSchema.safeParse({ ...validPayload, location: 'Some Small Town' })
    expect(result.success).toBe(true)
  })
})
