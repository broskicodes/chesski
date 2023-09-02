import { PropsWithChildren } from "react";

export interface IconProps {
  height: number;
}

export const Icon = ({ height, children }: IconProps & PropsWithChildren) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={`${height}em`}
      viewBox="0 0 512 512"
    >
      {children}
    </svg>
  );
};
