import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/Navbar";
import Profile from "./components/Profile";

function App() {
    return (
        <Router>
            <NavigationBar />
            <Routes>
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Router>
    );
}

export default App;
