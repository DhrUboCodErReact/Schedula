// app/api/register/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const data = await req.json()

  // This is where you'd send it to your mock API server (e.g., json-server)
  // Assuming mock API is running on http://localhost:3001/users

  const res = await fetch('https://mock-api-schedula-1-xzbk.onrender.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }

  const createdUser = await res.json()
  return NextResponse.json(createdUser, { status: 201 })
}
