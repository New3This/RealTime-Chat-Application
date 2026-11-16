import axios from "axios";
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type UserType } from "../context/AuthContext";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const handleSubmit = async (e : React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationErrors = [];
        if (!username.trim()) validationErrors.push("Username is required");
        if (!password) validationErrors.push("Password is required");
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
        try {
           const response = await axios.post<{user : UserType}>('http://localhost:3000/api/auth/login', {username, password}, { withCredentials: true });
            if (response.status === 202) {
                setUser({
                    id: response.data.user.id,
                    username: response.data.user.username,
                    image: response.data.user.image || null
                });
                navigate('/chat', { replace: true });
            }
        }
        catch (error) {
            if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
                const message = error.response?.data?.message;
                setErrors(Array.isArray(message) ? message : [message || "Unable to log in"]);
            } else {
                setErrors(["Unable to log in"]);
            }
        }
    }

    useEffect(() => {
        if (user) {
            navigate('/chat', { replace: true });
        }
    }, [user]);

    return (
        
        <form onSubmit={handleSubmit} className="flex justify-center">
            <div className="flex flex-col gap-3 min-w-sm max-w-sm">
                <div  className="flex flex-col">
                    <label className="text-lg">Username: </label>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="border border-black pl-2 py-2 text-lg"></input>
                </div>

                <div className="flex flex-col">
                    <label className="text-lg">Password: </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border border-black pl-2 py-2 text-lg"></input>
                </div>
                {errors.map((message, index) => (
                    <div key={`${index}-${message}`} className="text-red-500">{message}</div>
                ))}

                <div className="flex justify-center">
                    <button type="submit" className="bg-blue-500 w-full py-2 hover:bg-blue-300 cursor-pointer">Submit</button>
                </div>
            </div>

        </form>

    )
}