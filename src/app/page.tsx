"use client";
import { LoginModal, SignupModal } from "@/components/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const {session, loading} = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (loading) return;
    if (session) {
      router.push("/chat");
    }
  }
  , [loading, session, router]);
  
  useEffect(()=>{
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${process.env.NEXT_PUBLIC_BASE_PATH}/sw.js`)
    }
  },[])
  return (
    <main className="h-full flex items-center justify-center">
      {loginOpen && <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />}
      {signupOpen && <SignupModal open={signupOpen} onClose={() => setSignupOpen(false)} />}
      <div className="relative z-10 w-full flex flex-col items-center px-4">
        <div className=" rounded-2xl md:p-10 flex flex-col items-center gap-8 max-w-xl w-full backdrop-blur-md">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight text-white drop-shadow-xl text-center">
            Welcome to Personalized Chat
          </h1>
          <p className="mb-6 text-gray-300 text-center text-base md:text-xl font-medium max-w-lg">
            Your private, AI-powered chat experience. Simple. Secure. Yours.
          </p>
          <div className="flex flex-col md:flex-row gap-4 w-full items-center justify-center">
            <button onClick={()=>setLoginOpen(true)} className="w-32 py-2 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 transition-colors font-semibold shadow-md text-base md:text-lg">
              Login in
            </button>
            <button onClick={()=>setSignupOpen(true)} className="w-32 py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors font-semibold shadow-md text-base md:text-lg">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
