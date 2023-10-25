import { ChatRequestOptions, Message } from "ai";
import {
  ChangeEvent,
  createContext,
  Dispatch,
  FormEvent,
  SetStateAction,
  useContext,
} from "react";

export interface Suggestion {
  title: string;
  prompt: string;
}

export interface GptProviderContext {
  input: string;
  messages: Message[];
  engineOn: boolean;
  suggestions: Suggestion[];
  setInput: Dispatch<SetStateAction<string>>;
  updateMessages: (msgs: Message[], reset?: boolean) => void;
  appendMessages: (msgs: Message[]) => void;
  submit: (
    e: FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => void;
  updateInput: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  setBody: (body: { [key: string]: any }) => void;
  getInitialSuggestions: () => void;
}

export const GptContext = createContext<GptProviderContext>({
  input: "",
  messages: [],
  engineOn: false,
  suggestions: [],
  setInput: (_prompt) => {
    throw new Error("GptProvider not initialized");
  },
  updateMessages: (_msgs, _reset) => {
    throw new Error("GptProvider not initialized");
  },
  appendMessages: (_msgs) => {
    throw new Error("GptProvider not initialized");
  },
  submit: (_e, _opts) => {
    throw new Error("GptProvider not initialized");
  },
  updateInput: (_e) => {
    throw new Error("GptProvider not initialized");
  },
  setBody: (_body) => {
    throw new Error("GptProvider not initialized");
  },
  getInitialSuggestions: () => {
    throw new Error("GptProvider not initialized");
  },
});

export const useGpt = () => useContext(GptContext);
