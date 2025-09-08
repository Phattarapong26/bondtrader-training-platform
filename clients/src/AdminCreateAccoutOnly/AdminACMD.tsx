import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  idCard: string;
  employeeId: string;
  phone: string;
  email: string;
  roles: string[];
}

interface NewUser {
  name: string;
  idCard: string;
  employeeId: string;
  phone: string;
  email: string;
  roles: string[];
}

const AdminACMD: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    idCard: "",
    employeeId: "",
    phone: "",
    email: "",
    roles: ["Admin"],
  });
  const [editUser, setEditUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = async () => {
    const token = sessionStorage.getItem("jwtToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    
    // เรียก API logout ถ้ามี token
    if (token) {
      try {
        await axios.post(
          "http://localhost:3000/api/SuperAdmin/Logout",
          { refreshToken },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    
    // ลบ token จาก sessionStorage
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("refreshToken");
    navigate("/privateAdmin");
  };

  const getToken = () => sessionStorage.getItem("jwtToken"); // เปลี่ยนจาก localStorage เป็น sessionStorage

  const fetchUsers = async (): Promise<void> => {
    try {
      const token = getToken();
      const response = await axios.get<User[]>(
        "http://localhost:3000/api/SuperAdmin/Get/admins",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        Swal.fire("Unauthorized", "Session expired. Please log in again.", "warning");
        handleLogout(); // Redirect to login if token is invalid
      } else {
        Swal.fire("Error", "Failed to fetch users", "error");
      }
    }
  };

  const handleAddUser = async (): Promise<void> => {
    try {
      const token = getToken();
      await axios.post<User>(
        "http://localhost:3000/api/SuperAdmin/Add/admins",
        newUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowModal(false);
      setNewUser({
        name: "",
        idCard: "",
        employeeId: "",
        phone: "",
        email: "",
        roles: ["Admin"],
      });
      fetchUsers();
      Swal.fire("Success", "User added successfully", "success");
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        Swal.fire("Unauthorized", "Session expired. Please log in again.", "warning");
        handleLogout();
      } else {
        Swal.fire("Error", "Failed to add user", "error");
      }
    }
  };

  const handleDeleteUser = async (id: string): Promise<void> => {
    try {
      const token = getToken();
      await axios.delete(
        `http://localhost:3000/api/SuperAdmin/Deleted/admins/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
      Swal.fire("Success", "User deleted successfully", "success");
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        Swal.fire("Unauthorized", "Session expired. Please log in again.", "warning");
        handleLogout();
      } else {
        Swal.fire("Error", "Failed to delete user", "error");
      }
    }
  };

  const handleEditUser = (user: User): void => {
    setEditUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (): Promise<void> => {
    if (!editUser) return;
    try {
      const token = getToken();
      await axios.put(
        `http://localhost:3000/api/SuperAdmin/Update/admins/${editUser._id}`,
        editUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowEditModal(false);
      setEditUser(null);
      fetchUsers();
      Swal.fire("Success", "User updated successfully", "success");
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        Swal.fire("Unauthorized", "Session expired. Please log in again.", "warning");
        handleLogout();
      } else {
        Swal.fire("Error", "Failed to update user", "error");
      }
    }
  };
  return (
    <div className="min-h-screen">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <div id="header-title" className="text-white text-2xl font-bold">| Accouts Managemet</div>
        <div className="flex items-center">
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="text-white hover:text-yellow-500 transition duration-300"
          >
            Log Out
          </button>
        </div>
      </header>
      <main className="p-8">
        <div id="main-content" className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h1 id="page-title" className="text-2xl font-bold">User Management</h1>
            <button
              id="add-user-btn"
              onClick={() => setShowModal(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
            >
              Add User
            </button>
          </div>
          <div id="breadcrumb" className="text-gray-500 mb-4">
            Accounts &gt; User Management
          </div>
          <div className="flex justify-between items-center mb-4">
            <input
              id="search-input"
              type="text"
              placeholder="Search User"
              className="border rounded-lg px-4 py-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <table id="users-table" className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">
                  <input type="checkbox" />
                </th>
                <th className="py-2">Name</th>
                <th className="py-2">User Role</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-100 transition duration-300"
                >
                  <td className="py-2">
                    <input type="checkbox" />
                  </td>
                  <td className="py-2 flex items-center">
                    <div>
                      <div className="font-bold">{user.name}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-2">
                    {user.roles &&
                    Array.isArray(user.roles) &&
                    user.roles.length > 0
                      ? user.roles.map((role, i) => (
                          <span
                            key={i}
                            className={`inline-block px-3 py-1 rounded-full text-white mr-2 ${
                              role === "Admin" ? "bg-gray-800" : ""
                            }`}
                          >
                            {role}
                          </span>
                        ))
                      : null}
                  </td>
                  <td className="py-2">
                    <button
                      id={`edit-user-${user._id}`}
                      onClick={() => handleEditUser(user)}
                      className="text-gray-500 mr-4 hover:text-gray-700 transition duration-300"
                    >
                      <i className="fas fa-cog"></i> Modify Roles
                    </button>
                    <button
                      id={`delete-user-${user._id}`}
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-gray-500 hover:text-gray-700 transition duration-300"
                    >
                      <i className="fas fa-times"></i> Remove User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add User Modal */}
      {showModal && (
        <div id="add-user-modal" className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-1/3">
            <h2 id="modal-title" className="text-2xl font-bold mb-4">Add Admin</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">ID Card</label>
              <input
                type="text"
                value={newUser.idCard}
                onChange={(e) =>
                  setNewUser({ ...newUser, idCard: e.target.value })
                }
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">
                Employee ID (This will be used as the password)
              </label>
              <input
                type="text"
                value={newUser.employeeId}
                onChange={(e) =>
                  setNewUser({ ...newUser, employeeId: e.target.value })
                }
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Phone</label>
              <input
                type="text"
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                id="cancel-add-btn"
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600 transition duration-300"
              >
                Cancel
              </button>
              <button
                id="confirm-add-btn"
                onClick={handleAddUser}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-1/3">
            <h2 className="text-2xl font-bold mb-4">Edit Admin</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                value={editUser.name}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">ID Card</label>
              <input
                type="text"
                value={editUser.idCard}
                onChange={(e) =>
                  setEditUser({ ...editUser, idCard: e.target.value })
                }
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Employee ID</label>
              <input
                type="text"
                value={editUser.employeeId}
                onChange={(e) =>
                  setEditUser({ ...editUser, employeeId: e.target.value })
                }
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Phone</label>
              <input
                type="text"
                value={editUser.phone}
                onChange={(e) =>
                  setEditUser({ ...editUser, phone: e.target.value })
                }
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Roles</label>
              <input
                type="text"
                value={editUser.roles.join(", ")}
                onChange={(e) =>
                  setEditUser({
                    ...editUser,
                    roles: e.target.value.split(",").map((role) => role.trim()),
                  })
                }
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
              >
                Update Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminACMD;