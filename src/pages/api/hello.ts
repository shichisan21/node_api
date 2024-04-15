import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosResponse } from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS設定
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONSリクエストの処理
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // GETリクエストの処理
  if (req.method === "GET") {
    res.status(200).json({ message: "疎通確認OK" });

    try {
      const response: AxiosResponse<any> = await axios.get(
        "http://127.0.0.1:3000/api/hello"
      );
      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Upload error:", error);
    }

    return;
  }
}
