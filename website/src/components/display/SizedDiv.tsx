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

    if (height) {
      sizeProps["minHeight"] = `${height}${px ? "px" : "em"}`;
      sizeProps["maxHeight"] = `${height}${px ? "px" : "em"}`;
    }
    if (width) {
      sizeProps["minWidth"] = `${width}${px ? "px" : "em"}`;
      sizeProps["maxWidth"] = `${width}${px ? "px" : "em"}`;
    }

    return sizeProps;
  }, [height, width, px]);

  return (
    <div className={className} style={size}>
      {children}
    </div>
  );
};
