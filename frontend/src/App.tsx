import {BrowserRouter, Routes, Route} from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import { AuthProvider } from "./context/AuthContext.tsx";
import Navbar from "./components/Navbar";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // create 2-way between backend and here (frontend)

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/" element={<Home/>}/>
          <Route path="/chat" element={<Chat socket={socket}/>}/> 
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
