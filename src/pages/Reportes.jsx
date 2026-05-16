import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'

const Reportes = () => {
  const navigate = useNavigate()

  const [tab, setTab] = useState('escaneos')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])

  const [paginacion, setPaginacion] = useState({
    total: 0,
    pagina: 1,
    total_paginas: 1
  })

  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    nombre_staff: ''
  })

  const today = new Date()
    .toISOString()
    .split('T')[0]

  // Sanitizar input
  const sanitizeInput = (value) => {
    return value.replace(/['";]/g, '').trim()
  }

  const fetchData = async (pagina = 1) => {
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        navigate('/login')
        return
      }

      const endpoint =
        tab === 'escaneos'
          ? '/api/reportes/escaneos'
          : '/api/reportes/no-escaneados'

      const params = {
        pagina,
        por_pagina: 20,
        ...(filtros.fecha_inicio && {
          fecha_inicio: filtros.fecha_inicio
        }),
        ...(filtros.fecha_fin && {
          fecha_fin: filtros.fecha_fin
        }),
        ...(filtros.nombre_staff && {
          nombre_staff: sanitizeInput(
            filtros.nombre_staff
          )
        })
      }

      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params,
        timeout: 10000
      })

      const key =
        tab === 'escaneos'
          ? 'escaneos'
          : 'tickets'

      setData(res.data[key] || [])
      setPaginacion(res.data.paginacion)

    } catch (err) {
      console.error(err)

      if (err.response?.status === 401) {
        localStorage.removeItem('token')

        Swal.fire({
          icon: 'warning',
          title: 'Sesión expirada',
          text: 'Vuelve a iniciar sesión',
          timer: 1800,
          showConfirmButton: false
        })

        navigate('/login')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el reporte'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1)
  }, [tab])

  const handleFiltroChange = (e) => {
    setFiltros((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchData(1)
  }

  // Exportar
  const handleExportar = async () => {
    if (data.length === 0) {
      return Swal.fire({
        icon: 'info',
        title: 'Sin datos',
        text:
          'No hay resultados para exportar'
      })
    }

    try {
      const token = localStorage.getItem('token')

      const params = {
        tipo:
          tab === 'escaneos'
            ? 'escaneos'
            : 'no-escaneados',

        ...(filtros.fecha_inicio && {
          fecha_inicio: filtros.fecha_inicio
        }),

        ...(filtros.fecha_fin && {
          fecha_fin: filtros.fecha_fin
        }),

        ...(filtros.nombre_staff && {
          nombre_staff: filtros.nombre_staff
        })
      }

      const response = await axios.get(
        '/api/reportes/exportar',
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params,
          responseType: 'blob'
        }
      )

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      )

      const link =
        document.createElement('a')

      link.href = url

      link.setAttribute(
        'download',
        `reporte_${tab}_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`
      )

      document.body.appendChild(link)

      link.click()

      link.remove()

      Swal.fire({
        icon: 'success',
        title: 'Exportado',
        text:
          'El reporte fue descargado correctamente',
        timer: 1600,
        showConfirmButton: false
      })

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          'No se pudo exportar el reporte'
      })
    }
  }

  // Logout
  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Cerrar sesión',
      text:
        '¿Deseas salir del sistema?',
      showCancelButton: true,
      confirmButtonColor: '#7B0000',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Salir',
      cancelButtonText: 'Cancelar'
    })

    if (!result.isConfirmed) return

    localStorage.removeItem('token')

    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8]">

      {/* Navbar */}
      <nav className="bg-[#7B0000] border-b-4 border-[#F3B204] shadow-lg">

        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold text-[#F3B204]">
              Reportes
            </h1>

            <p className="text-red-100 mt-1">
              Control y monitoreo de tickets
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                navigate('/dashboard')
              }
              className="bg-[#F3B204] hover:bg-yellow-400 text-[#7B0000] font-bold px-5 py-2.5 rounded-xl transition shadow"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="bg-white text-[#7B0000] hover:bg-gray-100 font-semibold px-5 py-2.5 rounded-xl transition"
            >
              Salir
            </button>

          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-3 mb-8">

          <button
            onClick={() =>
              setTab('escaneos')
            }
            className={`px-6 py-3 rounded-2xl font-bold transition shadow-sm ${
              tab === 'escaneos'
                ? 'bg-[#7B0000] text-[#F3B204]'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Escaneados
          </button>

          <button
            onClick={() =>
              setTab('no-escaneados')
            }
            className={`px-6 py-3 rounded-2xl font-bold transition shadow-sm ${
              tab === 'no-escaneados'
                ? 'bg-[#7B0000] text-[#F3B204]'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Sin escanear
          </button>

        </div>

        {/* Filtros */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg border-t-4 border-[#F3B204] p-6 mb-8"
        >

          <div className="mb-5">

            <h2 className="text-xl font-bold text-[#7B0000]">
              Filtros
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Filtra resultados por fechas y personal
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha inicio
              </label>

              <input
                type="date"
                name="fecha_inicio"
                value={filtros.fecha_inicio}
                onChange={handleFiltroChange}
                max={today}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F3B204]"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha fin
              </label>

              <input
                type="date"
                name="fecha_fin"
                value={filtros.fecha_fin}
                onChange={handleFiltroChange}
                max={today}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F3B204]"
              />

            </div>

            {tab === 'escaneos' && (
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empleado
                </label>

                <input
                  type="text"
                  name="nombre_staff"
                  value={filtros.nombre_staff}
                  onChange={handleFiltroChange}
                  placeholder="Ej: Juan Pérez"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F3B204]"
                />

              </div>
            )}

            <div className="flex items-end gap-3">

              <button
                type="submit"
                className="bg-[#7B0000] hover:bg-[#650000] text-white font-semibold px-6 py-3 rounded-xl transition"
              >
                Filtrar
              </button>

              <button
                type="button"
                onClick={handleExportar}
                className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-3 rounded-xl transition"
              >
                Exportar
              </button>

            </div>

          </div>
        </form>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">

            <div className="flex justify-center items-center gap-3">

              <div className="w-5 h-5 border-2 border-[#7B0000] border-t-transparent rounded-full animate-spin"></div>

              <p className="text-[#7B0000] font-semibold">
                Cargando reporte...
              </p>

            </div>

          </div>
        ) : (
          <>
            {/* Tabla */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

              <div className="overflow-x-auto">

                <table className="min-w-full">

                  <thead className="bg-[#7B0000] text-white">

                    <tr>

                      <th className="px-6 py-4 text-left text-sm font-bold text-[#F3B204]">
                        Ticket
                      </th>

                      {tab === 'escaneos' ? (
                        <>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#F3B204]">
                            Cliente
                          </th>

                          <th className="px-6 py-4 text-left text-sm font-bold text-[#F3B204]">
                            PAX
                          </th>

                          <th className="px-6 py-4 text-left text-sm font-bold text-[#F3B204]">
                            Escaneado por
                          </th>

                          <th className="px-6 py-4 text-left text-sm font-bold text-[#F3B204]">
                            Fecha
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-4 text-left text-sm font-bold text-[#F3B204]">
                            Orden
                          </th>

                          <th className="px-6 py-4 text-left text-sm font-bold text-[#F3B204]">
                            Cliente
                          </th>

                          <th className="px-6 py-4 text-left text-sm font-bold text-[#F3B204]">
                            Email
                          </th>

                          <th className="px-6 py-4 text-left text-sm font-bold text-[#F3B204]">
                            PAX
                          </th>

                          <th className="px-6 py-4 text-left text-sm font-bold text-[#F3B204]">
                            Creado
                          </th>
                        </>
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {data.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-[#fff9eb] transition"
                      >

                        <td className="px-6 py-4 text-sm font-mono text-[#7B0000] font-semibold">
                          {item.short_code}
                        </td>

                        {tab === 'escaneos' ? (
                          <>
                            <td className="px-6 py-4 text-sm">
                              {item.nombre_cliente}
                            </td>

                            <td className="px-6 py-4 text-sm">
                              {item.pax}
                            </td>

                            <td className="px-6 py-4 text-sm">
                              {
                                item.scanned_by_nombre
                              }
                            </td>

                            <td className="px-6 py-4 text-sm">
                              {new Date(
                                item.scanned_at
                              ).toLocaleString(
                                'es-MX'
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 text-sm">
                              {item.order_id}
                            </td>

                            <td className="px-6 py-4 text-sm">
                              {item.nombre_cliente}
                            </td>

                            <td className="px-6 py-4 text-sm">
                              {
                                item.email_cliente
                              }
                            </td>

                            <td className="px-6 py-4 text-sm">
                              {item.pax}
                            </td>

                            <td className="px-6 py-4 text-sm">
                              {new Date(
                                item.created_at
                              ).toLocaleString(
                                'es-MX'
                              )}
                            </td>
                          </>
                        )}

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            </div>

            {/* Paginación */}
            {paginacion.total_paginas > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">

                <button
                  disabled={
                    paginacion.pagina <= 1
                  }
                  onClick={() =>
                    fetchData(
                      paginacion.pagina - 1
                    )
                  }
                  className="bg-white border border-gray-300 hover:bg-gray-100 px-5 py-2 rounded-xl disabled:opacity-50 transition"
                >
                  Anterior
                </button>

                <div className="bg-[#7B0000] text-white px-6 py-2 rounded-xl shadow">

                  Página {paginacion.pagina} de{' '}
                  {paginacion.total_paginas}

                </div>

                <button
                  disabled={
                    paginacion.pagina >=
                    paginacion.total_paginas
                  }
                  onClick={() =>
                    fetchData(
                      paginacion.pagina + 1
                    )
                  }
                  className="bg-white border border-gray-300 hover:bg-gray-100 px-5 py-2 rounded-xl disabled:opacity-50 transition"
                >
                  Siguiente
                </button>

              </div>
            )}

            {/* Sin resultados */}
            {data.length === 0 && (
              <div className="bg-white rounded-3xl shadow-lg text-center py-16 mt-8">

                <h3 className="text-xl font-semibold text-gray-700">
                  Sin resultados
                </h3>

                <p className="text-gray-500 mt-2">
                  No se encontraron registros con los filtros seleccionados.
                </p>

              </div>
            )}
          </>
        )}

      </main>
    </div>
  )
}

export default Reportes