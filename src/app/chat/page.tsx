"use client"

import { ChatArea, Profile, NewChat} from "@/components/chat"
import { Suspense } from "react"
export default function ChatPage() {
    return <>
        <nav>
            <NewChat />
            <Profile />
        </nav>
        <div className="pt-18 w-full h-[calc(100vh-120px)] max-h-[calc(100dvh-120px)] flex justify-center overflow-y-auto no-scrollbar">
            <Suspense>
                <ChatArea />
            </Suspense>
        </div>
    </>
}