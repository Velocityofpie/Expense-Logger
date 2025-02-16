import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

const API_URL = "http://127.0.0.1:8000";

export default function NavigationBar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        const username = localStorage.getItem("username");
        if (username) {
            setAvatarUrl(`${API_URL}/avatar/${username}`);
        }
    }, []);

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">Invoice Extractor</Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/upload">Upload</Nav.Link>
                </Nav>
                <Nav>
                    {isAuthenticated ? (
                        <>
                            <img src={avatarUrl} alt="Profile" width="40" height="40" style={{ borderRadius: "50%", marginRight: "10px" }} />
                            <Button variant="outline-light">Logout</Button>
                        </>
                    ) : (
                        <Button variant="outline-light">Login</Button>
                    )}
                </Nav>
            </Container>
        </Navbar>
    );
}
