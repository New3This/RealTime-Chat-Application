import axios from "axios";
import { formatDistanceToNow, formatRelative } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type UserType } from "../context/AuthContext";
import { type Socket } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import Message from "../components/Message";
import Reactions from "../components/Reactions";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import notificationSound from "../assets/notification.mp3";

export interface ReactionType {
    emoji: string;
    userIds: string[];
}
export interface ChatMessageType {
    id: number;
    message: string;
    sender: string;
    reactions?: ReactionType[];
    isEdited: boolean;
    isRead: boolean;
    createdAt: string;
};

export default function Chat({ socket }: { socket: Socket }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [chatRooms, setChatRooms] = useState<UserType[] | null>([]);
    const [chat, setChat] = useState<ChatMessageType[]>([]);
    const [initialiseChat, setInitialiseChat] = useState<boolean>(false);
    const [receiverUser, setReceiverUser] = useState<UserType | null>(null);
    const [conversationId, setConversationId] = useState<string | null>("");
    // track for rendering specific Reaction 
    const [option, setOption] = useState<number | undefined>();
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");
    const [receipientImage, setReceipientImage] = useState<String>("");
    const [emojiView, setEmojiView] = useState<number | undefined>();
    const notificationMp3 = new Audio(notificationSound);

    // track for rendering selectedEmoji


    const handleSelectedEmoji = async (emoji : any, msgId: number) => {
        await axios.patch(`http://localhost:3000/chat/msg/${msgId}`, { emoji: emoji.native, receiverId: receiverUser!.id }, {withCredentials: true});
        const response = await axios.get(`http://localhost:3000/chat/message/receive/${receiverUser!.id}`, { withCredentials: true }
        );

        const messages = response.data.messages.map(({_id, message, sender, reactions, createdAt, isRead, isEdited } : any) => ({
            id:_id,
            message,
            sender,
            reactions,
            createdAt,
            isRead,
            isEdited
        }));

        setChat(messages);
        setEmojiView(undefined);
        setOption(undefined);
    }
    
    const handleDel = async (msgId : number) => {
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

    const handleEmoji = (msgId: number) => {
        setEmojiView(msgId);
        setOption(undefined);
    }

    const unsendEmoji = async (msgId : number, emoji: string) => {
        await axios.patch(`http://localhost:3000/chat/msg/${msgId}`, { emoji: emoji, receiverId: receiverUser!.id }, {withCredentials: true});
        const response = await axios.get(`http://localhost:3000/chat/message/receive/${receiverUser!.id}`, {withCredentials: true});

        const messages = response.data.messages.map(({_id, message, sender, reactions, createdAt } : any) => ({
            id:_id,
            message,
            sender,
            reactions,
            createdAt
        }));

        setChat(messages);
    }
    const submitEdit = async () => {
        try {
            const response = await axios.patch(`http://localhost:3000/chat/editMsg/${editingMessageId}`, { message: editText }, { withCredentials: true });

            if (response.status === 200) {
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
            if (message.sender !== user?.id) {
                notificationMp3.currentTime = 0; // resets sound if multiple msgs sent quickly
                notificationMp3.play().catch((error) => {
                    console.warn("Could not play sound:", error);
                });
            }
            setChat(state => [...state, { id: message._id, sender: message.sender, message: message.message, createdAt: message.createdAt, isEdited: message.isEdited, isRead: message.isRead}]);
        }

        const handleNewChange = (reaction : any[]) => {
            setChat(reaction);
        };

        socket.on('newChange', handleNewChange); // 4. picks up the reaction sent to socket listening to 'newChange' event, and runs handleNewChange to display chat
        socket.on('newMsg', handleNewMessage); // 4. picks up the msg sent to socket listening to 'newMsg' event, and runs handleNewMessage to display chat
        socket.on('unreadUpdate', getChatRooms);

        return () => {
            socket.off('newMsg', handleNewMessage);
            socket.off('newChange', handleNewChange);
            socket.off('unreadUpdate', getChatRooms);
        };
    }, [loading, user, socket, conversationId]);

    return (
        <div className="bg-black/70 h-[calc(100vh-64px)] flex flex-row">
            <div>
                <Sidebar setReceiverUser={setReceiverUser} setReceipientImage={setReceipientImage} chatRooms={chatRooms} setInitialiseChat={setInitialiseChat} socket={socket} setChat={setChat} setConversationId={setConversationId}/>
            </div>
            {initialiseChat && (
            <div className="flex flex-col w-full h-[calc(100vh-120px)]">
                <div className="overflow-y-scroll min-h-full">
                    {chat.map((msg, index, arr) => (
                        <div key={String(msg.id)} data-id={String(msg.id)} className="flex w-full">
                            
                            { editingMessageId === msg.id 

                            ? // if editing msg:

                            (
        
                                <div className="justify-end flex flex-row w-full px-5 py-5 gap-1">
                                    <input className={`items-end border-b border-b-black/25 p-3`} value={editText} autoFocus onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => {
                                            if (e.key === 'Enter' && editText.trim() !== msg.message) {
                                                submitEdit();
                                            }
                                            else if (e.key === 'Enter' && editText.trim() === msg.message || e.key === 'Escape') {
                                                setEditingMessageId(null);
                                                setEditText("");
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

                            : // if not editing msg
                            
                            (
                                <div className={`flex w-full px-5 py-5 ${user?.id === msg.sender ? "justify-end" : "justify-start"}`}>
                                    <div className="flex flex-col items-start group w-full">
                                        {
                                            user?.id !== msg.sender 
                                            
                                            ? // display received msg

                                            (               
                                                <div className={`flex flex-row items-center gap-1 w-full`}>
                                                    <div className={`flex items-center h-[67px] w-[67px] rounded-2xl bg-black`}>
                                                        <img src={`http://localhost:3000/images/${receipientImage}`} alt="Profile"/>
                                                    </div>

                                                    <div className={`flex flex-col items-start w-full group`}>

                                                        <div className="max-w-[40%] relative">
                                                            <div className={`relative bg-gray-500 rounded-lg p-3 break-all cursor-pointer w-fit`} onClick={() => setOption(msg.id)}>
                                                                <div className="group">{msg.message}<span className="text-[10px] text-gray-800 ml-1">{msg.isEdited ? "(edited) " : " "}</span></div>
                                                        
                                                                <div className="">
                                                                    <Reactions handleEdit={handleEdit} handleDel={handleDel} handleEmoji={handleEmoji} option={option} setOption={setOption} msg={msg}/>
                                                                </div>
                                                            </div>

                                                           {emojiView === msg.id && (
                                                                <div className="absolute left-0 z-20" onClick={(e) => e.stopPropagation()}>
                                                                    <Picker data={data} onEmojiSelect={(emoji : any) => handleSelectedEmoji(emoji, msg.id)}/>
                                                                </div>  
                                                            )}
                                                            <div className="flex flex-row gap-1 ">
                                                                {msg.reactions?.filter((allReactions) => (allReactions.userIds?.includes(String(user!.id)) || allReactions.userIds?.includes(receiverUser!.id))).map((reaction) => (
                                                                    <div key={reaction.emoji} className="relative flex flex-col items-center">
                                                                        <div className="bg-black/10 rounded-lg p-1 text-xs mt-1 flex flex-row items-center peer">
                                                                            <div className="cursor-pointer" onClick={() => unsendEmoji(msg.id, reaction.emoji)}>{reaction.emoji}</div>    
                                                                            <div>{reaction.userIds.length}</div>
                                                                        </div>
                                                                        <div className="absolute bottom-[30px] hidden peer-hover:flex flex-row bg-gray-800 rounded-lg p-3 text-xs text-white border border-black whitespace-nowrap">
                                                                            <div className="mr-1">Reacted by </div>
                                                                            {reaction.userIds.map((userId, index) => (
                                                                                <div key={userId} className={`${index !== reaction.userIds.length - 1 ? "mr-1" : ""}`}>
                                                                                    {userId === user!.id ? user!.username : receiverUser!.username}{index !== reaction.userIds.length - 1 ? " and" : ""}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>                                                               
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            {
                                                                index === arr.length - 1 
                                                            ? 
                                                                (<div className="text-[12px]">{formatDistanceToNow(new Date(msg.createdAt), {addSuffix: true})}</div>)
                                                            : 
                                                                (<div className="hidden group-hover:block text-[12px]">{formatRelative(new Date(msg.createdAt), new Date())}</div>)
                                                            }
                                                        </div>

                                                    </div>
                                                </div>                  

                                            ) 
                                            
                                            : // display sent msg
                                            
                                            (
                                                <div className={`flex flex-row items-center gap-1 w-full`}>
                                                    <div className={`flex flex-col items-end group w-full `}>

                                                        <div className="max-w-[40%] relative w-full flex flex-col items-end">
                                                            <div className={`bg-blue-500 rounded-lg p-3 break-all cursor-pointer w-fit`} onClick={() => setOption(msg.id)}>
                                                                <div className="group">{msg.message}<span className="text-[10px] text-gray-800 ml-1">{msg.isEdited ? "(edited) " : " "}</span></div>
                                                      
                                                                <div className="">
                                                                    <Reactions handleEdit={handleEdit} handleDel={handleDel} handleEmoji={handleEmoji} option={option} setOption={setOption} msg={msg}/>
                                                                </div>
                                                            </div>

                                                            {emojiView === msg.id && (
                                                                <div className="absolute right-0 z-20" onClick={(e) => e.stopPropagation()}>
                                                                    <Picker data={data} onEmojiSelect={(emoji : any) => handleSelectedEmoji(emoji, msg.id)}/>
                                                                </div>  
                                                            )}
                                                            <div className="flex flex-row flex-wrap justify-end gap-1">

                                                                {msg.reactions?.filter((allReactions) => (allReactions.userIds?.includes(String(user?.id)) || allReactions.userIds?.includes(receiverUser!.id))).map((reaction) => (
                                                                    <div key={reaction.emoji} className="relative flex flex-col items-center">
                                                                        <div className="bg-black/10 rounded-lg p-1 text-xs mt-1 flex flex-row items-center peer">
                                                                            <div className="cursor-pointer" onClick={() => unsendEmoji(msg.id, reaction.emoji)}>{reaction.emoji}</div>    
                                                                            <div>{reaction.userIds.length}</div>
                                                                        </div>
                                                                        <div className="absolute bottom-[30px] hidden peer-hover:flex flex-row bg-gray-800 rounded-lg p-3 text-xs text-white border border-black whitespace-nowrap">
                                                                            <div className="mr-1">Reacted by </div>
                                                                            {reaction.userIds.map((userId, index) => (
                                                                                <div key={userId} className={`${index !== reaction.userIds.length - 1 ? "mr-1" : ""}`}>
                                                                                    {userId === user.id ? user.username : receiverUser!.username}{index !== reaction.userIds.length - 1 ? " and" : ""}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>                                                               
                                                                ))}
                                                            </div>
                                                        </div>    
                                                        <div className="mt-1">
                                                            
                                                            {
                                                                index === arr.length - 1 // formatting for last msg
                                                            ? 
                                                                (<div className="text-[12px]">{formatDistanceToNow(new Date(msg.createdAt), {addSuffix: true})}</div>)
                                                            : 
                                                                (<div className="hidden group-hover:block text-[12px]">{formatRelative(new Date(msg.createdAt), new Date())}</div>)
                                                            }
                                                        </div>    
                                                                                                 
                                                    </div>


                                                    <div className={`flex items-center h-[67px] w-[67px] rounded-2xl border border-amber-200 bg-black`}>
                                                        <img src={`http://localhost:3000/images/${user.image}`} alt="Profile"/>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-0">
                    <Message receiverId={receiverUser!.id} setChat={setChat}/>
                </div>
            </div>
            )}
        </div>
    )
}
