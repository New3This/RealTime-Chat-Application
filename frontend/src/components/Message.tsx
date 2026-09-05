import { useState } from "react";
export default function Message() {
    const [message, setMessage] = useState("");

    function handleSubmit() {
        console.log(message);
    }
    
    return (
        <div className="flex flex-row flex-1 w-[calc(100vw-280px)]">
            <input onChange={(e) => setMessage(e.target.value)} value={message} className="border bg-white p-3 flex-1 border-black" placeholder="Type Message Here"></input>
            <button className="bg-blue-600 p-3 hover:cursor-pointer" onClick={() => handleSubmit()}>Submit</button>
        </div>
    )
}