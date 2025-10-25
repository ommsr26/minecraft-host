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

    // Delete server (cascades to queue and settings)
    const { error } = await supabase
      .from('servers')
      .delete()
      .eq('id', server_id)

    if (error) throw error

    // Update profile server count
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_servers')
      .eq('id', user_id)
      .single()

    await supabase
      .from('profiles')
      .update({ total_servers: Math.max(0, (profile?.total_servers || 1) - 1) })
      .eq('id', user_id)

    return NextResponse.json({ 
      message: 'Server deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}