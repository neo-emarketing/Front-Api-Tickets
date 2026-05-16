import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const StaffManagement = () => {
  const navigate = useNavigate();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Crear usuario
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    nombre: '',
  });

  // Editar usuario
  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    nombre: '',
    rol: 'scanner',
    activo: true,
  });

  // Sanitización básica
  const sanitizeInput = (value) => {
    return value.replace(/['";]/g, '').trim();
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const res = await axios.get('/api/auth/staff', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      setStaffList(res.data.staff || []);
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el personal',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Crear usuario
  const handleCreate = async (e) => {
    e.preventDefault();

    const cleanData = {
      nombre: sanitizeInput(createForm.nombre),
      username: sanitizeInput(createForm.username),
      password: sanitizeInput(createForm.password),
    };

    if (
      !cleanData.nombre ||
      !cleanData.username ||
      !cleanData.password
    ) {
      return Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Completa todos los campos',
      });
    }

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        '/api/auth/register-staff',
        cleanData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Usuario creado',
        text: 'El usuario fue registrado correctamente',
        timer: 1500,
        showConfirmButton: false,
      });

      setCreateForm({
        username: '',
        password: '',
        nombre: '',
      });

      fetchStaff();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          err.response?.data?.error ||
          'No se pudo crear el usuario',
      });
    }
  };

  // Iniciar edición
  const startEdit = (staff) => {
    setEditingId(staff.id);

    setEditForm({
      nombre: staff.nombre,
      rol: staff.rol,
      activo: !!staff.activo,
    });
  };

  // Guardar edición
  const handleEdit = async (id) => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `/api/auth/staff/${id}`,
        {
          ...editForm,
          nombre: sanitizeInput(editForm.nombre),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'Usuario actualizado correctamente',
        timer: 1400,
        showConfirmButton: false,
      });

      setEditingId(null);

      fetchStaff();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          err.response?.data?.error ||
          'No se pudo actualizar',
      });
    }
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Eliminar
  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Eliminar usuario',
      text: `¿Deseas eliminar a ${nombre}?`,
      showCancelButton: true,
      confirmButtonColor: '#7B0000',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(`/api/auth/staff/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'Usuario eliminado correctamente',
        timer: 1500,
        showConfirmButton: false,
      });

      fetchStaff();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          err.response?.data?.error ||
          'No se pudo eliminar',
      });
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">

        <div className="bg-white px-8 py-5 rounded-2xl shadow-lg flex items-center gap-3">

          <div className="w-5 h-5 border-2 border-[#7B0000] border-t-transparent rounded-full animate-spin"></div>

          <p className="font-medium text-[#7B0000]">
            Cargando personal...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] p-6">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
      <div className="bg-[#7B0000] rounded-3xl p-8 shadow-xl border-b-4 border-[#F3B204] mb-8">

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    <div>
      <h1 className="text-3xl font-bold text-[#F3B204]">
        Gestión de Personal
      </h1>

      <p className="text-red-100 mt-2">
        Administración de usuarios y permisos
      </p>
    </div>

    <button
      onClick={() => navigate('/dashboard')}
      className="bg-white text-[#7B0000] hover:bg-gray-100 px-5 py-3 rounded-xl font-semibold transition"
    >
      Volver al Dashboard
    </button>

  </div>

</div>

        {/* Crear usuario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">

          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[#7B0000]">
              Nuevo Usuario
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Registrar nuevo miembro del staff
            </p>
          </div>

          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >

            <input
              type="text"
              placeholder="Nombre completo"
              value={createForm.nombre}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  nombre: e.target.value,
                })
              }
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F3B204]"
              required
            />

            <input
              type="text"
              placeholder="Usuario"
              value={createForm.username}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  username: e.target.value,
                })
              }
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F3B204]"
              required
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  password: e.target.value,
                })
              }
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F3B204]"
              required
            />

            <button
              type="submit"
              className="bg-[#7B0000] hover:bg-[#650000] text-white font-medium rounded-xl transition"
            >
              Crear usuario
            </button>

          </form>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-200">

            <h2 className="text-xl font-semibold text-[#7B0000]">
              Personal registrado
            </h2>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-gray-50 border-b border-gray-200">

                <tr>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Nombre
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Usuario
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Rol
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Estado
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Acciones
                  </th>

                </tr>

              </thead>

              <tbody>

                {staffList.map((staff) => (
                  <tr
                    key={staff.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >

                    {editingId === staff.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.nombre}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                nombre: e.target.value,
                              })
                            }
                            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                          />
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {staff.username}
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={editForm.rol}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                rol: e.target.value,
                              })
                            }
                            className="border border-gray-300 rounded-lg px-3 py-2"
                          >
                            <option value="scanner">
                              Scanner
                            </option>

                            <option value="supervisor">
                              Supervisor
                            </option>

                            <option value="admin">
                              Admin
                            </option>
                          </select>
                        </td>

                        <td className="px-6 py-4">

                          <label className="flex items-center gap-2 text-sm">

                            <input
                              type="checkbox"
                              checked={editForm.activo}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  activo: e.target.checked,
                                })
                              }
                            />

                            {editForm.activo
                              ? 'Activo'
                              : 'Inactivo'}

                          </label>

                        </td>

                        <td className="px-6 py-4 flex gap-2">

                          <button
                            onClick={() =>
                              handleEdit(staff.id)
                            }
                            className="bg-[#7B0000] hover:bg-[#650000] text-white px-4 py-2 rounded-lg text-sm transition"
                          >
                            Guardar
                          </button>

                          <button
                            onClick={cancelEdit}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm transition"
                          >
                            Cancelar
                          </button>

                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {staff.nombre}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {staff.username}
                        </td>

                        <td className="px-6 py-4 text-sm capitalize">
                          {staff.rol}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              staff.activo
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {staff.activo
                              ? 'Activo'
                              : 'Inactivo'}
                          </span>

                        </td>

                        <td className="px-6 py-4 flex gap-2">

                          <button
                            onClick={() =>
                              startEdit(staff)
                            }
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                staff.id,
                                staff.nombre
                              )
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
                          >
                            Eliminar
                          </button>

                        </td>
                      </>
                    )}

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>
      </div>
    </div>
  );
};

export default StaffManagement;