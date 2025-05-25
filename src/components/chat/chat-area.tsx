"use client";
import { useState, useRef, useEffect } from "react";
import { ChatInput } from "./chat-input";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/hooks/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { MarkdownRenderer } from "../ui/markdown";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}
const initialMessages: Message[] = [];

export function ChatArea() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [pending, setPending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {session, loading} = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chatId, setChatId] = useState<string|null>(null);

  if (searchParams.get("id") !== chatId) {
    setChatId(searchParams.get("id"));
  }
  const params = new URLSearchParams(searchParams.toString());
  useEffect(() => {
    if (loading) return;
    if (!chatId) {
      setMessages([]);
      return;
    };
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (error) {
        console.error(error);
        return;
      }
      const messagesData = data?.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
      })) || [];
      setMessages(messagesData as Message[]);
    };
    fetchMessages();
  }, [chatId, loading]);

  useEffect(()=>{
    if (loading) return;
    if (!session) {
      router.push("/");
      return;
    }
  }, [loading, session, router])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setPending(true);
    const newUuid = chatId || uuidv4();
    if (chatId !== newUuid) {
      params.set("id", newUuid);
      router.replace(`?${params.toString()}`);
    }
    setMessages((msgs) => [
      ...msgs,
      { id: uuidv4(), content: text, role: "user" }
    ]);
    supabase.functions.invoke("ai", {
      body: {
        chat_id: newUuid,
        content: text,
        prevMessages: messages
      }
    }).then((res) => {
      if (res.data.error) {
        toast.error(res.data.error);
        return;
      }
      setMessages((msgs) => [...msgs, res.data]);
    })
    .catch((err) => console.error(err))
    .finally(() => setPending(false));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[calc(100dvh-120px)] w-full max-w-4xl pt-6 pb-32 px-2 md:px-0">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex w-full mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`rounded-2xl px-4 py-2 max-w-[80%] text-base break-words shadow-md ${
              msg.role === "user"
                ? "bg-teal-300/30 text-gray-200 rounded-bl-md border border-gray-700"
                : "bg-blue-300/10 text-gray-200 rounded-br-md"
            }`}
          >
            <MarkdownRenderer content={msg.content} />
          </div>
        </div>
      ))}
      {pending && (
        <div className="flex w-full mb-3 justify-start">
          <div className="rounded-2xl px-4 py-2 max-w-[80%] text-base bg-gray-800 text-gray-400 border border-gray-700 animate-pulse">
            AI is typing...
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
      <ChatInput onSend={handleSend} disabled={pending}/>
    </div>
  );
}
