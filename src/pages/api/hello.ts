/***
 * import
 */
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

/***
 *Interface & Type
 */

/**
 * Constant
 */

/**
 * Program
 */

// Next.js API Route
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Add this to handle CORS preflight requests
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  // Handle the request
  if (req.method === "POST") {
    // Your POST handler logic

    const userInput = req.body.key1;

    let definitionText = "日本語で回答してください";

    console.log(userInput);

    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "assistant", content: definitionText },
        { role: "user", content: userInput },
      ],
      temperature: 0.9,
      max_tokens: 300,
    };

    try {
      const openaiResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CHAT_GPT_KEY}`,
          },
        }
      );
      res
        .status(200)
        .json({ message: openaiResponse.data.choices[0].message.content });
    } catch (error: any) {
      console.error("Error calling OpenAI API:", error?.response?.data);
      res.status(500).json({ error: "Error calling OpenAI API" });
    }
  } else if (req.method === "GET") {
    // Your GET handler logic
    res.status(200).json({ name: "John Doe" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
