import React, { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function Profile() {
    const [profile, setProfile] = useState({});
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [role, setRole] = useState("");
    const [message, setMessage] = useState("");
    const [avatarPreview, setAvatarPreview] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/profile/`, {
            headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.ok) {
            const data = await response.json();
            setProfile(data);
            setEmail(data.email || "");
            setRole(data.role || "");
            setAvatarPreview(`${API_URL}/avatar/${data.username}`);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/profile/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ email, new_password: newPassword, role }),
        });

        const data = await response.json();
        setMessage(data.message);
        fetchProfile();
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];

        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/upload-avatar/`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData,
        });

        const data = await response.json();
        setMessage(data.message);
        setAvatarPreview(`${API_URL}/avatar/${profile.username}?t=${new Date().getTime()}`);
    };

    return (
        <div className="p-6">
            <h2>Profile</h2>
            {message && <p className="text-success">{message}</p>}

            <div className="mb-4">
                <h3>Profile Picture</h3>
                <img src={avatarPreview} alt="Avatar" width="100" height="100" style={{ borderRadius: "50%" }} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} />
            </div>

            <form onSubmit={handleUpdate}>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label>New Password:</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
}
