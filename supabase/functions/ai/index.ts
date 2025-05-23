import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts";
import { createClient, User } from "jsr:@supabase/supabase-js"
import { OpenAI } from "@openai/openai";

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

interface Message {
  id?: string;
  content: string;
  role: "user" | "assistant" | "system" | "developer";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization')!;
  const token = authHeader.replace('Bearer ', '');
  const {data:{user}} = await supabase.auth.getUser(token);

  if (user === null) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        }
      }
    );
  }

  return await handleRequest({req, user})
});

async function generateInsights(content: string, user: User, previousInsights?: string) {
  let prevInsightText = "";
  if (previousInsights) {
    prevInsightText = `Previous Insights: ${previousInsights}\n`;
  }
  

  const messages: Message[] = [
    {
      role: "system",
      content: `
      You are a human behavior analyst. You are given a text and you need to generate insights and facts from it. You should only return the insights in JSON format. Do not add any other text.
      
      Facts are what defines the user - personal details, strong preferences, behaviorial patterns, likings, habits, thinking patterns etc...
      Current insights are the current state of the user - right now or today.
      Previous insights are the previous state of the user -  weeks or a month.

      Insights can be thoughts, feelings, or behaviors that the user has expressed in the text. They can be positive or negative, and they can be about anything that the user has mentioned in the text.
      Insights should always have a timestamp, which is the date and time when the insight was generated. The timestamp should be in ISO 8601 format.
      
      Current Time: ${new Date().toISOString()}

      Response should be just a JSON object with the following format:
      {
         "facts": Object,
         "current_insights": Object[],
         "previous_insights": Object[]
      }
      `,
    },
  ]
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      ...messages,
      {
        role: "user",
        content: `${prevInsightText} Currently said:${content} Generate insights using previous insights and currently said.
        Update the previous/current insights as needed, remove less informational or obsolete insights.

        Response should be JSON object with no other text.
        `
      },
    ]
  })
  await supabase.from("profile").upsert({user_id: user.id, insight: response.output_text});
  console.log(response.output_text);
}


async function handleRequest({req, user}:{req:Request, user:User}){
  const profileData = await supabase.from("profile").select().eq("user_id", user.id).single();
  
  const messages: Message[] = [
    { 
      role: "system",
      content: `You are a help assistant and a companion to help the user in life and help them grow.`
    }
  ]
  if (profileData.data) {
    messages.push({
      role: "system",
      content: `Previous Insights about user: ${profileData.data.insight}`
    })
  }

  const { content, chat_id, prevMessages }:{prevMessages:Message[], content:string, chat_id:string} = await req.json();
  messages.push(...prevMessages)

  let data = await supabase.from("chat").insert({
    chat_id,
    user_id: user.id,
    role: "user",
    content,
  }).select();

  if (data.data === null) {
    throw new Error("Failed to insert user message");
  }

  const genPromise = generateInsights(content, user, profileData.data?.insight)

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      ...messages.map((msg)=>({role: msg.role, content: msg.content})),
      {role: "user", content: content}
    ]
  })
  
  data = await supabase.from("chat").insert({
    chat_id,
    user_id: user.id,
    role: "assistant",
    content: response.output_text
  }).select();
  if (data.data === null) {
    throw new Error("Failed to insert ai message");
  }


  await genPromise;
  return new Response(
    JSON.stringify({
      id: data.data[0].id,
      content: response.output_text,
      role: "assistant",
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200
    }
  );
}