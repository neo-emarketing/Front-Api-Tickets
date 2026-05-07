const TicketCard = ({ ticket }) => {
  // Colores mejorados con bordes para los estados
  const statusStyles = {
    active: 'bg-green-100 text-green-800 border-green-200',
    scanned: 'bg-gray-100 text-gray-600 border-gray-300',
    expired: 'bg-orange-100 text-orange-800 border-orange-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  }

  // Traducción visual para que la interfaz se vea más profesional en español
  const statusLabels = {
    active: 'Válido',
    scanned: 'Escaneado',
    expired: 'Expirado',
    cancelled: 'Cancelado'
  }

  const currentStyle = statusStyles[ticket.status] || 'bg-gray-100 text-gray-800 border-gray-200'
  const currentLabel = statusLabels[ticket.status] || ticket.status

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-[#7B0000] overflow-hidden flex flex-col">
      
      {/* Cabecera de la tarjeta (Código y Estado) */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#fffcf5]">
        <h3 className="font-black text-xl text-[#7B0000] tracking-wider">
          #{ticket.short_code}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${currentStyle}`}>
          {currentLabel}
        </span>
      </div>

      {/* Cuerpo de la tarjeta (Datos del cliente y PAX) */}
      <div className="p-4 flex-grow flex flex-col justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-800">{ticket.nombre_cliente}</p>
          <p className="text-xs text-gray-500 truncate" title={ticket.email_cliente}>
            {ticket.email_cliente}
          </p>
        </div>

        {/* Destacamos el número de personas (PAX) con el color dorado */}
        <div className="flex items-center">
          <div className="bg-[#F3B204] bg-opacity-20 border border-[#F3B204] px-3 py-1 rounded text-[#7B0000] font-bold text-sm flex items-center gap-2">
            <span>PAX:</span>
            <span className="text-lg leading-none">{ticket.pax}</span>
          </div>
        </div>
      </div>

      {/* Pie de la tarjeta (Fecha de escaneo) */}
      {ticket.scanned_at && (
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
          <span className="font-medium">Escaneado:</span>
          <span>{new Date(ticket.scanned_at).toLocaleString('es-MX')}</span>
        </div>
      )}
      
    </div>
  )
}

export default TicketCard