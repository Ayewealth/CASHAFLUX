import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { describe, it, expect } from 'vitest'

describe('Task 1: Dependencies, Tailwind v4, & shadcn Init', () => {
  it('pnpm build succeeds with Tailwind v4 compilation', { timeout: 180000 }, () => {
    const output = execSync('pnpm build', { encoding: 'utf-8', stdio: 'pipe' })
    expect(() => execSync('pnpm build', { encoding: 'utf-8' })).not.toThrow()
  })

  it('components.json exists after shadcn init', () => {
    expect(existsSync('components.json')).toBe(true)
  })

  it('client/src/index.css contains brand token navy color', () => {
    const css = readFileSync('client/src/index.css', 'utf-8')
    expect(css).toContain('#1E3A5F')
  })

  it('client/src/index.css contains brand token blue color', () => {
    const css = readFileSync('client/src/index.css', 'utf-8')
    expect(css).toContain('#2563EB')
  })

  it('client/src/index.css defines Tailwind v4 @theme block', () => {
    const css = readFileSync('client/src/index.css', 'utf-8')
    expect(css).toContain('@theme')
  })

  it('tailwindcss is in package.json dependencies', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    expect(deps.tailwindcss).toBeTruthy()
  })

  it('react-router is in package.json dependencies', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    expect(deps['react-router']).toBeTruthy()
  })

  it('@tanstack/react-query is in package.json dependencies', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    expect(deps['@tanstack/react-query']).toBeTruthy()
  })
})
