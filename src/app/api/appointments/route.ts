/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/appointments/route.ts
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Mock DB path
const dbPath = process.cwd() + '/mock/db.json'
import fs from 'fs/promises'

export async function GET() {
  try {
    const data = await fs.readFile(dbPath, 'utf-8')
    const json = JSON.parse(data)
    return NextResponse.json(json.appointments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const newAppointment = await req.json()
    const data = await fs.readFile(dbPath, 'utf-8')
    const json = JSON.parse(data)

    const appointment = {
      id: uuidv4(),
      ...newAppointment,
    }

    json.appointments.push(appointment)
    await fs.writeFile(dbPath, JSON.stringify(json, null, 2))

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
