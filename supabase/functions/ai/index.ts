// deno-lint-ignore-file no-explicit-any
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

  if (req.url.endsWith("/generate-insights")) {
    return await handleGenerateInsights({req});
  }

  return await handleCompletion({req, user})
});

async function generateInsights(content: string, user: User, profileData?: any) {
  let model: "gpt-4.1-mini" | "gpt-4.1" = "gpt-4.1-mini";
  let count = profileData?.count || 0;
  let prevInsightText = "";

  if (profileData?.insight) {
    prevInsightText = `Previous Insights: ${profileData?.insight}\n`;
  }
  if (profileData?.count >= 4){
    model = "gpt-4.1";
    count = 0;
  }
  count ++;

  const messages: Message[] = [
    {
      role: "system",
      content: `
      You are a human behavior analyst. You are given a text and you need to generate insights and facts from it. You should only return the insights in JSON format. Do not add any other text.
      
      Facts are what defines the user - personal details, strong preferences, repeated behaviorial patterns, likings, habits, thinking patterns etc...
      insights can also influence the facts if they have patterns or have useful information.
      Retain as much facts as possible.

      Insights can be thoughts, feelings , behaviors or information that the user has expressed in the text.
      Insights should always have a timestamp, The timestamp should be in ISO 8601 format.
      The way, frequency and retaining of the insights can be different for each user, it's about personalization.
      
      Current insights are the current state of the user - mostly insights about right now or today.
      If older insights are still relevant, they can be kept in current insights, else they should be moved to previous insights.
      Previous insights are the previous state of the user - distilled insights mostly about weeks, months.

      ${(model == 'gpt-4.1') ? `Distill,summarize,merge similar older insights to one bigger insight to make them more useful, Focus on keywords.
      Merging and distilling should be done to keep important information and remove the noise. No important information should be lost.
      Very old and non-relevant insights can be removed if they are not useful anymore in a long term.
      Timestamps provide important contexts too.

      Make sure data for an entire day is not more than 3-4 insights in previous insights. Timestamps provide important context.
      Current insights can have upto 10 insights.` : ''
      }
      
      Response should be just a JSON object with the following format:
      {
         "facts": Object,
         "current_insights": {thought:string, behaviour_and_emotion?:string, useful_information?:string timestamp:string}[],
         "previous_insights": {thought:string, behaviour_and_emotion?:string, useful_information?:string timestamp:string}[]
      }
      `,
    },
  ]
  const response = await openai.responses.create({
    model: model,
    input: [
      ...messages,
      {
        role: "user",
        content: `${prevInsightText}
        Currently said:${content}. 
        This is the conversation with the user, use conversation context from "current insights" if needed using timestamps and topics.
        
        Update facts, previous/current insights as previously mentioned.
        Current Time: ${new Date().toISOString()}

        Response should be JSON object with no other text.
        `
      },
    ]
  })
  await supabase.from("profile").upsert({count, user_id: user.id, insight: response.output_text});
}


async function handleGenerateInsights({req}:{req:Request}) {
  const authHeader = req.headers.get('Authorization')!;
  const token = authHeader.replace('Bearer ', '');
  const {data:{user}} = await supabase.auth.getUser(token);
  if (user === null) {
    throw new Error("Unauthorized");
  }
  const profileData = await supabase.from("profile").select().eq("user_id", user.id).single();
  const { content } = await req.json();
  
  if (!content) {
    throw new Error("Content is required");
  }

  await generateInsights(content, user, profileData.data);
  return new Response(
    JSON.stringify({ message: "Insights generated" }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200
    }
  );
}

async function handleCompletion({req, user}:{req:Request, user:User}){
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
      content: `
        Previous Insights about user: ${profileData.data.insight} Current time: ${new Date().toISOString()}
        Insights are timestamped, Time and Events matter a lot.
        `

    })
  }

  const { content, chat_id, prevMessages }:{prevMessages:Message[], content:string, chat_id:string} = await req.json();
  messages.push(...prevMessages)

  const { data: chatCount } = await supabase
    .from("chat")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .eq("role", "user");

  if ((chatCount !== null) && (user.id != "df824b56-d474-456e-bd71-2a44fa4248d5") && (chatCount.length > 50)) {
    return new Response(
      JSON.stringify({ error: "Chat limit exceeded" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        }
      }
    );
  }

  let data = await supabase.from("chat").insert({
    chat_id,
    user_id: user.id,
    role: "user",
    content,
  }).select();

  if (data.data === null) {
    throw new Error("Failed to insert user message");
  }

  fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai/generate-insights`, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify({content})
  })

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