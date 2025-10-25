'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchServers()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }
    
    setUser(user)
    
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    setProfile(profileData)
    setLoading(false)
  }

  const fetchServers = async () => {
    const { data, error } = await supabase
      .from('servers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setServers(data)
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
              Welcome, {profile?.username || user?.email}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-green-600">
            <h3 className="text-gray-400 text-sm mb-2">Total Servers</h3>
            <p className="text-3xl font-bold text-white">{servers.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-green-600">
            <h3 className="text-gray-400 text-sm mb-2">Running Servers</h3>
            <p className="text-3xl font-bold text-green-500">
              {servers.filter(s => s.status === 'running').length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-green-600">
            <h3 className="text-gray-400 text-sm mb-2">Server Limit</h3>
            <p className="text-3xl font-bold text-white">
              {servers.length} / {profile?.max_servers || 3}
            </p>
          </div>
        </div>

        {/* Create Server Button */}
        <div className="mb-6">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded transition">
            + Create New Server
          </button>
        </div>

        {/* Servers List */}
        <div className="bg-gray-800 rounded-lg border border-green-600 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">My Servers</h2>
          
          {servers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">
                You don't have any servers yet!
              </p>
              <p className="text-gray-500">
                Click "Create New Server" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {servers.map(server => (
                <div
                  key={server.id}
                  className="bg-gray-700 p-4 rounded border border-gray-600 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-white font-bold text-lg">{server.name}</h3>
                    <p className="text-gray-400 text-sm">
                      Version: {server.version} | RAM: {server.ram}MB
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      server.status === 'running' ? 'bg-green-600 text-white' :
                      server.status === 'starting' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {server.status.toUpperCase()}
                    </span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
                      Manage
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