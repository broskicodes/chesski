import { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatCompletionCreateParams } from "openai/resources/chat";

export const runtime = "edge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const functionDefinitions: ChatCompletionCreateParams.Function[] = [
  // {
  //   name: "updateBoardPos",
  //   description:
  //     "update the position on the player's board. place the pieces, draw arrows and highlight square",
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       moves: {
  //         description:
  //           "the list of moves that result in the new board position.",
  //         type: "array",
  //         items: {
  //           type: "string",
  //         },
  //         uniqueItems: true,
  //       },
  //       highlightedSquares: {
  //         description: "list of squares to highlight on the board",
  //         type: "array",
  //         items: {
  //           type: "string",
  //         },
  //         uniqueItems: true,
  //       },
  //       arrows: {
  //         description:
  //           "list of arrows to display on the board. each arrow is a tuple of 2 squares",
  //         type: "array",
  //         items: {
  //           type: "array",
  //           items: {
  //             type: "string",
  //           },
  //           uniqueItems: true,
  //         },
  //         uniqueItems: true,
  //       },
  //     },
  //     required: ["moves", "highlightedSquares", "arrows"],
  //   },
  // },
  {
    name: "generateUserSuggestions",
    description:
      "generate suggested questions that the user could ask the ai assistant based on the provided conversation history",
    parameters: {
      type: "object",
      properties: {
        suggestions: {
          description: "a list of 3 suggesttions for the user",
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              prompt: {
                description:
                  "the suggested prompt that the user should ask the assistant",
                type: "string",
              },
              title: {
                description:
                  "a 1 to 3 word desription that summarizes the prompt",
                type: "string",
              },
            },
          },
        },
      },
      required: ["suggestions"],
    },
  },
];

export const post = async (req: Request) => {
  const { messages, fullPgn, boardPos } = await req.json();

  // console.log(messages.at(-1));

  //   const systemMessage = {
  //     role: "system",
  //     content: `You are responsible for updating the position on a chess board. You will be given the PGN of a finished chess game, the current position on the board and a message. Based on the message you must determine how to update the board. If a move number is mentioned update the board to display the position after the move was made.`,
  //   };

  //   const userMsg = {
  //     role: "user",
  //     content: `Here is the full pgn for the game that was played: ${fullPgn}\n
  // Here is the current board position: ${boardPos}.
  // Here is the message: ${messages.at(-1).content}.`,
  //   };

  // console.log(messages);
  const systemMessage = {
    role: "system",
    content: `Your job is to intepret a conversation between a user and an assistant and decide on 3 possible continuations from the user's perspective. the topic on conversation is a chess game that the user is interested in reviewing. suggest prompts that will help the user enhance their understanding of the specific position, as well as chess general principles and concepts. Make suggestions as specific to the position and chat hsitory as possible.
Here is the full pgn for the game that was played: ${fullPgn}\n
Here is the current board position: ${boardPos}.

Here is the relevant converstaion history:
${messages.slice(-3).map((msg: any) => `${msg.role}: ${msg.content}\n`)}
`,
  };

  const userMsg = {
    role: "user",
    content: "give me suggestions",
  };
  // Request the OpenAI API for the response based on the prompt
  // @ts-ignore
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [systemMessage, userMsg],
    temperature: 0,
    functions: functionDefinitions,
    function_call: { name: "generateUserSuggestions" },
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
