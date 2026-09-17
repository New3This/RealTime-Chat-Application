import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useActionState, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type UserType } from "../context/AuthContext";
import { type Socket } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import Message from "../components/Message";
import deleteImg from "../assets/delete.png";
import editImg from "../assets/edit.png";

export interface ChatMessageType {
    id: Number;
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
    const [editingMessageId, setEditingMessageId] = useState<Number | null>(null);
    const [editText, setEditText] = useState("");
    const [receipientImage, setReceipientImage] = useState<String>("");
    const handleDel = async (msgId : Number) => {
        const response = await axios.delete(`http://localhost:3000/chat/removeMsg/${msgId}`, {withCredentials: true});
        if (response.status === 200) {
            setChat((prev) => prev.filter((msg) => msg.id !== response.data.id));
        }
    }

    const handleEdit = (msg: ChatMessageType) => {
        setEditingMessageId(msg.id);
        setEditText(msg.message);
        setOption(undefined);
    }

    const submitEdit = async () => {

        try {
            const response = await axios.patch(
                `http://localhost:3000/chat/editMsg/${editingMessageId}`,
                { message: editText },
                { withCredentials: true }
            );

            if (response.status === 200) {
                const messages = response.data.messages.map(({ _id, message, sender }: any) => ({
                    id: _id,
                    message,
                    sender,
                }));
                setChat(messages);
                setEditingMessageId(null);
                setEditText("");
            }
        } catch (err) {
            console.log(err);
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
            setChat(state => [...state, { id:message.id, sender: message.sender, message: message.message }]);
        }

        socket.on('newMsg', handleNewMessage); // 4. picks up the msg sent to socket listening to 'newMsg' event, and runs handleNewMessage to display chat

        return () => {
            socket.off('newMsg', handleNewMessage);
        };
    }, [loading, user, socket, conversationId]);

    return (
        <div className="bg-black/70 h-[calc(100vh-64px)] flex flex-row">
            <Sidebar setReceipientImage={setReceipientImage} chatRooms={chatRooms} setInitialiseChat={setInitialiseChat} socket={socket} setReceiverId={setReceiverId} setChat={setChat} setConversationId={setConversationId}/>
            {initialiseChat && (
                <div>
                    {chat.map((msg) => (
                        <div key={String(msg.id)} className="flex flex-row">
                            {editingMessageId === msg.id ? (
                                <input
                                    className={`${user?.id === msg.sender ? "bg-blue-500" : "bg-gray-500"} w-full border-b border-b-black/25`}
                                    value={editText} autoFocus onChange={(e) => setEditText(e.target.value)} 
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            submitEdit();
                                        }
                                    }}

                                    onBlur={() => { // if just click away mid-edit, reset 
                                        setEditingMessageId(null);
                                        setEditText("");
                                    }}/>
                            ) : (
                                <div className={`flex w-full p-2 ${user?.id === msg.sender ? "justify-end" : "justify-start"}`}>
                                    <div className="flex flex-row">
                                        <div className="h-10 w-10 rounded-2xl">
                                            <img src={user?.id === msg.sender ? `http://localhost:3000/images/${user.image}` : `http://localhost:3000/images/${receipientImage}`} alt="Profile"/>
                                        </div>
                                        <div className={`${user?.id === msg.sender ? "bg-blue-500" : "bg-gray-500"} rounded-lg p-3 border-b border-b-black/25`} onClick={() => setOption(msg.id)}> {msg.message} </div>
                                        {option === msg.id && msg.sender === user?.id && (
                                            <div className="">
                                                <img src={editImg} className="h-5 absolute right-2 cursor-pointer" onClick={() => handleEdit(msg)}/>
                                                <img src={deleteImg} className="h-5 absolute right-10 cursor-pointer" onClick={() => handleDel(msg.id)}/>
                                            </div>
                                        )}
                                    </div>
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
