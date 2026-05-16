import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'

import Logo from '../pages/assets/unnamed.png'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  // Sanitización básica
  const sanitizeInput = (value) => {
    return value.replace(/['";]/g, '').trim()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) return

    const cleanUsername = sanitizeInput(username)
    const cleanPassword = sanitizeInput(password)

    if (!cleanUsername || !cleanPassword) {
      return Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Ingresa usuario y contraseña'
      })
    }

    setLoading(true)

    try {
      const res = await axios.post(
        '/api/auth/login',
        {
          username: cleanUsername,
          password: cleanPassword
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )

      localStorage.setItem('token', res.data.token)
      localStorage.setItem(
        'user',
        JSON.stringify(res.data.usuario)
      )

      await Swal.fire({
        icon: 'success',
        title: 'Bienvenido',
        text: 'Inicio de sesión exitoso',
        timer: 1400,
        showConfirmButton: false
      })

      navigate('/dashboard')
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          err.response?.data?.message ||
          'Credenciales incorrectas'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#ffffff] px-8 py-8 flex flex-col items-center">

          <div className="bg-white rounded-full p-3 shadow-md mb-4">
            <img
              src={Logo}
              alt="Logo"
              className="h-16 object-contain"
            />
          </div>

          <h1 className="text-white text-2xl font-bold">
            Sistema POS
          </h1>

          <p className="text-black  text-sm mt-1">
            Acceso al sistema
          </p>
        </div>

        {/* Form */}
        <div className="p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            autoComplete="off"
          >

            {/* Usuario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuario
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Ingresa tu usuario"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F3B204] focus:border-transparent transition"
                required
                autoFocus
                maxLength={30}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F3B204] focus:border-transparent transition"
                required
                maxLength={50}
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7B0000] hover:bg-[#650000] text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60"
            >
              {loading
                ? 'Iniciando sesión...'
                : 'Entrar'}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Granja las Américas
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login