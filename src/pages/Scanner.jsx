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

  const [showCamera, setShowCamera] =
    useState(false)

  const [cameraError, setCameraError] =
    useState('')

  const [scannedData, setScannedData] =
    useState('')

  const [cameraStatus, setCameraStatus] =
    useState('')

  const [cancelling, setCancelling] =
    useState(false)

  const [cancelMsg, setCancelMsg] =
    useState('')

  const html5QrCodeRef = useRef(null)

  const navigate = useNavigate()

  const user = JSON.parse(
    localStorage.getItem('user') || 'null'
  )

  const staffId = user?.id

  // Sanitizar
  const sanitizeInput = (value) => {
    return value.replace(/['";]/g, '').trim()
  }

  useEffect(() => {
    return () => {
      if (
        html5QrCodeRef.current &&
        html5QrCodeRef.current.isScanning
      ) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})

        html5QrCodeRef.current.clear()
      }
    }
  }, [])

  // Cámara
  const startCamera = () => {
    setCameraError('')
    setCameraStatus(
      'Iniciando cámara...'
    )

    const readerElement =
      document.getElementById('reader')

    if (!readerElement) {
      setCameraError(
        'No se encontró el lector'
      )

      return
    }

    html5QrCodeRef.current =
      new Html5Qrcode('reader')

    const config = {
      fps: 10,
      qrbox: {
        width: 260,
        height: 260
      },
      aspectRatio: 1
    }

    html5QrCodeRef.current
      .start(
        { facingMode: 'environment' },
        config,
        onScanSuccess,
        onScanFailure
      )
      .then(() => {
        setCameraStatus(
          'Cámara activa - Esperando QR'
        )
      })
      .catch((err) => {
        console.error(err)

        setCameraError(
          'No se pudo acceder a la cámara'
        )

        setShowCamera(false)
      })
  }

  const stopCamera = async () => {
    if (
      html5QrCodeRef.current &&
      html5QrCodeRef.current.isScanning
    ) {
      try {
        await html5QrCodeRef.current.stop()

        html5QrCodeRef.current.clear()
      } catch (err) {
        console.error(err)
      }
    }

    setCameraStatus('')
  }

  // Escaneo exitoso
  const onScanSuccess = async (
    decodedText
  ) => {
    if (loading || scannedData) return

    setScannedData(decodedText)

    setCameraStatus(
      'QR detectado. Procesando...'
    )

    await stopCamera()

    setShowCamera(false)

    let tokenExtraido =
      decodedText.trim()

    try {
      const parsed = JSON.parse(
        decodedText
      )

      if (parsed.token) {
        tokenExtraido = parsed.token
      }
    } catch (e) {}

    await validarToken(tokenExtraido)
  }

  const onScanFailure = () => {}

  // Reactivar
  const reactivarTicket = async (
    ticketToken
  ) => {
    setCancelling(true)

    try {
      const authToken =
        localStorage.getItem('token')

      const res = await axios.post(
        `/api/tickets/${ticketToken}/cancel-scan`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      )

      setCancelMsg(
        res.data.message
      )

      Swal.fire({
        icon: 'success',
        title: 'Ticket reactivado',
        text: res.data.message,
        confirmButtonColor:
          '#7B0000'
      })

    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Error al reactivar'

      setCancelMsg(msg)

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonColor:
          '#7B0000'
      })

    } finally {
      setCancelling(false)
    }
  }

  // Alertas
  const mostrarAlerta = (
    resultado
  ) => {
    const {
      resultado: res,
      message,
      ticket
    } = resultado

    let icon = 'info'
    let title = ''
    let html = ''

    if (res === 'success') {
      icon = 'success'

      title = 'Acceso Permitido'

      html = `
        <div style="font-family:sans-serif;">
          <p style="font-size:16px;margin-bottom:15px;">
            ${message}
          </p>

          ${
            ticket
              ? `
            <div style="
              background:#fff8e8;
              border:1px solid #F3B204;
              border-radius:14px;
              padding:18px;
            ">

              <p style="
                font-size:24px;
                font-weight:bold;
                margin:0;
                color:#7B0000;
              ">
                ${ticket.nombre_cliente}
              </p>

              <p style="
                margin-top:10px;
                font-size:18px;
              ">
                <strong>PAX:</strong>
                <span style="
                  color:#7B0000;
                  font-size:34px;
                  font-weight:bold;
                ">
                  ${ticket.pax}
                </span>
              </p>

              <p style="
                font-size:13px;
                color:gray;
                margin-top:10px;
              ">
                Ticket:
                ${ticket.short_code}
              </p>

            </div>
          `
              : ''
          }
        </div>
      `
    }

    else if (res === 'already_used') {
      icon = 'warning'

      title = 'Ticket Ya Utilizado'

      if (
        user?.rol === 'admin' ||
        user?.rol ===
          'supervisor'
      ) {
        html = `
          <p style="font-size:16px;">
            ${message}
          </p>

          <p style="
            font-size:14px;
            color:gray;
          ">
            ¿Deseas reactivar este ticket?
          </p>
        `
      } else {
        html = `
          <p style="font-size:16px;">
            ${message}
          </p>
        `
      }
    }

    // Reactivar
    if (
      res === 'already_used' &&
      ticket &&
      (
        user?.rol === 'admin' ||
        user?.rol ===
          'supervisor'
      )
    ) {
      Swal.fire({
        icon,
        title,
        html,
        showCancelButton: true,
        confirmButtonText:
          'Reactivar ticket',
        cancelButtonText:
          'Cancelar',
        confirmButtonColor:
          '#7B0000',
        cancelButtonColor:
          '#9ca3af'
      }).then((swalResult) => {
        if (
          swalResult.isConfirmed
        ) {
          const tokenToReactivate =
            ticket.short_code ||
            ticket.token

          reactivarTicket(
            tokenToReactivate
          )
        }
      })

    } else {
      Swal.fire({
        icon,
        title,
        html,
        confirmButtonColor:
          '#7B0000'
      })
    }
  }

  // Validar
  const validarToken = async (
    tokenToScan
  ) => {
    setLoading(true)

    setResult(null)

    try {
      const authToken =
        localStorage.getItem('token')

      const deviceId =
        'POS-TABLET-001'

      const res = await axios.post(
        '/api/tickets/scan',
        {
          token:
            sanitizeInput(
              tokenToScan
            ),
          staff_id: staffId,
          device_id: deviceId
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'x-device-id':
              deviceId
          },
          timeout: 10000
        }
      )

      setResult(res.data)

      mostrarAlerta(res.data)

    } catch (err) {
      const mensaje =
        err.response?.data
          ?.message ||
        'Error al validar ticket'

      const errorResult = {
        resultado: 'error',
        message: mensaje
      }

      setResult(errorResult)

      mostrarAlerta(errorResult)

    } finally {
      setLoading(false)

      setToken('')

      setTimeout(() => {
        setScannedData('')
      }, 5000)
    }
  }

  // Manual
  const handleManualSubmit = (
    e
  ) => {
    e.preventDefault()

    if (
      !token.trim() ||
      loading
    )
      return

    validarToken(token.trim())
  }

  // Toggle
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
    <div className="min-h-screen bg-[#f4f6f8] px-4 py-8">

      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-[#7B0000] rounded-3xl shadow-xl border-b-4 border-[#F3B204] p-8 mb-8">

          <div className="flex justify-between items-center">

            <div>
              <h1 className="text-3xl font-bold text-[#F3B204]">
                Validar Accesos
              </h1>

              <p className="text-red-100 mt-2">
                Escaneo y validación de tickets
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  '/dashboard'
                )
              }
              className="bg-white text-[#7B0000] hover:bg-gray-100 px-5 py-3 rounded-xl font-semibold transition"
            >
              Volver
            </button>

          </div>

        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border-t-4 border-[#F3B204] overflow-hidden">

          <div className="p-8">

            {/* Form */}
            <form
              onSubmit={
                handleManualSubmit
              }
              className="space-y-5 mb-8"
            >

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código del Ticket
                </label>

                <input
                  type="text"
                  value={token}
                  onChange={(e) =>
                    setToken(
                      e.target.value
                    )
                  }
                  placeholder="Escribe o pega el código"
                  disabled={loading}
                  autoFocus
                  className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F3B204]"
                />

              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !token.trim()
                }
                className="w-full bg-[#7B0000] hover:bg-[#650000] text-white font-bold py-4 rounded-2xl transition disabled:opacity-50"
              >
                {loading
                  ? 'Procesando...'
                  : 'Validar Ticket'}
              </button>

            </form>

            {/* Loading */}
            {loading && (
              <div className="bg-[#fff8e8] border border-[#F3B204] rounded-2xl p-4 mb-6">

                <div className="flex items-center justify-center gap-3">

                  <div className="w-5 h-5 border-2 border-[#7B0000] border-t-transparent rounded-full animate-spin"></div>

                  <p className="font-medium text-[#7B0000]">
                    Procesando ticket...
                  </p>

                </div>

              </div>
            )}

            {/* Escaneado */}
            {scannedData &&
              !loading && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">

                  <p className="text-sm text-gray-600 break-all">

                    <span className="font-bold text-[#7B0000]">
                      QR detectado:
                    </span>{' '}

                    {scannedData}

                  </p>

                </div>
              )}

            {/* Divider */}
            <div className="relative flex items-center py-5">

              <div className="flex-grow border-t border-gray-200"></div>

              <span className="mx-4 text-gray-400 text-sm font-medium">
                O escanea un QR
              </span>

              <div className="flex-grow border-t border-gray-200"></div>

            </div>

            {/* Camera */}
            {!showCamera ? (
              <button
                onClick={toggleCamera}
                className="w-full bg-[#F3B204] hover:bg-yellow-400 text-[#7B0000] font-bold py-4 rounded-2xl transition shadow"
              >
                Activar Cámara QR
              </button>
            ) : (
              <div className="bg-[#fffcf5] border-2 border-dashed border-[#F3B204] rounded-3xl p-5">

                <div className="flex justify-between items-center mb-5">

                  <div>

                    <p className="font-bold text-[#7B0000]">
                      Cámara activa
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Escanea el código QR del ticket
                    </p>

                  </div>

                  <button
                    onClick={
                      toggleCamera
                    }
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-medium transition"
                  >
                    Cerrar
                  </button>

                </div>

                {cameraError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-5 text-sm">
                    {cameraError}
                  </div>
                )}

                {cameraStatus &&
                  !cameraError && (
                    <div className="bg-white border border-[#F3B204] rounded-2xl p-4 mb-5 text-sm font-medium text-[#7B0000]">
                      {
                        cameraStatus
                      }
                    </div>
                  )}

                <div
                  id="reader"
                  className="rounded-2xl overflow-hidden shadow-inner bg-black"
                ></div>

              </div>
            )}

            {/* Resultado */}
            {cancelMsg && (
              <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 text-sm">

                {cancelMsg}

              </div>
            )}

          </div>
        </div>

       
        <div className="mt-6">
          {result && (
            <ScanResult
              result={result}
            />
          )}
        </div>

      </div>
    </div>
  )
}

export default Scanner