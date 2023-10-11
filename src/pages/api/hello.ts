/***
 * import
 */
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { DynamoDB } from "aws-sdk"; // 追加

/***
 *Interface & Type
 */

/**
 * Constant
 */

/**
 * Program
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const tableName = process.env.DYNAMO_TABLE_NAME;
  if (!tableName) {
    res.status(500).json({ error: "DynamoDB table name is not set" });
    return;
  }

  if (req.method === "POST") {
    const userInput = req.body.key1;
    let definitionText = "日本語で回答してください";

    try {
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "assistant", content: definitionText },
          { role: "user", content: userInput },
        ],
        temperature: 0.9,
        max_tokens: 300,
      };

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

      const dynamoDb = new DynamoDB.DocumentClient();
      const item = {
        id: `${Date.now()}`,
        userInput: userInput,
        openAiOutput: openaiResponse.data.choices[0].message.content,
        timestamp: new Date().toISOString(),
      };

      const params = {
        TableName: tableName,
        Item: item,
      };

      await dynamoDb.put(params).promise();

      res.status(200).json({
        message: openaiResponse.data.choices[0].message.content,
      });
    } catch (error: any) {
      console.error("Error:", error?.response?.data || error.message);
      res.status(500).json({ error: "Error processing your request" });
    }
  } else if (req.method === "GET") {
    res.status(200).json({ name: "John Doe" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
