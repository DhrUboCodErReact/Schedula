// app/api/doctors/route.ts
import { NextResponse } from 'next/server'
import doctors from '../../../../db.json'

export async function GET() {
  return NextResponse.json(doctors)
}
