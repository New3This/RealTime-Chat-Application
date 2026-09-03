import {BrowserRouter, Routes, Route} from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import { AuthProvider } from "./context/AuthContext.tsx";
import Navbar from "./components/Navbar";

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/" element={<Home/>}/>
          <Route path="/chat" element={<Chat/>}/> 
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
