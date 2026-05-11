import React, { useEffect, useState } from "react";
import "./AdminSupervise.css";

const API_BASE = (process.env.REACT_APP_API_BASE || "https://aarohan-git-main-01-tanishas-projects.vercel.app").trim().replace(/\/$/, "");
const API = `${API_BASE}/api`;

function AdminSupervise() {
  const [users, setUsers] = useState([]);
  const [editData, setEditData] = useState(null);
  const [message, setMessage] = useState("");
  const[filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/admin/supervise/users/`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to load supervise data");
        setUsers([]);
        return;
      }
      // ✅ Remove duplicates by ID
      const dataArray = Array.isArray(data) ? data : [];
      const uniqueUsers = [];
      const seenIds = new Set();
      
      for (const user of dataArray) {
        if (!seenIds.has(user.id)) {
          seenIds.add(user.id);
          uniqueUsers.push(user);
        }
      }
      
      setUsers(uniqueUsers);
    } catch (error) {
      setMessage("Failed to connect to backend");
      setUsers([]);
    }
  }; 

  const handleDelete = async (user) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${user.name}?`
  );

  if (!confirmDelete) return; // ❌ stop if user cancels

  const url = `${API}/admin/supervise/${user.type}/${user.id}/delete/`;

  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    setMessage(data.error || "Delete failed");
    return;
  }

  setMessage("✅ User deleted successfully");
  fetchUsers();
  };

  const handleEdit = (user) => {
  const parts = user.name.split(" ");

  setEditData({
    ...user,
    first_name: parts[0] || "",
    last_name: parts.slice(1).join(" ") || "",
    father_name: user.father_name || "",
    mother_name: user.mother_name || "",
    middle_name: user.middle_name || "",
    phone_number: user.phone_number,

  });
};

  const handleUpdate = async () => {
  try {
    const url = `${API}/admin/supervise/${editData.type}/${editData.id}/update/`;

    const res = await fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });

    if (res.ok) {
      setMessage(" User information updated successfully");
      setEditData(null);
      fetchUsers();
    } else {
      const data = await res.json();
      setMessage(`${data.error || "Failed to update user"}`);
    }
  } catch (error) {
    setMessage("Something went wrong");
  }
};
const filteredUsers = users.filter((u) => {
  const query = searchTerm.trim().toLowerCase();

  const name = (u.name || "").toLowerCase();
  const email = (u.email || "").toLowerCase();

  // ✅ TYPE FILTER (student/teacher)
  const matchesType =
    filterType === "all" || u.type === filterType;

  // ✅ SEARCH FILTER
  const matchesSearch =
    !query || name.includes(query) || email.includes(query);

  return matchesType && matchesSearch;
});
  return (
    <div className="container">
      <h2>Admin Supervise</h2>
    <div className="header">
  <input
    type="text"
    placeholder="Search by name or email..."
    className="search-bar"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
<div className="filter-buttons">
  <button
    className={filterType === "all" ? "active" : ""}
    onClick={() => setFilterType("all")}
  >
    All
  </button>

  <button
    className={filterType === "student" ? "active" : ""}
    onClick={() => setFilterType("student")}
  >
    Student
  </button>

  <button
    className={filterType === "teacher" ? "active" : ""}
    onClick={() => setFilterType("teacher")}
  >
    Teacher
  </button>
  
</div>
            {message && <p className="message">{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Roll No</th>
            <th>Email</th>
            <th>Semester</th>
            <th>Hostel</th>
            <th>Course</th>
            <th>Specification</th>
            <th>Actions</th>
          </tr>
        </thead>

       
  <tbody>
  {filteredUsers.length > 0 ? (
    filteredUsers.map((u) => (
      <tr key={u.id}>
        <td>{u.type}</td>
        <td>{u.name}</td>
        <td>{u.roll_number || "-"}</td>
        <td>{u.email}</td>
        <td>{u.semester || "-"}</td>
        <td>{u.hostel || "-"}</td>
        <td>{u.course || "-"}</td>
        <td>{u.specialization || "-"}</td>
        <td>
          <button onClick={() => handleEdit(u)}>Edit</button>
          <button onClick={() => handleDelete(u)}>Delete</button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="8" style={{ textAlign: "center" }}>
        No users found
      </td>
    </tr>
  )}
</tbody>
</table>
        

      {/* EDIT POPUP */}
      {editData && (
        <div className="popup">
          <div className="popup-box">
            <h3>Edit User</h3>

            <input
              value={editData.first_name || ""}
              onChange={(e) =>
                setEditData({ ...editData, first_name: e.target.value })
              }
              placeholder="First Name"
            />

            <input
              value={editData.middle_name || ""}
              onChange={(e) =>
                setEditData({ ...editData, middle_name: e.target.value })
              }
              placeholder="Last Name"
            />

            <input
              value={editData.last_name || ""}
              onChange={(e) =>
                setEditData({ ...editData, last_name: e.target.value })
              }
              placeholder="Last Name"
            />

            <input
              value={editData.father_name || ""}
              onChange={(e) =>
                setEditData({ ...editData, father_name: e.target.value })
              }
              placeholder="Father's Name"
            />


            <input
              value={editData.mother_name || ""}
              onChange={(e) =>
                setEditData({ ...editData, mother_name: e.target.value })
              }
              placeholder="Mother's Name"
            />

            <input
              value={editData.email || ""}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
              placeholder="Email"
            />

            <input
              value={editData.phone_number}
              onChange={(e) =>
                setEditData({ ...editData, phone_number: e.target.value })
              }
              placeholder="Last Name"
            />


            {editData.type === "student" && (
              <>
                <input
                  value={editData.roll_number || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      roll_number: e.target.value,
                    })
                  }
                  placeholder="Roll Number"
                />

                <input
                  value={editData.semester || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      semester: e.target.value,
                    })
                  }
                  placeholder="Semester"
                />
              </>
            )}

            <button onClick={handleUpdate}>Save</button>
            <button onClick={() => setEditData(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSupervise;
