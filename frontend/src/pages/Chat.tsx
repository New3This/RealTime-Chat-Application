import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
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
    createdAt: string;
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
                const messages = response.data.messages.map(({ _id, message, sender, createdAt }: any) => ({
                    id: _id,
                    message,
                    sender,
                    createdAt
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
            setChat(state => [...state, { id: message._id, sender: message.sender, message: message.message, createdAt: message.createdAt }]);
        }

        socket.on('newMsg', handleNewMessage); // 4. picks up the msg sent to socket listening to 'newMsg' event, and runs handleNewMessage to display chat

        return () => {
            socket.off('newMsg', handleNewMessage);
        };
    }, [loading, user, socket, conversationId]);

    return (
        <div className="bg-black/70 h-[calc(100vh-64px)] flex flex-row">
            <div>
                <Sidebar setReceipientImage={setReceipientImage} chatRooms={chatRooms} setInitialiseChat={setInitialiseChat} socket={socket} setReceiverId={setReceiverId} setChat={setChat} setConversationId={setConversationId}/>
            </div>
            {initialiseChat && (
            <div className="flex flex-col w-full h-[calc(100vh-120px)]">
                    <div className="overflow-y-scroll min-h-full">
                        {chat.map((msg) => (
                            <div key={String(msg.id)} data-id={String(msg.id)} className="flex w-full">
                                
                                { editingMessageId === msg.id 

                                ?

                                (
                                    // <div className={`flex flex-col items-end relative`}>
                                    //     <div className={`w-fit bg-blue-500 rounded-lg p-3 border-b border-b-black/25`} onClick={() => setOption(msg.id)}> {msg.message} </div>
                                    //         <div className={`${option === msg.id ? "block" : "hidden"} absolute flex flex-row border bg-gray-600 border-gray-700 top-12 right-0 gap-3 py-1 px-2`}>
                                    //             <img src={editImg} className="h-5 cursor-pointer" onClick={() => handleEdit(msg)}/>
                                    //             <img src={deleteImg} className="h-5 cursor-pointer" onClick={() => handleDel(msg.id)}/>
                                    //         </div>
                                    //     <div className="text-[12px]">{formatDistanceToNow(new Date(msg.createdAt), {addSuffix: true})}</div>
                                    // </div>
                                    // <div className={`flex items-center h-[67px] w-[67px] rounded-2xl border bg-black`}>
                                    //     <img src={user?.id === msg.sender ? `http://localhost:3000/images/${user.image}` : `http://localhost:3000/images/${receipientImage}`} alt="Profile"/>
                                    // </div>
                                    <div className="justify-end flex flex-row w-full px-5 py-5 gap-1">
                                        <input className={`items-end border-b border-b-black/25 p-3`} value={editText} autoFocus onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    submitEdit();
                                                }
                                            }}

                                            onBlur={() => { // if just click away mid-edit, reset 
                                                setEditingMessageId(null);
                                                setEditText("");
                                            }}/>
                                        <div className={`flex items-center h-[67px] w-[67px] rounded-2xl border bg-black`}>
                                            <img src={user?.id === msg.sender ? `http://localhost:3000/images/${user.image}` : `http://localhost:3000/images/${receipientImage}`} alt="Profile"/>
                                        </div>
                                    </div>
                                )
                                                        // <div className={`flex flex-col items-end relative`}>
                                                        //     <div className={`w-fit bg-blue-500 rounded-lg p-3 border-b border-b-black/25`} onClick={() => setOption(msg.id)}> {msg.message} </div>
                                                        //         <div className={`${option === msg.id ? "block" : "hidden"} absolute flex flex-row border bg-gray-600 border-gray-700 top-12 right-0 gap-3 py-1 px-2`}>
                                                        //             <img src={editImg} className="h-5 cursor-pointer" onClick={() => handleEdit(msg)}/>
                                                        //             <img src={deleteImg} className="h-5 cursor-pointer" onClick={() => handleDel(msg.id)}/>
                                                        //         </div>
                                                        //     <div className="text-[12px]">{formatDistanceToNow(new Date(msg.createdAt), {addSuffix: true})}</div>
                                                        // </div>
                                                        // <div className={`flex items-center h-[67px] w-[67px] rounded-2xl border bg-black`}>
                                                        //     <img src={user?.id === msg.sender ? `http://localhost:3000/images/${user.image}` : `http://localhost:3000/images/${receipientImage}`} alt="Profile"/>
                                                        // </div>

                                : 
                                
                                (
                                    <div className={`flex w-full px-5 py-5 ${user?.id === msg.sender ? "justify-end" : "justify-start"}`}>
                                        <div className="flex flex-row items-center gap-1">
                                            {
                                                user?.id !== msg.sender 
                                                
                                                ? 

                                                (               
                                                    <>
                                                        <div className={`flex items-center h-[67px] w-[67px] rounded-2xl border bg-black relative`}>
                                                            <img src={`http://localhost:3000/images/${receipientImage}`} alt="Profile"/>
                                                        </div>
                                                        <div className={`flex flex-col items-start}`}>
                                                            <div className={`w-fit bg-gray-500 rounded-lg p-3 border-b border-b-black/25`} onClick={() => setOption(msg.id)}> {msg.message} </div>
                                                            <div className="text-[12px]">{formatDistanceToNow(new Date(msg.createdAt), {addSuffix: true})}</div>
                                                        </div>
                                                    </>                  
    
                                                ) 
                                                
                                                : 
                                                
                                                (
                                                    <>
                                                        <div className={`flex flex-col items-end relative`}>
                                                            <div className={`w-fit bg-blue-500 rounded-lg p-3 border-b border-b-black/25`} onClick={() => setOption(msg.id)}> {msg.message} </div>
                                                                <div className={`${option === msg.id ? "block" : "hidden"} absolute flex flex-row border bg-gray-600 border-gray-700 top-12 right-0 gap-3 py-1 px-2`}>
                                                                    <img src={editImg} className="h-5 cursor-pointer" onClick={() => handleEdit(msg)}/>
                                                                    <img src={deleteImg} className="h-5 cursor-pointer" onClick={() => handleDel(msg.id)}/>
                                                                </div>
                                                            <div className="text-[12px]">{formatDistanceToNow(new Date(msg.createdAt), {addSuffix: true})}</div>
                                                        </div>
                                                        <div className={`flex items-center h-[67px] w-[67px] rounded-2xl border bg-black`}>
                                                            <img src={user?.id === msg.sender ? `http://localhost:3000/images/${user.image}` : `http://localhost:3000/images/${receipientImage}`} alt="Profile"/>
                                                        </div>
                                                    </>
                                                )
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-0">
                        <Message receiverId={receiverId} setChat={setChat}/>
                    </div>
                </div>
            )}
        </div>
    )
}
