"use client";
import { useAuth } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function Profile(){
    const {session, loading} = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (loading) return;
        if (!session) {
            router.push("/");
        }
    }, [loading, session, router]);
    if (!session) return <></>
    return <DropdownMenu>
        <DropdownMenuTrigger className="fixed top-0 right-0 m-2 p-2">
            <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-800 to-purple-800 text-white font-bold">
                  {session.user.user_metadata.display_name.charAt()}
                </AvatarFallback>
            </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-950 text-gray-100 mr-4 border border-gray-800">
            <DropdownMenuLabel className="text-base font-semibold text-blue-400">
              {session.user.user_metadata.display_name}
            </DropdownMenuLabel>
            <p className="text-xs p-2 text-gray-400 break-all">{session.user.email}</p>
            <DropdownMenuSeparator className="bg-gray-800"/>
            <div className="p-3">
                <button onClick={() => {
                    supabase.auth.signOut().then(() => {
                        toast.success("Logged out successfully");
                    });
                }} className="w-full text-left text-sm text-red-400 hover:text-red-300 hover:bg-gray-900 p-2 rounded-md transition-colors font-semibold">Logout</button>
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
}