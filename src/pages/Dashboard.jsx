import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import TicketCard from '../pages/TicketCard'

const Dashboard = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTickets(res.data.tickets)
    } catch (err) {
      setError('Error al cargar tickets')
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  // Estado de Carga
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <div className="text-xl font-semibold text-[#7B0000] animate-pulse">
          Cargando tickets...
        </div>
      </div>
    )
  }

  // Estado de Error
  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md max-w-md w-full">
          <p className="text-red-700 font-medium text-center">{error}</p>
          <button 
            onClick={fetchTickets}
            className="mt-4 w-full bg-[#7B0000] text-white py-2 rounded hover:bg-red-900 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans">
      {/* Navbar con colores de la Granja */}
      <nav className="bg-[#7B0000] shadow-md border-b-4 border-[#F3B204] p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#F3B204] tracking-wide uppercase">
              Dashboard POS
            </h1>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/scanner')}
              className="bg-[#F3B204] text-[#7B0000] font-bold px-5 py-2 rounded shadow hover:bg-yellow-400 transition-colors flex items-center gap-2"
            >
              <span>Escanear</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="border border-[#F3B204] text-[#F3B204] font-semibold px-4 py-2 rounded hover:bg-[#F3B204] hover:text-[#7B0000] transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-end mb-6 border-b border-gray-300 pb-3">
          <h2 className="text-3xl font-bold text-[#7B0000]">
            Tickets Recientes
          </h2>
          <span className="text-gray-500 font-medium">
            Total: {tickets.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>

        {/* Estado Vacío */}
        {tickets.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border-2 border-dashed border-[#F3B204] mt-4">
            <p className="text-gray-500 text-lg font-medium">
              No hay tickets registrados en el sistema.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard