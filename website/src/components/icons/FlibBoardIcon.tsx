import { Icon, IconProps } from "../display/Icon";

export const FlipBoardIcon = ({ height }: IconProps) => {
  return (
    <Icon height={height}>
      <path d="M0 32v448h448V32H0zm358.4 179.2h-89.6v89.6h-89.6v89.6H89.6V121.6h268.8v89.6z" />
    </Icon>
  );
};
