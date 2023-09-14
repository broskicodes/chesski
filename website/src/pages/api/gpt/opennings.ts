import { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextApiResponse } from "next";
import { CompletionCreateParams } from "openai/resources/chat";

export const runtime = "edge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const functionDefinitions: CompletionCreateParams.Function[] = [
  {
    name: "setOpenningPosition",
    description: "set the position on the board to the desired openning",
    parameters: {
      type: "object",
      properties: {
        moves: {
          description: "the list of moves that result in the openning position",
          type: "array",
          items: {
            type: "string",
          },
          uniqueItems: true,
        },
        orientation: {
          description: "the side the user plays as",
          type: "string",
          enum: ["white", "black"],
        },
      },
      required: ["moves", "orientation"],
    },
  },
  {
    name: "resetGame",
    description: "reset the game over to the starting position",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "startEngine",
    description:
      "turn on the engine and set its skill level to play against the user",
    parameters: {
      type: "object",
      properties: {
        difficultyLevel: {
          description: "the skill level of the engine the user will face",
          type: "string",
          enum: [
            "Beginner",
            "Intermediate",
            "Experienced",
            "Advanced",
            "Master",
          ],
        },
      },
      required: ["difficultyLevel"],
    },
  },
  {
    name: "stopEngine",
    description: "turn off the engine",
    parameters: {
      type: "object",
      properties: {},
    },
  },
];

const post = async (req: Request) => {
  const { messages, moves } = await req.json();
  const systemMessage = {
    role: "system",
    content:
      "you are an assistant that plays chess against a user in an openning they choose. you control the game board, you can set and reset the position. do not include move numbers when listing chess moves. assume user play white unless they specify.",
  };
  const posInitMsg = {
    role: "user",
    content: `moves played in the current game: ${moves.join(" ")}`,
  };

  // Request the OpenAI API for the response based on the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [systemMessage, ...messages, posInitMsg],
    max_tokens: 500,
    temperature: 0,
    functions: functionDefinitions,
    function_call: "auto",
    // top_p: 1,
    // frequency_penalty: 1,
    // presence_penalty: 1,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {});

  // Respond with the stream
  return new StreamingTextResponse(stream);
};

const handler = async (req: Request, res: NextApiResponse) => {
  if (req.method === "POST") {
    return await post(req);
  }
};

export default handler;
