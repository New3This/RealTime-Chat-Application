import { createContext, type ReactNode } from "react";
import { useState, useEffect, useContext } from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  username: string;
}

interface ChildrenType {
    children: ReactNode;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children } : ChildrenType) => {
    
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get<{ user: User }>('http://localhost:3000/api/auth/user', {withCredentials: true});
                if (response.status === 200 || response.status === 202) {
                    setUser(response.data.user);
                }
            }
            catch (error) {
                setUser(null);
            }
        };
        fetchUser();
    }, [])


    return (
        <AuthContext.Provider value={{user, setUser}}>
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
