import axios from "axios";
import { useRef, useState } from "react";
import { type UserType } from "../context/AuthContext";

export interface MessageProps {
    receiverUser: UserType | null;
    onTyping: () => void;
    onStopTyping: () => void;
    isSenderTyping: boolean;
};

export default function Message({receiverUser, onTyping, onStopTyping, isSenderTyping} : MessageProps) {
    const [message, setMessage] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    async function handleSubmit() {
        if (!receiverUser || (!message.trim() && !image)) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('messageContent', message.trim());
            if (image) {
                formData.append('fileContent', image);
            }
            await axios.post(`http://localhost:3000/chat/message/${receiverUser.id}`, formData, {withCredentials: true});
            setMessage("");
            setImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
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
                <textarea onFocus={onTyping} onBlur={onStopTyping} onChange={(e) => setMessage(e.target.value)} value={message} className="border bg-white p-3 flex-1 border-black" placeholder="Type Message Here" onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        if (e.shiftKey) {
                            return;
                        }
                        else {
                            handleSubmit();
                        }
                    }
                }}/>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {setImage(e.target.files?.[0] ?? null)}} />
                {image && (
                    <img src={URL.createObjectURL(image)} alt="preview" className="w-40 h-40 object-cover"/>
                )}
                <button className="bg-blue-600 p-3 hover:cursor-pointer" onClick={() => handleSubmit()}>Submit</button>
            </div>
        </>
    )
}