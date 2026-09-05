import { type UserType } from "../context/AuthContext";
import { useState } from "react";

export default function Sidebar({chatRooms, setChat} : {chatRooms : UserType[] | null, setChat : React.Dispatch<React.SetStateAction<boolean>>}) {
    const startChat = (id : Number) => {
        setChat(true);
    }
    return (
            <div className="flex flex-col border w-70 bg-white/20">
                <div className="flex p-4 justify-center border-gray-400">
                    <input placeholder="Search" className="border pl-2 p-2 text-lg bg-white"></input>
                </div>
                <div>
                    {chatRooms?.length === 0
                        ? (
                            <div className="text-white">No users available</div>
                        )
                        : (
                            chatRooms?.map((person) => (
                                <div key={person._id} onClick={() => startChat(parseInt(person._id))} className="flex justify-between items-center py-8 text-center px-8 border-b border-gray-400 cursor-pointer hover:bg-gray-100/50">
                                    <div className="text-white font-bold">{person.username}</div>
                                    <div className="h-10 w-10 rounded-2xl">
                                        <img src={person.image || "s"} alt="Profile" />
                                    </div>
                                </div>
                            ))
                        )
                        
                    }
                </div>
            </div>
    )
}


