import { describe, it, expect, beforeEach } from 'vitest'

beforeEach(() => {
  process.env.ENCRYPTION_KEY =
    'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'
})

import { encrypt, decrypt } from './crypto'

describe('encrypt', () => {
  it('returns a string in iv:authTag:ciphertext format', () => {
    const result = encrypt('sk_test_abc123')
    const parts = result.split(':')
    expect(parts).toHaveLength(3)
    expect(parts[0]).toHaveLength(24)
    expect(parts[1]).toHaveLength(32)
    expect(parts[2].length).toBeGreaterThan(0)
  })

  it('produces different ciphertext for the same input (random IV)', () => {
    const a = encrypt('sk_test_abc123')
    const b = encrypt('sk_test_abc123')
    expect(a).not.toBe(b)
  })
})

describe('decrypt', () => {
  it('round-trips correctly', () => {
    const original = 'sk_test_abc123'
    const encrypted = encrypt(original)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(original)
  })

  it('throws on tampered ciphertext', () => {
    const encrypted = encrypt('sk_test_abc123')
    const parts = encrypted.split(':')
    parts[2] = 'deadbeef' + parts[2].slice(8)
    const tampered = parts.join(':')
    expect(() => decrypt(tampered)).toThrow()
  })
})

describe('missing ENCRYPTION_KEY', () => {
  it('throws if ENCRYPTION_KEY is not set', () => {
    delete process.env.ENCRYPTION_KEY
    expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY')
  })
})
