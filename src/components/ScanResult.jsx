const ScanResult = ({ result }) => {
  const { resultado, message, ticket } = result

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-600',
      text: 'text-green-800',
      label: 'ACCESO PERMITIDO'
    },
    already_used: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-600',
      text: 'text-yellow-800',
      label: 'TICKET YA UTILIZADO'
    },
    invalid: {
      bg: 'bg-red-50',
      border: 'border-red-600',
      text: 'text-red-800',
      label: 'TICKET INVÁLIDO'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-600',
      text: 'text-red-800',
      label: 'ERROR'
    }
  }

  const style = styles[resultado] || styles.error

  return (
    <div className={`mt-4 p-5 border-l-4 rounded-lg animate-fade-in ${style.bg} ${style.border}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold" style={{ fontSize: '2rem' }}>
            {resultado === 'success' ? '✓' : resultado === 'already_used' ? '⚠' : '✗'}
          </span>
          <h2 className={`text-2xl font-extrabold tracking-wide ${style.text}`}>
            {style.label}
          </h2>
        </div>
        
        <p className="text-base text-gray-700 font-medium">{message}</p>
        
        {ticket && (
          <div className="mt-2 p-4 bg-white rounded-md shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 gap-2 text-lg">
              <div>
                <span className="text-gray-500 text-sm">CLIENTE</span>
                <p className="text-2xl font-bold text-gray-900">{ticket.nombre_cliente}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <span className="text-gray-500 text-sm">PERSONAS (PAX)</span>
                  <p className="text-3xl font-extrabold text-[#7B0000]">{ticket.pax}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">TICKET</span>
                  <p className="text-xl font-mono font-bold text-gray-800">{ticket.short_code}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScanResult