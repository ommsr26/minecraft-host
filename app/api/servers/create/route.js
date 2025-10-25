import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { user_id, name, version, ram } = body

    // Validate input
    if (!user_id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check user's server limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_servers, max_servers')
      .eq('id', user_id)
      .single()

    if (profile && profile.total_servers >= profile.max_servers) {
      return NextResponse.json(
        { error: 'Server limit reached' },
        { status: 403 }
      )
    }

    // Create server
    const { data: server, error } = await supabase
      .from('servers')
      .insert([
        {
          user_id,
          name,
          version: version || 'latest',
          ram: ram || 1024,
          status: 'stopped'
        }
      ])
      .select()
      .single()

    if (error) throw error

    // Update profile server count
    await supabase
      .from('profiles')
      .update({ total_servers: (profile?.total_servers || 0) + 1 })
      .eq('id', user_id)

    return NextResponse.json({ server }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}