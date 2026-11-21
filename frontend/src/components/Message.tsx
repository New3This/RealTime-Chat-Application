import axios from "axios";
import { useRef, useState } from "react";
import { type UserType } from "../context/AuthContext";
import { API_URL } from "../config";

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

    function handleUploadClick() {
        fileInputRef.current?.click();
    }

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
            await axios.post(`${API_URL}/chat/message/${receiverUser.id}`, formData, {withCredentials: true});
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
        <div className="w-full min-w-0 border-t border-white/20 bg-black/80 p-3">
            {isSenderTyping && (
                <div className="mb-2 truncate text-sm text-white/80">
                    {receiverUser?.username} is typing
                </div>
            )}
            {image && (
                <img
                    src={URL.createObjectURL(image)}
                    alt="Selected image preview"
                    className="mb-2 h-16 w-16 rounded object-cover"
                />
            )}
            <div className="flex w-full min-w-0 items-end gap-2">
                <button
                    type="button"
                    onClick={handleUploadClick}
                    aria-label="Attach an image"
                    className="flex size-10 shrink-0 items-center justify-center rounded border border-gray-300 bg-gray-50 text-xl text-gray-900 hover:bg-gray-200"
                >
                    +
                </button>
                <textarea
                    onFocus={onTyping}
                    onBlur={onStopTyping}
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                    rows={1}
                    className="min-h-10 min-w-0 flex-1 resize-y rounded border border-gray-300 bg-white p-2 text-gray-900"
                    placeholder="Type Message Here"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                />
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {setImage(e.target.files?.[0] ?? null)}} style={{display: 'none'}} />
                <button
                    type="button"
                    className="h-10 shrink-0 rounded bg-blue-600 px-4 text-white hover:cursor-pointer hover:bg-blue-700"
                    onClick={() => handleSubmit()}
                >
                    Send
                </button>
            </div>
        </div>
    )
}