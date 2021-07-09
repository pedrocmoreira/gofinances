import React, { createContext, useContext, ReactNode, useState } from "react";

import * as Google from 'expo-google-app-auth';
import AsyncStorage  from '@react-native-async-storage/async-storage';

interface AuthProviderProps{
    children: ReactNode;
}

interface User {
    id: string;
    name: string;
    email: string;
    photo?: string;
}

interface IAuthContextData {
    user: User;
    signInWithGoogle(): Promise<void>;
}

export const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>({} as User)

    async function signInWithGoogle(){
        try{
            const result = await Google.logInAsync({
                iosClientId: '864964323712-sr7n30sssqojrlb8t1peir1ai4lldsr7.apps.googleusercontent.com',
                androidClientId: '864964323712-t173t678rep4h6ejj4htp74cge5f8uip.apps.googleusercontent.com',
                scopes: ['profile', 'email']
            });

            if(result.type === 'success'){
                const userLogged ={
                    id: String(result.user.id),
                    email: result.user.email!,
                    name: result.user.name!,
                    photo: result.user.photoUrl!,
                };
                setUser(userLogged);
                await AsyncStorage.setItem('@gofinances:user', JSON.stringify(userLogged));
            }
            
        } catch(error){
            throw new Error(error)
        }
    }

    return (
        <AuthContext.Provider value={{user, signInWithGoogle}}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth(){
    const context = useContext(AuthContext);
    return context;
}

export { AuthProvider, useAuth }
