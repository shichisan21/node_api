/***
 * import
 */
import { NextApiRequest, NextApiResponse } from "next";

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
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // Or your client app's origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle the request
  if (req.method === "POST") {
    // Your POST handler logic
    res.status(200).json({ status: "success" });
  } else if (req.method === "GET") {
    // Your GET handler logic
    res.status(200).json({ name: "John Doe" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
