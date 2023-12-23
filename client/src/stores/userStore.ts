import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"


export interface User {
    id?: number
    username?: string
    name?: string
    surname?: string
    email?: string
    avatar?: string
}

export interface UserActions {
    setUser: (user: User) => void
    logout: () => void
}

export const useUserStore = create<User & UserActions>()(
    devtools(
        persist(
            (set) => ({
                id: undefined,
                username: undefined,
                email: undefined,
                avatar: undefined,
                name: undefined,
                surname: undefined,
                setUser: (user) => set(user),
                logout: () => {
                    set({
                        id: undefined,
                        username: undefined,
                        email: undefined,
                        avatar: undefined,
                        name: undefined,
                        surname: undefined
                    })
                },
            }),
            {
                name: "user-storage",
            }
        )
    )
)