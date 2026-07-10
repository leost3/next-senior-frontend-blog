import { createClient } from '@libsql/client/http'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url) {
  throw new Error(
    'Missing environment variable: TURSO_DATABASE_URL. ' +
      'Add it to .env.local for local dev or to your Vercel project settings.'
  )
}

if (!authToken) {
  throw new Error(
    'Missing environment variable: TURSO_AUTH_TOKEN. ' +
      'Add it to .env.local for local dev or to your Vercel project settings.'
  )
}

export const db = createClient({ url, authToken })
