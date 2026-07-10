import { describe, it, expect } from 'vitest'
import { calculateReadingTime } from '../lib/reading-time'

describe('calculateReadingTime', () => {
  it('returns 1 for empty string (minimum)', () => {
    expect(calculateReadingTime('')).toBe(1)
  })

  it('returns 1 for whitespace-only string', () => {
    expect(calculateReadingTime('   \n  \t  ')).toBe(1)
  })

  it('returns 1 for very short content', () => {
    expect(calculateReadingTime('Hello world')).toBe(1)
  })

  it('returns 2 for a 400-word string', () => {
    const content = Array(400).fill('word').join(' ')
    expect(calculateReadingTime(content)).toBe(2)
  })

  it('returns 1 for a 200-word string', () => {
    const content = Array(200).fill('word').join(' ')
    expect(calculateReadingTime(content)).toBe(1)
  })

  it('returns 3 for a 600-word string', () => {
    const content = Array(600).fill('word').join(' ')
    expect(calculateReadingTime(content)).toBe(3)
  })

  it('strips JSX tags before counting words', () => {
    const jsxHeavy = '<MyComponent prop="value"><div className="foo">text</div></MyComponent>'
    const textOnly = 'text'
    expect(calculateReadingTime(jsxHeavy)).toBe(calculateReadingTime(textOnly))
  })

  it('strips MDX import statements before counting', () => {
    const withImport = `import MyComponent from './MyComponent'\n\nThis is the actual content with some words here.`
    const withoutImport = `\n\nThis is the actual content with some words here.`
    expect(calculateReadingTime(withImport)).toBe(calculateReadingTime(withoutImport))
  })

  it('strips code blocks before counting', () => {
    const withCode = 'Some text\n```\nconst x = 1\n```\nMore text'
    const withoutCode = 'Some text\n\nMore text'
    expect(calculateReadingTime(withCode)).toBe(calculateReadingTime(withoutCode))
  })

  it('returns a whole number (integer)', () => {
    const content = Array(350).fill('word').join(' ')
    expect(Number.isInteger(calculateReadingTime(content))).toBe(true)
  })

  it('always returns at least 1', () => {
    expect(calculateReadingTime('')).toBeGreaterThanOrEqual(1)
    expect(calculateReadingTime('<JSX />')).toBeGreaterThanOrEqual(1)
  })
})
