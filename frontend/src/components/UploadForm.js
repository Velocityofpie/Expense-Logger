import React, { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function UploadForm() {
    const [files, setFiles] = useState([]);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (files.length === 0) {
            alert("Please select at least one file.");
            return;
        }

        for (let file of files) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("amount", amount);
            formData.append("category", category);
            formData.append("date", date);

            const response = await fetch(`${API_URL}/upload/`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("File(s) uploaded successfully!");
            } else {
                setMessage("Failed to upload file(s).");
            }
        }

        setFiles([]);
        setAmount("");
        setCategory("");
        setDate("");
    };

    return (
        <div className="p-4 border rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Upload Invoice Files</h2>

            {message && <p className="text-green-600">{message}</p>}

            <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
                <input type="file" multiple onChange={handleFileChange} required />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="p-2 border rounded"
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="p-2 border rounded"
                />
                <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                    Upload
                </button>
            </form>
        </div>
    );
}
