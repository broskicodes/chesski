import { useGpt } from "../../providers/GptProvider";
import { Action } from "../display/Action";

export const Suggestions = () => {
  const { suggestions, setInput } = useGpt();

  return (
    <div className={`flex flex-row flex-nowrap justify-end text-xs`}>
      <div className="overflow-x-auto pt-2 pb-1 pl-1 pr-1 custom-scrollbar ">
        <div className="flex space-x-2">
          {suggestions.map((sug, i) => (
            <Action
              key={i}
              onClick={() => {
                setInput(sug.prompt);
              }}
            >
              {sug.title}
            </Action>
          ))}
        </div>
      </div>
    </div>
  );
};
