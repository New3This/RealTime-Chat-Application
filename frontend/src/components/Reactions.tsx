import { useEffect, useRef } from "react";
import deleteImg from "../assets/delete.png";
import editImg from "../assets/edit.png";
import emojiImg from "../assets/emoji.png";
import { type ChatMessageType } from "../pages/Chat";
import { useAuth } from "../context/AuthContext";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface SidebarProps {
    handleEdit: (msg: ChatMessageType) => void;
    handleDel: (msgId: number) => void;
    selectedMsg : any;
    selectedEmoji: any;
    handleSelectedEmoji: (emoji: any, msgId: number) => void;
    emojiView: any;
    handleEmoji: (msgId: number) => void;
    option: Number | undefined;
    setOption: React.Dispatch<React.SetStateAction<number | undefined>>;
    msg: ChatMessageType;
}

export default function Reactions({handleEdit, handleDel, selectedMsg, selectedEmoji, handleSelectedEmoji, emojiView, handleEmoji, option, setOption, msg} : SidebarProps) {
    
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
        <div className="flex">
            {msg.sender === user?.id 
            ? 
                (
                    <>
                    {option === msg.id && (
                        <div ref={dropdown} className={`w-max absolute flex flex-row border bg-gray-600 border-gray-700 bottom-(-1) right-0 gap-3 py-1 px-2`}>
                            <img src={editImg} className="h-5 cursor-pointer" onClick={() => handleEdit(msg)}/>
                            <img src={deleteImg} className="h-5 cursor-pointer" onClick={() => handleDel(msg.id)}/>
                            <img src={emojiImg} className="h-5 cursor-pointer" onClick={() => handleEmoji(msg.id)}/>
                        </div>
                    )}

                    {emojiView === msg.id && (
                        <div className="absolute z-10" onClick={(e) => e.stopPropagation()}>
                            <Picker data={data} onEmojiSelect={(emoji : string) => handleSelectedEmoji(emoji, msg.id)}/>
                        </div>  
                    )}
                    {selectedMsg === msg.id && (
                        <div className="absolute left-0">
                            {selectedEmoji[selectedEmoji.length-1]}
                        </div>
                    )}
                    </>
                )
            :
                (
                    <>
                        {option === msg.id && (
                            <div ref={dropdown} className={`w-max absolute flex flex-row border bg-gray-600 border-gray-700 bottom-(-1) left-0 gap-3 py-1 px-2`}>
                                <img src={emojiImg} className="h-5 cursor-pointer" onClick={() => handleEmoji(msg.id)}/>
                            </div>
                        )}
                        {emojiView === msg.id && (
                            <div className="absolute z-10" onClick={(e) => e.stopPropagation()}>
                                <Picker data={data} onEmojiSelect={handleSelectedEmoji} />
                            </div>
                        )}
                        {selectedMsg === msg.id && (
                            <div className="absolute right-0 text-2xl">
                                {selectedEmoji}
                            </div>
                        )}

                    </>

                )
        }
        </div>


    )
}