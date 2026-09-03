import { useState, useEffect } from "react"
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import { type UserType } from "../context/AuthContext";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const { user, setUser } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/chat', { replace: true });
        }
    }, [user]);

    const handleSubmit = async (e : React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        file && formData.append('file', file);

        try {
           const response = await axios.post<{ user: UserType }>('http://localhost:3000/api/auth/register', formData, { withCredentials: true });   
            if (response.status === 201) {
                setUser({
                    id: response.data.user.id,
                    username: response.data.user.username,
                    image: response.data.user.image || null
                })
                navigate('/chat');
            }
        }
        catch (error) {
            console.log(error);
        }



    }
    return (
        
        <form onSubmit={handleSubmit} className="flex justify-center">
            <div className="flex flex-col gap-3">
                <div  className="flex flex-col">
                    <label className="text-lg">Username: </label>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="border border-black pl-2 py-2 text-lg"></input>
                </div>

                <div className="flex flex-col">
                    <label className="text-lg">Password: </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border border-black pl-2 py-2 text-lg"></input>
                </div>

                <div>
                    <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="border border-slate-200 p-2 block w-full text-m text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-violet-100"/>
                </div>

                <div className="flex justify-center">
                    <button type="submit" className="bg-blue-500 w-full py-2 hover:bg-blue-300">Submit</button>
                </div>
            </div>

        </form>

    )
}