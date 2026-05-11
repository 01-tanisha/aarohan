import React, { useEffect, useState } from "react";
import "./AdminActivity.css";

function AdminActivities() {
  const API_BASE = (process.env.REACT_APP_API_BASE || "https://aarohan-git-main-01-tanishas-projects.vercel.app").trim().replace(/\/$/, "");
  const API = `${API_BASE}/api`;

  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [createData, setCreateData] = useState({
    name: "",
    description: "",
    capacity: "",
    requirements: "",
    category: ""
  });

  const [editData, setEditData] = useState(null);


  const loadActivities = async () => {
    const res = await fetch(`${API}/activities/`);
    const data = await res.json();
    setActivities(data);
  };

  const loadCategories = async () => {
    const res = await fetch(`${API}/activities/categories/`);
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadActivities();
    loadCategories();
  }, []);


 const createActivity = async () => {

  try {

    const res = await fetch(`${API}/activities/create/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(createData)
    });

    const data = await res.json();
    console.log("CREATE RESPONSE:", data);

    if(res.ok){
      alert("Activity Created");
      setShowCreate(false);
      loadActivities();
    } else {
      alert(data.error || "Error creating activity");
    }

  } catch(error){
    console.error("Create Error:", error);
  }

};


  const deleteActivity = async (id) => {

    if (!window.confirm("Do you want to delete this activity?")) return;

     const res = await fetch(`${API}/activities/delete/${id}/`, {
      method: "DELETE",
      credentials: "include"
    });

     if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to delete activity");
      return;
     }

    loadActivities();
  };


const updateActivity = async () => {

  try {

    console.log("Update button clicked", editData);

    if (!editData) return;

    const res = await fetch(`${API}/activities/update/${editData.id}/`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json"
  },
  credentials: "include",
  body: JSON.stringify({
    name: editData.name,
    description: editData.description,
    capacity: editData.capacity,
    requirements: editData.requirements,
    category: editData.category
  })
});

    const data = await res.json();
    console.log(data);

    if (!res.ok) {
      alert(data.error || "Failed to update activity");
      return;
    }

    alert("Activity Updated");

    setShowEdit(false);
    loadActivities();

  } catch (error) {
    console.error("Update error:", error);
  }

};

const filteredActivities = activities.filter((activity) =>
  activity.name.toLowerCase().includes(searchTerm.toLowerCase())
);
  return (

    <div className="activity-page">

      <div className="header">

        <h2>Activities</h2>
        <input
  type="text"
  placeholder="Search activity by name..."
  className="search-bar"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

        <button
          className="create-btn"
          onClick={() => setShowCreate(true)}
        >
          +
        </button>

      </div>


      <table className="activity-table">

        <thead>
          <tr>

            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Capacity</th>
            <th>Requirements</th>
            <th>Category</th>
            <th>Action</th>

          </tr>
        </thead>


        <tbody>

          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (

              <tr key={activity.id}>

                <td>{activity.id}</td>
                <td>{activity.name}</td>
                <td>{activity.description}</td>
                <td>{activity.capacity}</td>
                <td>{activity.requirements}</td>
                <td>{activity.category_name || activity.category}</td>

                <td>

                  <button
                className="edit-btn"
                onClick={() => {
                setEditData({ ...activity });
                setShowEdit(true);
              }}
              >
            Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteActivity(activity.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                Activity not found
              </td>
            </tr>
          )}

        </tbody>

      </table>


      {/* CREATE MODAL */}

      {showCreate && (

        <div className="modal">

          <div className="modal-content">

            <h3>Create Activity</h3>

            <input
              placeholder="Name"
              onChange={(e) =>
                setCreateData({ ...createData, name: e.target.value })
              }
            />

            <input
              placeholder="Description"
              onChange={(e) =>
                setCreateData({ ...createData, description: e.target.value })
              }
            />

            <input
              placeholder="Capacity"
              onChange={(e) =>
                setCreateData({ ...createData, capacity: e.target.value })
              }
            />

            <input
              placeholder="Requirements"
              onChange={(e) =>
                setCreateData({ ...createData, requirements: e.target.value })
              }
            />

            <select
              value={createData.category}
              onChange={(e) =>
                setCreateData({ ...createData, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="modal-buttons">

              <button onClick={() => setShowCreate(false)}>
                Cancel
              </button>

              <button onClick={createActivity}>
                Create
              </button>

            </div>

          </div>

        </div>

      )}



      {/* EDIT MODAL */}

      {showEdit && editData && (

        <div className="modal">

          <div className="modal-content">

            <h3>Edit Activity</h3>

            <input value={editData.id} readOnly />

            <input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />

            <input
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
            />

            <input
              value={editData.capacity}
              onChange={(e) =>
                setEditData({ ...editData, capacity: e.target.value })
              }
            />

            <input
              value={editData.requirements}
              onChange={(e) =>
                setEditData({ ...editData, requirements: e.target.value })
              }
            />

            <select
              value={editData.category}
              onChange={(e) =>
                setEditData({ ...editData, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input value={editData.created_at} readOnly />
            <input value={editData.updated_at} readOnly />


            <div className="modal-buttons">

              <button onClick={() => setShowEdit(false)}>
                Cancel
              </button>

              <button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    updateActivity();
  }}
>
  Update
</button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default AdminActivities;
