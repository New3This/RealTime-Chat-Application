import { type UserType } from "../context/AuthContext";
import { type Socket } from "socket.io-client";
import axios from "axios";
import { type ChatMessageType } from "../pages/Chat"

interface SidebarProps {
    chatRooms: UserType[] | null;
    setInitialiseChat: React.Dispatch<React.SetStateAction<boolean>>;
    socket: Socket;
    setReceiverId: React.Dispatch<React.SetStateAction<string>>;
    setChat: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
    setConversationId: React.Dispatch<React.SetStateAction<string>>;
}

export default function Sidebar({chatRooms, setInitialiseChat, socket, setReceiverId, setChat, setConversationId} : SidebarProps) {
    const startChat = async (recipientID: string) => {
        try {
            const response = await axios.get(
                `http://localhost:3000/chat/message/receive/${recipientID}`,
                { withCredentials: true }
            );

            const messages = response.data.messages.map(({ message, sender }: any) => ({
                message,
                sender,
            }));

            setChat(messages);

            const incomingConversationId = response.data.conversationId;

            if (incomingConversationId) {
                socket.emit('leaveConversation', incomingConversationId); // triggers when a user is selected in sidebar, and 'leaveConversation' in case new user (new user = new room cause new conversation)
                socket.emit('joinConversation', incomingConversationId); // 1. send conversation id to socket looking for 'joinConversation'
                setConversationId(incomingConversationId);
            }
        } catch (err) {
            console.log(err);
            setChat([]);
        }

        setReceiverId(recipientID);
        setInitialiseChat(true);
    };
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
                                <div key={person.id} onClick={() => startChat(person.id)} className="flex justify-between items-center py-8 text-center px-8 border-b border-gray-400 cursor-pointer hover:bg-gray-100/50">
                                    <div className="text-white font-bold">{person.username}</div>
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


