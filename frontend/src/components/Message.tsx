import axios from "axios";
import { useState } from "react";
import { type UserType } from "../context/AuthContext";

export interface MessageProps {
    receiverUser: UserType | null;
    onTyping: () => void;
    onStopTyping: () => void;
    isSenderTyping: boolean;
};

export default function Message({receiverUser, onTyping, onStopTyping, isSenderTyping} : MessageProps) {
    const [message, setMessage] = useState("");

    async function handleSubmit() {
        try {
            const response = await axios.post(`http://localhost:3000/chat/message/${receiverUser?.id}`, {content: message}, {withCredentials: true});
            setMessage("");
        }
        catch (err) {
            console.log(err);
        }
    }
    
    return (
        <>
            {isSenderTyping && (
                <>            
                {console.log(receiverUser)}
                    <div className="text-white">{receiverUser?.username} is typing</div>
                </>
            )}
            <div className="flex flex-row flex-1 w-[calc(100vw-280px)]">
                <input onFocus={onTyping} onBlur={onStopTyping} onChange={(e) => setMessage(e.target.value)} value={message} className="border bg-white p-3 flex-1 border-black" placeholder="Type Message Here"></input>
                <button className="bg-blue-600 p-3 hover:cursor-pointer" onClick={() => handleSubmit()}>Submit</button>
            </div>
        </>
    )
}