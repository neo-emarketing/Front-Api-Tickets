import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import { Html5Qrcode } from 'html5-qrcode'
import ScanResult from '../components/ScanResult'

const Scanner = () => {
  const [token, setToken] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [scannedData, setScannedData] = useState('')
  const [cameraStatus, setCameraStatus] = useState('')
  const html5QrCodeRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {})
        html5QrCodeRef.current.clear()
      }
    }
  }, [])

  const startCamera = () => {
    setCameraError('')
    setCameraStatus('Iniciando cámara...')
    const readerElement = document.getElementById('reader')
    if (!readerElement) {
      setCameraError('No se encontró el elemento para la cámara.')
      setShowCamera(false)
      return
    }

    html5QrCodeRef.current = new Html5Qrcode('reader')
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    }

    html5QrCodeRef.current
      .start(
        { facingMode: 'environment' },
        config,
        onScanSuccess,
        onScanFailure
      )
      .then(() => {
        setCameraStatus('Cámara activa - Esperando QR...')
      })
      .catch((err) => {
        console.error('Error al iniciar la cámara:', err)
        setCameraError('No se pudo acceder a la cámara. Verifica permisos o usa el ingreso manual.')
        setShowCamera(false)
        setCameraStatus('')
      })
  }

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch (err) {
        console.error('Error deteniendo cámara:', err)
      }
    }
    setCameraStatus('')
  }

  const onScanSuccess = async (decodedText) => {
    if (loading || scannedData) return
    console.log('QR detectado:', decodedText)
    setScannedData(decodedText)
    setCameraStatus('QR detectado. Procesando...')
    await stopCamera()
    setShowCamera(false)

    let tokenExtraido = decodedText.trim()
    try {
      const parsed = JSON.parse(decodedText)
      if (parsed.token) {
        tokenExtraido = parsed.token
      }
    } catch (e) {
      // No es JSON
    }

    await validarToken(tokenExtraido)
  }

  const onScanFailure = (error) => {}

  const mostrarAlerta = (resultado) => {
    const { resultado: res, message, ticket } = resultado
    let icon = 'info'
    let title = ''
    let html = ''

    if (res === 'success') {
      icon = 'success'
      title = 'Acceso Permitido'
      html = `
        <div style="font-family: sans-serif;">
          <p style="font-size:16px; margin-bottom:10px;">${message}</p>
          ${ticket ? `
            <div style="background:#f9f9f9; padding:10px; border-radius:8px;">
              <p style="font-size:24px; font-weight:bold; margin:0;">${ticket.nombre_cliente}</p>
              <p style="font-size:18px; margin:5px 0;"><strong>PAX:</strong> <span style="font-size:32px; color:#7B0000;">${ticket.pax}</span></p>
              <p style="font-size:14px; color:gray;">Ticket: ${ticket.short_code}</p>
            </div>
          ` : ''}
        </div>
      `
    } else if (res === 'already_used') {
      icon = 'warning'
      title = 'Ticket Ya Utilizado'
      html = `<p style="font-size:16px;">${message}</p>`
    } else {
      icon = 'error'
      title = 'Error'
      html = `<p style="font-size:16px;">${message}</p>`
    }

    Swal.fire({
      icon,
      title,
      html,
      confirmButtonColor: '#7B0000',
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: 'rounded-lg',
        title: 'text-2xl font-bold',
        htmlContainer: 'text-base'
      }
    })
  }

  const validarToken = async (tokenToScan) => {
    setLoading(true)
    setResult(null)
    try {
      const authToken = localStorage.getItem('token')
      const deviceId = 'POS-TABLET-001'

      const res = await axios.post('/api/tickets/scan', {
        token: tokenToScan,
        staff_id: 1,
        device_id: deviceId
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'x-device-id': deviceId
        }
      })

      setResult(res.data)
      mostrarAlerta(res.data)
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error de conexión al validar'
      const errorResult = { resultado: 'error', message: mensaje }
      setResult(errorResult)
      mostrarAlerta(errorResult)
    } finally {
      setLoading(false)
      setToken('')
      setTimeout(() => setScannedData(''), 5000)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!token.trim() || loading) return
    validarToken(token.trim())
  }

  const toggleCamera = () => {
    if (showCamera) {
      stopCamera()
      setShowCamera(false)
    } else {
      setShowCamera(true)
      setScannedData('')
      setResult(null)
    }
  }

  useEffect(() => {
    if (showCamera) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [showCamera])

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans flex flex-col items-center pt-8 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-[#7B0000]">
        <div className="p-5 border-b border-gray-100 bg-[#fffcf5] flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#7B0000] uppercase tracking-wide">
            Validar Accesos
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-semibold text-[#7B0000] hover:text-[#F3B204] transition-colors flex items-center gap-1"
          >
            &larr; Volver
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleManualSubmit} className="space-y-5 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Código del Ticket
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#F3B204] focus:border-transparent transition-all"
                placeholder="Pega o escribe el código aquí"
                disabled={loading}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full bg-[#7B0000] text-white font-bold py-3 px-4 rounded-lg hover:bg-red-900 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? 'Procesando...' : 'Validar Ticket'}
            </button>
          </form>

          {loading && (
            <div className="text-center py-2 text-[#7B0000] font-medium animate-pulse">
              Procesando ticket...
            </div>
          )}
          
          {scannedData && !loading && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm break-all text-gray-700">
              <span className="font-bold text-[#7B0000]">Datos escaneados:</span> {scannedData}
            </div>
          )}

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">O escanea un QR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="mt-2">
            {!showCamera && (
              <button
                onClick={toggleCamera}
                className="w-full bg-[#F3B204] text-[#7B0000] font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 transition-colors shadow-sm flex justify-center items-center gap-2"
              >
                Activar Lector de QR
              </button>
            )}

            {showCamera && (
              <div className="mt-4 bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-600 animate-pulse">Cámara Activa...</span>
                  <button
                    onClick={toggleCamera}
                    className="text-xs border border-red-500 text-red-600 hover:bg-red-50 py-1 px-3 rounded transition-colors"
                  >
                    Cerrar Lector
                  </button>
                </div>

                {cameraError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">
                    {cameraError}
                  </div>
                )}
                
                {cameraStatus && !cameraError && (
                  <div className="bg-[#fffcf5] text-[#7B0000] p-3 rounded-lg mb-4 text-sm border border-[#F3B204] font-medium">
                    {cameraStatus}
                  </div>
                )}

                <div id="reader" className="w-full rounded overflow-hidden shadow-inner bg-black"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg mt-4 mb-8">
        {result && <ScanResult result={result} />}
      </div>
    </div>
  )
}

export default Scanner