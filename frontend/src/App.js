import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InvoiceExtractor from "./components/InvoiceExtractor";
import InvoiceDetail from "./components/InvoiceDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InvoiceExtractor />} />
        <Route path="/invoice/:id" element={<InvoiceDetail />} />
      </Routes>
    </Router>
  );
}
