import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  PropsWithChildren,
} from "react";

interface ButtonProps
  extends PropsWithChildren,
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    > {
      inverted?: boolean;
    }

export const Button = (props: ButtonProps) => {
  return (
    <button
      {...props}
      className={`py-2 px-4 rounded-lg ${
        props.disabled ? `${props.inverted ? "outline outline-2 outline-gray-400/75" : "bg-gray-400/75"}` : `${props.inverted ? "outline outline-2 outline-red-400 hover:bg-red-300" : "bg-red-400 hover:bg-red-400/75"}`
      } ${props.className}`}
    >
      {props.children}
    </button>
  );
};
