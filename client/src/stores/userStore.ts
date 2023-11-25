import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"


export interface User {
    id?: number
    fullname?: string
    email?: string
    image?: string
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
                fullname: undefined,
                email: undefined,
                image: undefined,
                setUser: (user) => set(user),
                logout: () => {
                    set({
                        id: undefined,
                        fullname: undefined,
                        email: undefined,
                        image: undefined,
                    })
                },
            }),
            {
                name: "user-storage",
            }
        )
    )
)