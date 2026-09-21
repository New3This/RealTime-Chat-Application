import { useEffect, useRef } from "react";
import deleteImg from "../assets/delete.png";
import editImg from "../assets/edit.png";
import emojiImg from "../assets/emoji.png";
import { type ChatMessageType } from "../pages/Chat";

interface SidebarProps {
    handleEdit: (msg: ChatMessageType) => void;
    handleDel: (msgId: number) => void;
    option: Number | undefined;
    setOption: React.Dispatch<React.SetStateAction<number | undefined>>;
    msg: ChatMessageType;
}

export default function Reactions({handleEdit, handleDel, option, setOption, msg} : SidebarProps) {
    
    const dropdown = useRef<HTMLDivElement>(null);

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
    <div ref={option === msg.id ? dropdown : null} className={`${option === msg.id ? "flex" : "hidden"} w-max absolute flex flex-row border bg-gray-600 border-gray-700 bottom-(-1) right-0 gap-3 py-1 px-2`}>
        <img src={editImg} className="h-5 cursor-pointer" onClick={() => handleEdit(msg)}/>
        <img src={deleteImg} className="h-5 cursor-pointer" onClick={() => handleDel(msg.id)}/>
        <img src={emojiImg} className="h-5 cursor-pointer" onClick={() => handleDel(msg.id)}/>
    </div>
    )
}