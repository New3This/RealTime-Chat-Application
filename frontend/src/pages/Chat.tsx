import { useAuth } from "../context/AuthContext";

export default function Chat() {
    const { user } = useAuth();

    return (
        <div>
            Hello, {user?.username}!
        </div>
    )
}
