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
    > {}

export const Button = (props: ButtonProps) => {
  return (
    <button
      {...props}
      className={`py-2 px-4 rounded-lg ${
        props.disabled ? "bg-gray-400/75" : "bg-red-400 hover:bg-red-400/75"
      } ${props.className}`}
    >
      {props.children}
    </button>
  );
};
