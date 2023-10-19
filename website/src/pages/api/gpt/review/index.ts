import { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { CompletionCreateParams } from "openai/resources/chat";

export const runtime = "edge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// const functionDefinitions: CompletionCreateParams.Function[] = [
//   {
//     name: "updateBoardPos",
//     description: "update the position on the player's board. place the pieces, draw arrows and highlight square",
//     parameters: {
//       type: "object",
//       properties: {
//         position: {
//           description: "the fen string for the new board position",
//           type: "string",
//         },
//         highlightedSquares: {
//           description: "list of squares to highlight on the board",
//           type: "array",
//           items: {
//             type: "string"
//           },
//           uniqueItems: true,
//         },
//         arrows: {
//           description: "list of arrows to display on the board. each arrow is a tuple of 2 squares",
//           type: "array",
//           items: {
//             type: "array",
//             items: {
//               type: "string"
//             },
//             uniqueItems: true,
//           },
//           uniqueItems: true,
//         },
//       },
//       required: ["position", "highlightedSquares", "arrows"],
//     },
//   },
// ];

export const post = async (req: Request) => {
  const { messages, orientation, fullPgn, boardPos } = await req.json();
  const systemMessage = {
    role: "system",
    content: `you are a professional chess coach. you help players review their games. 
the player may ask you about a position they are seeing on a chess board. In this case use the provided fen string to visualize the position and assist the player.
let the player direct conversation and keep your responses short and to the point.

this is the game, the user played as ${orientation}

${fullPgn}

position on player's board: ${boardPos}`,
  };

  // console.log()

  const newMsgs = [systemMessage, ...messages];

  // Request the OpenAI API for the response based on the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    stream: true,
    messages: newMsgs,
    // max_tokens: 500,
    temperature: 0,
    // functions: functionDefinitions,
    // function_call: "auto",
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  // Convert the response into a friendly text-stream
  // @ts-ignore
  const stream = OpenAIStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream, {
    status: 200,
  });
};

const handler = async (req: Request, _res: Response) => {
  if (req.method === "POST") {
    return await post(req);
  } else if (req.method === "OPTIONS") {
    return new Response(undefined, {
      status: 200,
      headers: {
        // 'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Origin": "https://chesski.lol",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
};

export default handler;
