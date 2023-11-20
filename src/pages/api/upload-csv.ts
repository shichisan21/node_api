import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { Readable } from "stream";
import csvParser from "csv-parser";

// メモリストレージを使用する multer の設定
const upload = multer({ storage: multer.memoryStorage() });

// multerを使ったファイル処理をPromiseとしてラップする
const processFile = upload.single("file");

const processFileMiddleware = (req: any, res: any) => {
  return new Promise<void>((resolve, reject) => {
    processFile(req, res, (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
};

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
    return;
  }

  // POSTリクエストの処理
  if (req.method === "POST") {
    try {
      // multerミドルウェアを実行
      await processFileMiddleware(req, res);

      // req.fileにアクセスする前にmulterミドルウェアが完了していることを確認
      const file = (req as any).file;
      if (!file) {
        res.status(400).send("ファイルがアップロードされていません。");
        return;
      }

      // ファイルバッファを取得
      const buffer = file.buffer;
      const data_array: string[][] = [];
      const fileName = req.body.fileName;
      console.log("PROCESSING FILE NAME", fileName);

      // CSVデータを解析
      Readable.from(buffer)
        .pipe(csvParser())
        .on("data", (data) => data_array.push(data))
        .on("end", () => {
          res.status(200).json({
            message: "CSVファイルを受信し、処理しました。",
            data: data_array,
          });
        });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // POSTメソッド以外のリクエストに対する処理
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: false, // bodyParser を無効化（multer を使用）
  },
};
