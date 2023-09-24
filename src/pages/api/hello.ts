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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  console.log("req", req);
  res.status(200).json({ name: "John Doe" });
}
