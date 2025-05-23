"use client"
import { PenLine } from "lucide-react";
import { useRouter } from "next/navigation";


export function NewChat() {
    const router = useRouter();
    
    const handleNewChat = () => {
        router.push("/chat");
    };
    
    return (
        <button
        onClick={handleNewChat}
        className="fixed m-2 p-2 text-gray-400 hover:text-gray-100 transition-colors top-0 left-0 bg-gray-800 rounded-lg"
        >
        <PenLine className="w-7 h-7" />
        </button>
    );
}