import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type UserType } from "../context/AuthContext";
import { type Socket } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import Message from "../components/Message";

export interface ChatMessageType {
    message: string;
    sender: string;
};

export default function Chat({ socket }: { socket: Socket }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [chatRooms, setChatRooms] = useState<UserType[] | null>([]);
    const [chat, setChat] = useState<ChatMessageType[]>([]);
    const [initialiseChat, setInitialiseChat] = useState<boolean>(false);
    const [receiverId, setReceiverId] = useState("");
    const [conversationId, setConversationId] = useState("");

    const getChatRooms = async () => {
      try {
            const response = await axios.get<{users: UserType[]}>('http://localhost:3000/chat/userbase', {withCredentials: true});

            if (response.status === 200) {
                setChatRooms(response.data.users);
            } 
        }
        catch (err) {
            console.log(err);
        }
    }
    
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { replace: true });
            return;
        }

        getChatRooms();

        const handleNewMessage = (message : any) => {
            const incomingConversation = message.conversationId;
            console.log(incomingConversation);
   
            setChat(state => [...state, { sender: message.sender, message: message.message }]);
        }

        socket.on('newMsg', handleNewMessage); // 4. picks up the msg sent to socket listening to 'newMsg' event, and runs handleNewMessage to display chat

        return () => {
            socket.off('newMsg', handleNewMessage);
        };
    }, [loading, user, socket, conversationId]);

    return (
        <div className="bg-black/70 h-[calc(100vh-64px)] flex flex-row">
            <Sidebar chatRooms={chatRooms} setInitialiseChat={setInitialiseChat} socket={socket} setReceiverId={setReceiverId} setChat={setChat} setConversationId={setConversationId}/>
            {initialiseChat && (
                <div>
                    {chat.map((msg, index) => (
                        <div key={index} className={user?.id === msg.sender ? "bg-blue-500" : "bg-gray-500"}> {msg.message} </div>
                    ))}
                    <Message receiverId={receiverId}/>
                </div>
            )}
        </div>

    )

}
