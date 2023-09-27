import { ChatRequestOptions, Message } from "ai";
import { ChangeEvent, createContext, FormEvent, useContext } from "react";

export interface GptProviderContext {
  input: string;
  messages: Message[];
  engineOn: boolean;
  updateMessages: (msgs: Message[], reset?: boolean) => void;
  appendMessages: (msgs: Message[]) => void;
  submit: (
    e: FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => void;
  updateInput: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => void;
}

export const GptContext = createContext<GptProviderContext>({
  input: "",
  messages: [],
  engineOn: false,
  updateMessages: (_msgs, _reset) => {
    throw new Error("GptProvider not initialized");
  },
  appendMessages: (_msgs) => {
    throw new Error("GptProvider not initialized");
  },
  submit: () => {
    throw new Error("GptProvider not initialized");
  },
  updateInput: () => {
    throw new Error("GptProvider not initialized");
  },
});

export const useGpt = () => useContext(GptContext);
