import connectDb from "@/lib/db";
import ChatMessage from "@/models/chatMessage.model";
import axios from "axios";

const geminiUrl = process.env.GEMINI_API_URL!;

export async function POST(req: Request) {
  try {
    await connectDb();

    const { lastMessage, role } = await req.json();

    const prompt = `You are an AI reply suggestion system for a vehicle booking chat app.
    
    Generate short, smart, human-like quick reply suggestions based on:
    - Role (DRIVER or USER)
    - RECENT_MESSAGE
    
    Rules:
    - Return exactly 3 suggestions
    - Keep replies short (3-12 words)
    - Match the conversation context and tone
    - Detect the language of RECENT_MESSAGE (e.g. Bangla, Banglish/Avro, English, etc.) and generate all suggestions in that same language and script
    - Driver replies should sound professional and helpful
    - User replies should sound natural and realistic
    - Avoid repetition
    - Return ONLY valid JSON
    
    Outpur format: 
    {
    "suggestions": [
        "Reply 1",
        "Reply 2",
        "Reply 3"
    ]
   }
    
   Input:
   ROLE: ${role}
   RECENT_MESSAGE: ${lastMessage}`;

    const response = await axios.post(geminiUrl, {
      contents: [
        {
          parts: [
            {
              text: `${prompt}`,
            },
          ],
        },
      ],
    });

    const suggestions = response.data.candidates[0].content.parts[0].text;

    return Response.json(suggestions, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `Get ai suggestions error ${error}` },
      { status: 500 },
    );
  }
}
