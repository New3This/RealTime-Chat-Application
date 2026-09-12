import axios from "axios";
import { useState } from "react";

export interface MessageProps {
    receiverId: string;
};

export default function Message({receiverId} : MessageProps) {
    const [message, setMessage] = useState("");

    async function handleSubmit() {
        try {
            await axios.post(`http://localhost:3000/chat/message/${receiverId}`, {content: message}, {withCredentials: true});
            setMessage("");
        }
        catch (err) {
            console.log(err);
        }
    }
    
    return (
        <div className="flex flex-row flex-1 w-[calc(100vw-280px)]">
            <input onChange={(e) => setMessage(e.target.value)} value={message} className="border bg-white p-3 flex-1 border-black" placeholder="Type Message Here"></input>
            <button className="bg-blue-600 p-3 hover:cursor-pointer" onClick={() => handleSubmit()}>Submit</button>
        </div>
    )
}