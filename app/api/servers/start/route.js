import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { server_id, user_id } = body

    // Verify server belongs to user
    const { data: server, error: fetchError } = await supabase
      .from('servers')
      .select('*')
      .eq('id', server_id)
      .eq('user_id', user_id)
      .single()

    if (fetchError || !server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      )
    }

    // Check if already running
    if (server.status === 'running') {
      return NextResponse.json(
        { error: 'Server is already running' },
        { status: 400 }
      )
    }

    // Add to queue
    const { data: queueEntry, error: queueError } = await supabase
      .from('queue')
      .insert([
        {
          server_id: server_id,
          status: 'waiting',
          priority: 0
        }
      ])
      .select()
      .single()

    if (queueError) throw queueError

    // Update server status to queued
    await supabase
      .from('servers')
      .update({ status: 'queued' })
      .eq('id', server_id)

    return NextResponse.json({ 
      message: 'Server added to queue',
      queue_id: queueEntry.id,
      status: 'queued'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}