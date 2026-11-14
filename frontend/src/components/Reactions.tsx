import { useEffect, useRef } from "react";
import deleteImg from "../assets/delete.png";
import editImg from "../assets/edit.png";
import emojiImg from "../assets/emoji.png";
import { type ChatMessageType } from "../pages/Chat";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
    handleEdit: (msg: ChatMessageType) => void;
    handleDel: (msgId: number) => void;
    handleEmoji: (msgId: number) => void;
    option: number | undefined;
    setOption: React.Dispatch<React.SetStateAction<number | undefined>>;
    msg: ChatMessageType;
}

export default function Reactions({handleEdit, handleDel, handleEmoji, option, setOption, msg} : SidebarProps) {
    
    const dropdown = useRef<HTMLDivElement>(null);
    const {user} = useAuth();

    useEffect(() => {
        const clickLocation = (event : MouseEvent) => {
			if (dropdown.current && !dropdown.current.contains(event.target as Node)) {
				setOption(undefined);
			}
		}

        document.addEventListener("mousedown", clickLocation);
        
        return () => {
            document.removeEventListener("mousedown", clickLocation);
        }
    })
    
    return (
        <div className={`flex w-full ${msg.sender === user?.id ? "justify-end" : "justify-start"}`}>
            {msg.sender === user?.id 
            ? 
                (
                    <div>
                    {option === msg.id && (
                        <div ref={dropdown} className="flex w-max flex-row gap-3 border border-gray-700 bg-gray-600 px-2 py-1">
                            <img src={emojiImg} className="h-5 cursor-pointer" onClick={() => handleEmoji(msg.id)}/>
                            <img src={deleteImg} className="h-5 cursor-pointer" onClick={() => handleDel(msg.id)}/>
                            <img src={editImg} className="h-5 cursor-pointer" onClick={() => handleEdit(msg)}/>
                        </div>
                    )}
                    </div>
                )
            :
                (
                    <div>
                        {option === msg.id && (
                            <div ref={dropdown} className="flex w-max flex-row gap-3 border border-gray-700 bg-gray-600 px-2 py-1">
                                <img src={emojiImg} className="h-5 cursor-pointer" onClick={(event) => { event.stopPropagation(); handleEmoji(msg.id); }}/>
                            </div>
                        )}
                    </div>

                )
        }
        </div>


    )
}