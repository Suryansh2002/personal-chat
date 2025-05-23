"use client"

import { ChatArea, Profile, NewChat} from "@/components/chat"
import { Suspense } from "react"
export default function ChatPage() {
    return <>
        <nav>
            <NewChat />
            <Profile />
        </nav>
        <div className="pt-18 w-full flex justify-center">
            <Suspense>
                <ChatArea />
            </Suspense>
        </div>
    </>
}