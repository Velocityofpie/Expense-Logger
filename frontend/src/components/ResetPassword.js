import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const response = await fetch(`${API_URL}/reset-password/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, new_password: newPassword }),
        });

        const data = await response.json();
        setMessage(data.message);
        if (response.ok) {
            setTimeout(() => navigate("/"), 3000);
        }
    };

    return (
        <div className="p-6">
            <h2>Reset Password</h2>
            <form onSubmit={handleResetPassword}>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                />
                <button type="submit">Reset Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
