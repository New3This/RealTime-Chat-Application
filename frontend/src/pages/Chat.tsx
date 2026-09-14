import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type UserType } from "../context/AuthContext";
import { type Socket } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import Message from "../components/Message";
import deleteImg from "../assets/delete.png";

export interface ChatMessageType {
    id: string;
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
    const [option, setOption] = useState<Number>();
    

    const handleDel = async (msgId : Number) => {
        const response = await axios.delete(`http://localhost:3000/chat/removeUser/${msgId}`, {withCredentials: true});
        if (response.status === 200) {
            setChat((prev) => prev.filter((msg) => msg.id !== response.data.id));
        }
    }
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

        const handleNewMessage = (message : any) => { // for real-time msg upd
            console.log(message);   
            setChat(state => [...state, { id:message.id, sender: message.sender, message: message.message }]);
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
                    {chat.map((msg) => (
                            <div key={msg.id} className="flex flex-row">
                                <div className={`${user?.id === msg.sender ? "bg-blue-500" : "bg-gray-500"} w-full border-b border-b-black/25`} onClick={() => setOption(msg.id)}> {msg.message} </div>
                                {option === msg.id && msg.sender === user?.id && (
                                    <div className="">
                                        <img src={deleteImg} className="h-5 absolute right-2 cursor-pointer" onClick={() => handleDel(msg.id)}/>
                                    </div>
                                )}
                            </div>
                    ))}
                    <Message receiverId={receiverId}/>
                </div>
            )}
        </div>

    )

}
