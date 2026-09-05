import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type UserType } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Message from "../components/Message";
export default function Chat() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [chatRooms, setChatRooms] = useState<UserType[] | null>([]);
    const [chat, setChat] = useState<boolean>(false);

    const getChatRooms = async () => {
      try {
            const response = await axios.get<{users: UserType[]}>('http://localhost:3000/api/chat/userbase', {withCredentials: true});

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
  
    
    }, [loading, user]);

    if (loading || !user) {
        return null;
    }

    return (
        <div className="bg-black/70 h-[calc(100vh-64px)] flex flex-row">
            <Sidebar chatRooms={chatRooms} setChat={setChat}/>
            {chat && (
                <div>
                    <div className="text-white h-[calc(100vh-64px-50px)] bg-amber-200">Chat initiated</div>
                    <Message/>
                </div>
            )}
        </div>

    )

}
