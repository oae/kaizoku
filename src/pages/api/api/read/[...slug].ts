import * as fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // const imagePath = req;
  if (process.env.ENABLE_PDF) {
    const { slug } = req.query;
    if (slug) {
      const title = slug[0].split('&')[0].split('=')[1];
      const fileName = slug[0].split('&')[1].split('=')[1];

      if (fileName.split('.')[1] !== 'pdf') res.send('ERR: Incorrect File type. File is not of type application/pdf');

      const filePath = path.resolve(`/data/${title}/${fileName}`);
      const imageBuffer = fs.readFileSync(filePath);
      res.setHeader('Content-Type', 'application/pdf');
      return res.send(imageBuffer);
    }
  }

  return res.send('PDF Preview not enabled, set ENABLE_PDF=true in your ENV and relaunch the container!');
}
