// pages/api/lichess-stream.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { ServerSentEvent } from 'types'; // Define this type according to Lichess API response

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Create a new EventSource instance to connect to Lichess API
  const lichessStream: EventSource = new EventSource('LICHESS_STREAM_API_ENDPOINT', {
    // headers: {
    //   'Authorization': `Bearer YOUR_API_TOKEN`, // Replace with your token
    // },
  });

  lichessStream.onmessage = (event: MessageEvent) => {
    // Parse the data and send it to the client
    const data: ServerSentEvent = JSON.parse(event.data);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  lichessStream.onerror = (event: MessageEvent) => {
    console.error('Stream encountered error', event);
    lichessStream.close();
    res.end();
  };

  req.on('close', () => {
    lichessStream.close();
    res.end();
  });
}
