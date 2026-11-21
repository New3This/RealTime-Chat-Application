import {BrowserRouter, Routes, Route} from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import Navbar from "./components/Navbar";
import io from "socket.io-client";
import { useEffect } from "react";
import { API_URL } from "./config";

const socket = io(API_URL || window.location.origin, {
  withCredentials: true,
  autoConnect: false
});

function AppContent() {
  const { user, loading } = useAuth();

  useEffect(() => { // if not logged in, no dont run socket middleware, otherwise do
    if (loading) {
      return;
    }

    if (user) {
      socket.connect();
    } 
    else {
      socket.disconnect();
    }
  }, [loading, user]);

  return (
    <BrowserRouter>
        <Navbar/>
          <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/" element={<Home/>}/>
            <Route path="/chat" element={<Chat socket={socket}/>}/>
          </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
