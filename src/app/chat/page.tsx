"use client"

import { ChatArea, Profile, NewChat} from "@/components/chat"
import { Suspense } from "react"
export default function ChatPage() {
    return <>
        <nav>
            <NewChat />
            <Profile />
        </nav>
        <div className="w-full mt-16 h-[calc(100vh-60px)] flex justify-center overflow-y-auto no-scrollbar">
            <Suspense>
                <ChatArea />
            </Suspense>
        </div>
    </>
}