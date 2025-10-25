'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function ServerDetailsPage() {
  const [server, setServer] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const serverId = params.id

  useEffect(() => {
    checkUserAndFetchServer()
  }, [])

  const checkUserAndFetchServer = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }
    
    setUser(user)
    await fetchServer(user.id)
  }

  const fetchServer = async (userId) => {
    const { data, error } = await supabase
      .from('servers')
      .select('*')
      .eq('id', serverId)
      .eq('user_id', userId)
      .single()
    
    if (data) {
      setServer(data)
    } else {
      router.push('/servers')
    }
    setLoading(false)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!server) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Server not found</div>
      </div>
    )
  }

  // Windows batch script
  const windowsScript = `@echo off
echo ========================================
echo ${server.name} - Minecraft Server
echo ========================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed!
    echo Please install Java 17 or higher from https://adoptium.net/
    pause
    exit /b 1
)

echo Downloading server files...
curl -o server.jar https://api.papermc.io/v2/projects/paper/versions/${server.version === 'latest' ? '1.20.1' : server.version}/builds/latest/downloads/paper-${server.version === 'latest' ? '1.20.1' : server.version}-latest.jar

echo.
echo Creating eula.txt...
echo eula=true > eula.txt

echo.
echo Starting Minecraft server with ${server.ram}MB RAM...
java -Xmx${server.ram}M -Xms${server.ram}M -jar server.jar nogui

pause`

  // Linux/Mac bash script
  const linuxScript = `#!/bin/bash
echo "========================================"
echo "${server.name} - Minecraft Server"
echo "========================================"
echo

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed!"
    echo "Please install Java 17 or higher"
    exit 1
fi

echo "Downloading server files..."
curl -o server.jar https://api.papermc.io/v2/projects/paper/versions/${server.version === 'latest' ? '1.20.1' : server.version}/builds/latest/downloads/paper-${server.version === 'latest' ? '1.20.1' : server.version}-latest.jar

echo
echo "Creating eula.txt..."
echo "eula=true" > eula.txt

echo
echo "Starting Minecraft server with ${server.ram}MB RAM..."
java -Xmx${server.ram}M -Xms${server.ram}M -jar server.jar nogui`

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-black">
      {/* Header */}
      <nav className="bg-gray-800 border-b border-green-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🎮 Minecraft Host</h1>
          <Link 
            href="/servers"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
          >
            ← Back to Servers
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Server Info */}
        <div className="bg-gray-800 rounded-lg border border-green-600 p-6 mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">{server.name}</h2>
          <div className="flex gap-4 text-gray-400">
            <span>Version: {server.version}</span>
            <span>RAM: {server.ram}MB</span>
            <span className={`font-semibold ${
              server.status === 'running' ? 'text-green-500' :
              server.status === 'queued' ? 'text-yellow-500' :
              'text-gray-500'
            }`}>
              Status: {server.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-gray-800 rounded-lg border border-green-600 p-6 mb-6">
          <h3 className="text-2xl font-bold text-white mb-4">📋 How to Run Your Server</h3>
          
          <div className="space-y-4 text-gray-300">
            <div className="bg-blue-900 border border-blue-600 rounded p-4">
              <p className="font-semibold text-blue-200">ℹ️ Important:</p>
              <p className="text-sm">Your server runs on YOUR computer. This website helps you set it up and makes it accessible to others online.</p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-white mb-2">Step 1: Install Java</h4>
              <p>Download and install Java 17 or higher:</p>
              <a 
                href="https://adoptium.net/temurin/releases/" 
                target="_blank"
                className="text-green-400 hover:text-green-300 underline"
              >
                Download Java (Adoptium Temurin) →
              </a>
            </div>

            <div>
              <h4 className="text-xl font-bold text-white mb-2">Step 2: Download Setup Script</h4>
              <p className="mb-3">Choose your operating system:</p>
              
              {/* Windows Script */}
              <div className="mb-4">
                <div className="flex items-center justify-between bg-gray-700 p-3 rounded-t border border-gray-600">
                  <span className="font-semibold">🪟 Windows (start-server.bat)</span>
                  <button
                    onClick={() => copyToClipboard(windowsScript)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Copy Script
                  </button>
                </div>
                <pre className="bg-gray-900 p-4 rounded-b border border-gray-600 overflow-x-auto text-sm">
                  <code>{windowsScript}</code>
                </pre>
              </div>

              {/* Linux/Mac Script */}
              <div>
                <div className="flex items-center justify-between bg-gray-700 p-3 rounded-t border border-gray-600">
                  <span className="font-semibold">🐧 Linux/Mac (start-server.sh)</span>
                  <button
                    onClick={() => copyToClipboard(linuxScript)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Copy Script
                  </button>
                </div>
                <pre className="bg-gray-900 p-4 rounded-b border border-gray-600 overflow-x-auto text-sm">
                  <code>{linuxScript}</code>
                </pre>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-white mb-2">Step 3: Run the Script</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>Create a new folder for your server</li>
                <li>Save the script in that folder (start-server.bat for Windows or start-server.sh for Linux/Mac)</li>
                <li><strong>Windows:</strong> Double-click start-server.bat</li>
                <li><strong>Linux/Mac:</strong> Run <code className="bg-gray-700 px-2 py-1 rounded">chmod +x start-server.sh && ./start-server.sh</code></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold text-white mb-2">Step 4: Make it Public with playit.gg</h4>
              <ol className="list-decimal list-inside space-y-2">
                <li>Go to <a href="https://playit.gg" target="_blank" className="text-green-400 hover:text-green-300 underline">playit.gg</a></li>
                <li>Download and run the playit.gg program</li>
                <li>Create a tunnel for Minecraft (port 25565)</li>
                <li>Copy the public address (e.g., example.playit.gg:12345)</li>
                <li>Share this address with your friends!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gray-800 rounded-lg border border-yellow-600 p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">💡 Quick Tips</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Keep the script window open while playing - closing it stops the server</li>
            <li>First start takes longer (downloads server files)</li>
            <li>Your computer must stay on for others to play</li>
            <li>Free playit.gg has some limitations - consider premium for better performance</li>
            <li>Server files are saved in the same folder as the script</li>
          </ul>
        </div>
      </div>
    </div>
  )
}