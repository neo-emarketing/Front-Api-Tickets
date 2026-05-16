import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import TicketCard from "../pages/TicketCard";

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("/api/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        Swal.fire({
          icon: "warning",
          title: "Sesión expirada",
          text: "Vuelve a iniciar sesión",
          timer: 1800,
          showConfirmButton: false,
        });

        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los tickets",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Deseas salir del sistema?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#7B0000",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">

        <div className="bg-white px-8 py-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">

            <div className="w-5 h-5 border-2 border-[#7B0000] border-t-transparent rounded-full animate-spin"></div>

            <p className="text-[#7B0000] font-semibold">
              Cargando tickets...
            </p>

          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8]">

      {/* Navbar */}
     <nav className="bg-[#7B0000] shadow-lg border-b-4 border-[#F3B204]">

  <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

    {/* Left */}
    <div>
      <h1 className="text-3xl font-bold text-[#F3B204] tracking-wide">
        Dashboard POS
      </h1>

      <p className="text-red-100 text-sm mt-1">
        Bienvenido {user?.nombre || user?.username}
      </p>
    </div>

    {/* Actions */}
    <div className="flex flex-wrap gap-3">

      <button
        onClick={() => navigate("/scanner")}
        className="bg-[#F3B204] hover:bg-yellow-400 text-[#7B0000] px-5 py-2.5 rounded-xl font-bold transition shadow"
      >
        Escanear
      </button>

      {(user?.rol === "admin" ||
        user?.rol === "supervisor") && (
        <button
          onClick={() => navigate("/reportes")}
          className="bg-white/10 backdrop-blur border border-[#F3B204] text-[#F3B204] px-5 py-2.5 rounded-xl font-medium hover:bg-[#F3B204] hover:text-[#7B0000] transition"
        >
          Reportes
        </button>
      )}

      {user?.rol === "admin" && (
        <button
          onClick={() => navigate("/staff")}
          className="bg-white/10 backdrop-blur border border-[#F3B204] text-[#F3B204] px-5 py-2.5 rounded-xl font-medium hover:bg-[#F3B204] hover:text-[#7B0000] transition"
        >
          Staff
        </button>
      )}

      <button
        onClick={handleLogout}
        className="bg-white text-[#7B0000] px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition"
      >
        Salir
      </button>

    </div>
  </div>
</nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

  <div>
    <h2 className="text-3xl font-bold text-[#7B0000]">
      Tickets recientes
    </h2>

    <p className="text-gray-600 mt-1">
      Gestión y monitoreo de tickets
    </p>
  </div>

  <div className="bg-gradient-to-r from-[#7B0000] to-[#9b1111] text-white px-6 py-4 rounded-2xl shadow-lg">
    <span className="text-sm text-red-100">
      Total tickets
    </span>

    <p className="text-3xl font-bold">
      {tickets.length}
    </p>
  </div>

</div>

        {/* Grid */}
        {tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
              />
            ))}

          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 py-20 px-6 text-center">

            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay tickets registrados
            </h3>

            <p className="text-gray-500">
              Los tickets aparecerán aquí cuando se registren.
            </p>

          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;