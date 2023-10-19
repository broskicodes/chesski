import { PropsWithChildren, useMemo } from "react";

interface Props extends PropsWithChildren {
  className?: string;
  width?: number;
  height?: number;
  px?: boolean;
}

export const SizedDiv = ({ children, className, width, height, px }: Props) => {
  const size = useMemo(() => {
    const sizeProps: { [key: string]: string | undefined } = {};

    sizeProps["height"] = height ? `${height}${px ? "px" : "em"}` : undefined;
    sizeProps["width"] = width ? `${width}${px ? "px" : "em"}` : undefined;

    return sizeProps;
  }, [height, width, px]);

  return (
    <div className={className} style={size}>
      {children}
    </div>
  );
};
