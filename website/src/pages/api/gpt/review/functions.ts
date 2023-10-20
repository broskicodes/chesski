import { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatCompletionCreateParams } from "openai/resources/chat";

export const runtime = "edge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const functionDefinitions: ChatCompletionCreateParams.Function[] = [
  {
    name: "updateBoardPos",
    description:
      "update the position on the player's board. place the pieces, draw arrows and highlight square",
    parameters: {
      type: "object",
      properties: {
        moves: {
          description:
            "the list of moves that result in the new board position.",
          type: "array",
          items: {
            type: "string",
          },
          uniqueItems: true,
        },
        highlightedSquares: {
          description: "list of squares to highlight on the board",
          type: "array",
          items: {
            type: "string",
          },
          uniqueItems: true,
        },
        arrows: {
          description:
            "list of arrows to display on the board. each arrow is a tuple of 2 squares",
          type: "array",
          items: {
            type: "array",
            items: {
              type: "string",
            },
            uniqueItems: true,
          },
          uniqueItems: true,
        },
      },
      required: ["moves", "highlightedSquares", "arrows"],
    },
  },
];

export const post = async (req: Request) => {
  const { messages, fullPgn, boardPos } = await req.json();

  // console.log(messages.at(-1));

  const systemMessage = {
    role: "system",
    content: `You are responsible for updating the position on a chess board. You will be given the PGN of a finished chess game, the current position on the board and a message. Based on the message you must determine how to update the board. If a move number is mentioned update the board to display the position after the move was made.`,
  };

  const userMsg = {
    role: "user",
    content: `Here is the full pgn for the game that was played: ${fullPgn}\n
Here is the current board position: ${boardPos}.
Here is the message: ${messages.at(-1).content}.`,
  };

  // console.log()

  // Request the OpenAI API for the response based on the prompt
  // @ts-ignore
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    stream: true,
    messages: [systemMessage, userMsg],
    temperature: 0,
    functions: functionDefinitions,
    function_call: { name: "updateBoardPos" },
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