import { createContext, type ReactNode } from "react";
import { useState, useEffect, useContext } from "react";
import axios from "axios";

export interface UserType {
    id: string;
    username: string;
    image: string | null;
}

interface ChildrenType {
    children: ReactNode;
}

interface AuthContextType {
    user: UserType | null;
    loading: boolean;
    setUser: (user: UserType | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children } : ChildrenType) => {
    
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get<{ user: UserType }>('http://localhost:3000/api/auth/user', {withCredentials: true});
                if (response.status === 200 || response.status === 202) {
                    setUser(response.data.user);
                }
            }
            catch (error) {
                setUser(null);
            }
            finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [])


    return (
        <AuthContext.Provider value={{user, loading, setUser}}>
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth = () : AuthContextType => {
    const actualContext = useContext(AuthContext);
    if (!actualContext) {
        throw new Error("useAuth must be inside AuthProvider");
    }
    return actualContext;
}
