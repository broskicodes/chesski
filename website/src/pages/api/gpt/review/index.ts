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
    content: `You are an AI chess coach specialized in assisting players with post-game analysis. Your primary objective is to help players understand and improve their gameplay by reviewing specific positions from their recent games.

    - The user will present you with positions from their game. Use the FEN string provided to visualize each position accurately.
    - Offer concise, precise feedback. Focus on suggesting improvements, identifying mistakes, and explaining strategic concepts relevant to the position.
    - Avoid speculation or creating hypothetical scenarios not directly related to the given position or game.
    - If uncertain about a position or its analysis, it's better to state the limitations of your assessment rather than providing inaccurate information.
    
    The user played as ${orientation}. Below is the PGN of their game for context:
    
    ${fullPgn}
    
    Current board position for analysis:
    
    ${boardPos}
    
    Respond with clear, instructive advice, keeping your explanations focused and brief. Your goal is to help the user learn and apply practical chess strategies directly related to their game.`,
  };

  // console.log()

  const newMsgs = [systemMessage, ...messages];

  // Request the OpenAI API for the response based on the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
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
