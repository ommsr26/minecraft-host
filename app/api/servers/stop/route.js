import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { server_id, user_id } = body

    // Verify server belongs to user
    const { data: server } = await supabase
      .from('servers')
      .select('*')
      .eq('id', server_id)
      .eq('user_id', user_id)
      .single()

    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      )
    }

    // Update server status
    const { error } = await supabase
      .from('servers')
      .update({ 
        status: 'stopped',
        worker_id: null,
        tunnel_info: null
      })
      .eq('id', server_id)

    if (error) throw error

    // Remove from queue if exists
    await supabase
      .from('queue')
      .delete()
      .eq('server_id', server_id)

    return NextResponse.json({ 
      message: 'Server stopped',
      status: 'stopped'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}