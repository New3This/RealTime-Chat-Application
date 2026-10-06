import { type UserType } from "../context/AuthContext";
import { type Socket } from "socket.io-client";
import axios from "axios";
import { type ChatMessageType } from "../pages/Chat"
import { useEffect, useState } from "react";

interface SidebarProps {
    setChatRooms: React.Dispatch<React.SetStateAction<UserType[] | null>>;
    setReceiverUser: React.Dispatch<React.SetStateAction<UserType | null>>;
    setReceipientImage: React.Dispatch<React.SetStateAction<String>>;
    chatRooms: UserType[] | null;
    setInitialiseChat: React.Dispatch<React.SetStateAction<boolean>>;
    socket: Socket;
    setChat: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
    setConversationId: React.Dispatch<React.SetStateAction<string>>;
}

export default function Sidebar({setChatRooms,setReceiverUser, setReceipientImage, chatRooms, setInitialiseChat, socket, setChat, setConversationId} : SidebarProps) {

    const [activeId, setActiveId] = useState(null);
    const [search, setSearch] = useState("");
    const filteredUsers = chatRooms?.filter((user) => user.username.toLowerCase().includes(search));

    const startChat = async (recipient: UserType) => {

        try {
            const response = await axios.get(
                `http://localhost:3000/chat/message/receive/${recipient.id}`,
                { withCredentials: true }
            );
            const messages = response.data.messages.map(({_id, message, sender, reactions, createdAt, isEdited, isRead } : any) => ({
                id: _id,
                message,
                sender,
                reactions,
                createdAt,
                isEdited,
                isRead
            }));

            setReceipientImage(response.data.image);
            setReceiverUser(recipient);
            setInitialiseChat((prev) => {
                if (prev === true && activeId === response.data.conversationId) {
                    return false;
                }
                return true;
            });

            setActiveId(response.data.conversationId);
            setChat(messages);

            const incomingConversationId = response.data.conversationId;

            if (incomingConversationId) {
                socket.emit('leaveConversation', incomingConversationId); // triggers when a user is selected in sidebar, and 'leaveConversation' in case new user (new user = new room cause new conversation)
                socket.emit('joinConversation', incomingConversationId); // 1. send conversation id to socket looking for 'joinConversation'
                setConversationId(incomingConversationId);
            }
        } 
        catch (err) {
            console.log(err);
            setChat([]);
        }
    };

    return (
            <div className="flex flex-col border w-70 bg-white/20 h-full">
                <div className="flex p-4 justify-center border-gray-400"> 
                    <input placeholder="Search" className="border pl-2 p-2 text-lg bg-white" onChange={(e) => {
                        const searchTerm = e.target.value.toLowerCase();
                        setSearch(searchTerm);
                        
                    }}/>
                </div>
                <div>
                    {filteredUsers?.length === 0
                        ? (
                            <div className="text-white text-center">No users available</div>
                        )
                        : (
                            filteredUsers?.map((person) => (
                                <div key={person.id} onClick={() => startChat(person)} className="flex justify-between items-center py-8 text-center px-8 border-b border-gray-400 cursor-pointer hover:bg-gray-100/50">
                                    <div className="flex flex-col">
                                        <div className="text-white font-bold">{person.username}</div>
                                        {person.unread && (
                                            <div className="text-white font-bold text-xs">Unread Messages</div>
                                        )}
                                    </div>
                                    <div className="h-10 w-10 rounded-2xl">
                                        <img src={`http://localhost:3000/images/${person.image}` || "s"} alt="Profile" />
                                    </div>
                                </div>
                            ))
                        )
                        
                    }
                </div>
            </div>
    )
}


