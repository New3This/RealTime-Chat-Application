import { useState } from "react"

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e : React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

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

                <div className="flex justify-center">
                    <button type="submit" className="bg-blue-500 w-full py-2 hover:bg-blue-300">Submit</button>
                </div>
            </div>

        </form>

    )
}