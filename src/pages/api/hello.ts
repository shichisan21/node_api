/***
 * import
 */
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  ScanCommand,
  DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

/***
 *Interface & Type
 */
interface Item {
  timestamp: string;
  // 他のプロパティもここに追加できます
}
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

  if (req.method === "GET") {
    try {
      const dbClient = new DynamoDBClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

      const params = {
        TableName: tableName,
      };

      const command = new ScanCommand(params);
      const data = await dbClient.send(command);

      const sortedItems = data.Items.sort((a: Item, b: Item) => {
        return b.timestamp.localeCompare(a.timestamp);
      });

      const latestItems = sortedItems.slice(0, 2);
      res.status(200).json({ items: latestItems });
    } catch (error: any) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Error fetching data" });
    }
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

      // リージョンとアクセスキーを設定
      const dbClient = new DynamoDBClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

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

      const command = new PutCommand(params);
      await dbClient.send(command); // データをDynamoDBに書き込む

      res.status(200).json({
        message: openaiResponse.data.choices[0].message.content,
      });
    } catch (error: any) {
      console.error("Error:", error?.response?.data || error.message);
      res.status(500).json({ error: "Error processing your request" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
