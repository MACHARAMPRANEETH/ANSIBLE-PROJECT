import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([
    { id: 1, title: "Blinding Lights", artist: "The Weeknd" },
    { id: 2, title: "Shape of You", artist: "Ed Sheeran" },
    { id: 3, title: "Levitating", artist: "Dua Lipa" },
  ]);
  const [newSong, setNewSong] = useState({ title: "", artist: "" });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_AUTH_URL}/api/admin/users`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm(`Delete user ID ${id}?`)) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_AUTH_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
      }
    } catch (err) {}
  };

  // Add song
  const addSong = () => {
    if (!newSong.title.trim() || !newSong.artist.trim()) {
      alert("Please enter both title and artist.");
      return;
    }

    setSongs([
      ...songs,
      { id: songs.length + 1, title: newSong.title, artist: newSong.artist },
    ]);

    setNewSong({ title: "", artist: "" });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-dark text-light text-xl animate-pulse">
        Loading users...
      </div>
    );

  return (
    <div className="min-h-screen bg-dark text-white p-6 md:p-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-primary pb-4">
        <h1 className="text-4xl font-extrabold text-primary">Admin Portal 🎧</h1>
        <button
          onClick={handleLogout}
          className="mt-4 md:mt-0 px-6 py-2 bg-primary text-black font-semibold rounded-full shadow-lg hover:bg-dark hover:text-primary transition transform hover:scale-105"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 border-b border-secondary mb-8">
        <button
          className={`pb-2 text-lg font-semibold ${
            activeTab === "overview"
              ? "text-primary border-b-2 border-primary"
              : "text-light"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          User Management
        </button>

        <button
          className={`pb-2 text-lg font-semibold ${
            activeTab === "songs"
              ? "text-primary border-b-2 border-primary"
              : "text-light"
          }`}
          onClick={() => setActiveTab("songs")}
        >
          Songs Management
        </button>
      </div>

      {/* USER MANAGEMENT TAB */}
      {activeTab === "overview" && (
        <div className="bg-secondary rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-light">
            User Management
          </h2>

          {users.length === 0 ? (
            <p className="text-light text-center py-10">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left table-auto border-separate border-spacing-y-2">
                <thead className="text-xs uppercase text-light bg-dark">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="bg-[#162337] rounded-lg shadow-sm hover:bg-[#1e3350] transition"
                    >
                      <td className="px-4 py-4 font-mono text-sm">{u.id}</td>
                      <td className="px-4 py-4">{u.email}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="px-4 py-2 bg-primary text-black rounded-md font-semibold hover:bg-dark hover:text-primary transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      )}

      {/* SONGS TAB */}
      {activeTab === "songs" && (
        <div className="bg-secondary rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-light">Songs Management</h2>

          {/* Add Song Form */}
          <div className="mb-8 bg-dark p-6 rounded-xl shadow-lg">
            <h3 className="text-xl text-primary mb-4 font-semibold">Add New Song</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Song Title"
                value={newSong.title}
                onChange={(e) =>
                  setNewSong({ ...newSong, title: e.target.value })
                }
                className="px-4 py-2 rounded-lg bg-secondary text-white border border-primary focus:outline-none"
              />

              <input
                type="text"
                placeholder="Artist Name"
                value={newSong.artist}
                onChange={(e) =>
                  setNewSong({ ...newSong, artist: e.target.value })
                }
                className="px-4 py-2 rounded-lg bg-secondary text-white border border-primary focus:outline-none"
              />

              <button
                onClick={addSong}
                className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-dark hover:text-primary transition"
              >
                Add Song
              </button>
            </div>
          </div>

          {/* Songs Table */}
          <table className="min-w-full text-left border-separate border-spacing-y-2">
            <thead className="text-xs uppercase text-light bg-dark">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Artist</th>
              </tr>
            </thead>

            <tbody>
              {songs.map((song) => (
                <tr
                  key={song.id}
                  className="bg-[#162337] rounded-lg hover:bg-[#1e3350] transition"
                >
                  <td className="px-4 py-3">{song.id}</td>
                  <td className="px-4 py-3">{song.title}</td>
                  <td className="px-4 py-3">{song.artist}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
