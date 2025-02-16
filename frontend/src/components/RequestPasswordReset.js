import React, { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function RequestPasswordReset() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        const response = await fetch(`${API_URL}/request-password-reset/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage("Password reset link sent to your email.");
        } else {
            setError(data.detail || "Failed to request password reset.");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Request Password Reset</h2>
            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}

            <form onSubmit={handleRequestReset} className="flex flex-col space-y-3">
                <label>Email Address:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="p-2 border rounded"
                />
                <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                    Send Reset Link
                </button>
            </form>
        </div>
    );
}
