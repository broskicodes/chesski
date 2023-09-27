import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  PropsWithChildren,
} from "react";

interface Props
  extends PropsWithChildren,
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    > {}

export const Action = (props: Props) => {
  return (
    <button
      {...props}
      className={`flex flex-row whitespace-nowrap py-1 px-2 rounded-lg outline outline-1 outline-red-400 text-red-400 hover:bg-red-300 hover:text-white`}
    >
      {props.children}
    </button>
  );
};
