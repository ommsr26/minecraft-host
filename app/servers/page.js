'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ServersPage() {
  const [user, setUser] = useState(null)
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  // Form state
  const [serverName, setServerName] = useState('')
  const [serverVersion, setServerVersion] = useState('latest')
  const [serverRam, setServerRam] = useState(1024)

  useEffect(() => {
  checkUser()
}, [])

// Add this NEW useEffect for auto-refresh
useEffect(() => {
  if (!user) return
  
  // Refresh server list every 5 seconds
  const interval = setInterval(() => {
    fetchServers(user.id)
  }, 5000)
  
  return () => clearInterval(interval) // Cleanup on unmount
}, [user])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }
    
    setUser(user)
    await fetchServers(user.id)
    setLoading(false)
  }

  const fetchServers = async (userId) => {
    const { data, error } = await supabase
      .from('servers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (data) {
      setServers(data)
    }
  }

  const handleCreateServer = async (e) => {
  alert('BUTTON WAS CLICKED!')
  e.preventDefault()
  console.log('=== CREATE SERVER CLICKED ===')
  console.log('User:', user)
  console.log('Server Name:', serverName)
  console.log('Version:', serverVersion)
  console.log('RAM:', serverRam)
  
  setCreating(true)

  try {
    console.log('Sending request to API...')
    
    const response = await fetch('/api/servers/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        name: serverName,
        version: serverVersion,
        ram: parseInt(serverRam)
      })
    })

    console.log('Response status:', response.status)
    
    const data = await response.json()
    console.log('Response data:', data)

    if (response.ok) {
      alert('Server created successfully!')
      setServerName('')
      await fetchServers(user.id)
    } else {
      alert('Error: ' + data.error)
    }
  } catch (error) {
    console.error('Caught error:', error)
    alert('Error creating server: ' + error.message)
  }

  setCreating(false)
}

  const handleStartServer = async (serverId) => {
    try {
      const response = await fetch('/api/servers/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_id: serverId,
          user_id: user.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Server added to queue!')
        await fetchServers(user.id)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error starting server: ' + error.message)
    }
  }

  const handleStopServer = async (serverId) => {
    try {
      const response = await fetch('/api/servers/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_id: serverId,
          user_id: user.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Server stopped!')
        await fetchServers(user.id)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error stopping server: ' + error.message)
    }
  }

  const handleDeleteServer = async (serverId, serverName) => {
    if (!confirm(`Are you sure you want to delete "${serverName}"?`)) {
      return
    }

    try {
      const response = await fetch('/api/servers/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_id: serverId,
          user_id: user.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Server deleted!')
        await fetchServers(user.id)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error deleting server: ' + error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-black">
      {/* Header */}
      <nav className="bg-gray-800 border-b border-green-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🎮 Minecraft Host</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Create Server Form */}
        <div className="bg-gray-800 rounded-lg border border-green-600 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Create New Server</h2>
          <form onSubmit={handleCreateServer} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Server Name</label>
              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                required
                placeholder="My Awesome Server"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Version</label>
                <select
                  value={serverVersion}
                  onChange={(e) => setServerVersion(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                >
                  <option value="latest">Latest</option>
                  <option value="1.20.1">1.20.1</option>
                  <option value="1.19.4">1.19.4</option>
                  <option value="1.18.2">1.18.2</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">RAM (MB)</label>
                <select
                  value={serverRam}
                  onChange={(e) => setServerRam(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
                >
                  <option value="512">512 MB</option>
                  <option value="1024">1 GB</option>
                  <option value="2048">2 GB</option>
                  <option value="4096">4 GB</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded transition disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Server'}
            </button>
          </form>
        </div>

        {/* Servers List */}
        <div className="bg-gray-800 rounded-lg border border-green-600 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">My Servers ({servers.length})</h2>
          
          {servers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No servers yet. Create one above!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {servers.map(server => (
                <div
                  key={server.id}
                  className="bg-gray-700 p-6 rounded border border-gray-600"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-bold text-xl mb-2">{server.name}</h3>
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>Version: {server.version}</p>
                        <p>RAM: {server.ram} MB</p>
                        <p>Created: {new Date(server.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded text-sm font-semibold ${
                      server.status === 'running' ? 'bg-green-600 text-white' :
                      server.status === 'queued' ? 'bg-yellow-600 text-white' :
                      server.status === 'starting' ? 'bg-blue-600 text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {server.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex gap-3">
                  {/* ADD THIS NEW BUTTON HERE */}
                      <Link
                        href={`/servers/${server.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                      >
                        📖 Setup Guide
                      </Link>
                    {server.status === 'stopped' && (
                      <button
                        onClick={() => handleStartServer(server.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                      >
                        ▶ Start
                      </button>
                    )}
                    
                    {(server.status === 'running' || server.status === 'queued') && (
                      <button
                        onClick={() => handleStopServer(server.id)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition"
                      >
                        ⏸ Stop
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteServer(server.id, server.name)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}