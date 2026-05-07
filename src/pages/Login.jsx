import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { username, password })
      localStorage.setItem('token', res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Error de conexión. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#7B0000]">
        
        {/* Logo de la Granja */}
        <div className="flex justify-center mb-6">
          <img 
            src="https://granjalasamericas.com/wp-content/uploads/2021/10/logo-granja-las-americas.png" 
            alt="Granja las Américas" 
            className="h-24 object-contain"
          />
        </div>
        
        <h2 className="text-lg font-bold text-center text-gray-700 mb-6 uppercase tracking-wider">
          Acceso al Sistema POS
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#F3B204] focus:border-transparent transition-all"
              placeholder="Ingresa tu usuario"
              required
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#F3B204] focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7B0000] text-white font-bold py-3 px-4 rounded-lg hover:bg-red-900 disabled:opacity-50 transition-colors shadow-sm mt-4"
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>

        {/* Footer sutil */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Granja las Américas. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login