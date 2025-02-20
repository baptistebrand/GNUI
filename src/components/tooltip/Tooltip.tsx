import React, { FunctionComponent, useState, useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import theme from "../../theme";
import { setColor } from "../../utils/setcolor";

interface ITooltip {
  caption: string;
  position?: "left" | "right";
  status?: "danger" | "warning" | "success" | "notification";
  children?: React.ReactNode;
  showTimeout?: number;
  hideTimeout?: number;
  minWidth?: string;
}

const setArrowPosition = (position: string) => {
  switch (position) {
    case "left":
      return `
        left: 0.5rem;
        right: auto;
        margin-left: 0;
        `;
    case "right":
      return `
        left: auto;
        right: 0.5rem;
        margin-left: 0;
        `;
    default:
      return `
        left: 50%;
        margin-left: -0.25rem;
        right:auto;
      `;
  }
};

const TooltipWrapper = styled.div`
  display: inline-block;
`;

type StyledTooltipProps = Pick<ITooltip, "position" | "status" | "minWidth">;

const StyledTooltip = styled.div<StyledTooltipProps>`
  position: absolute;
  min-width: ${({ minWidth }) => minWidth};
  max-width: 16rem;
  font-size: ${theme.fontSizes.sm};
  line-height: 1rem;
  padding: ${theme.spacing.spacing02};
  background-color: ${theme.colors.primary};
  color: ${theme.colors.snowWhite};
  border-radius: ${theme.radius.md};
  z-index: ${theme.zindex.sticky};
  opacity: 0;
  animation: 0.2s ease-in-out both fadeInUp;
  &:after,
  &:before {
    top: 100%;
    left: 50%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }
  &:after {
    border-color: transparent;
    border-top-color: ${theme.colors.primary};
    border-width: 8px;
    margin-left: -8px;
    ${({ position }) =>
      position &&
      css`
        ${setArrowPosition(position)}
      `}
  }

  ${({ status }) =>
    status &&
    css`
      background: ${setColor(status)};
      &:after {
        border-top-color: ${setColor(status)};
      }
    `}

  @keyframes fadeInUp {
    from {
      transform: translate3d(0, -8px, 0);
    }
    to {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }
`;

export const Tooltip: FunctionComponent<ITooltip> = ({
  status,
  position,
  caption,
  children,
  hideTimeout = 100,
  showTimeout = 300,
  minWidth = "0",
}) => {
  const tooltipRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const wrapperRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [isHovered, setHovered] = useState(false);
  const [resetTimer, setTimer] = useState(0);
  const [tooltipPosition, setPosition] = useState({
    marginTop: 0,
    width: 0,
  });

  const showTooltip = () => {
    clearTimeout(resetTimer);
    const timer = () =>
      setTimeout(() => {
        setHovered(true);
      }, showTimeout);
    setTimer(timer);
  };

  const hideTooltip = () => {
    clearTimeout(resetTimer);
    const timer = () =>
      setTimeout(() => {
        setHovered(false);
      }, hideTimeout);
    setTimer(timer);
  };

  useEffect(() => {
    if (isHovered) {
      const tooltipSize = tooltipRef.current.getBoundingClientRect();
      setPosition({
        marginTop: -(tooltipSize.height + 12),
        width: tooltipSize.width,
      });
    }
  }, [tooltipRef, isHovered]);

  return (
    <TooltipWrapper
      ref={wrapperRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {isHovered && (
        <StyledTooltip
          ref={tooltipRef}
          status={status}
          position={position}
          minWidth={minWidth}
          style={
            position === "left"
              ? {
                  marginTop: tooltipPosition.marginTop,
                  left: wrapperRef.current.offsetLeft,
                }
              : position === "right"
              ? {
                  marginTop: tooltipPosition.marginTop,
                  left:
                    wrapperRef.current.offsetLeft -
                    (tooltipPosition.width - wrapperRef.current.offsetWidth),
                }
              : {
                  marginTop: tooltipPosition.marginTop,
                  left: wrapperRef.current.offsetLeft,
                  marginLeft:
                    -(tooltipPosition.width - wrapperRef.current.offsetWidth) /
                    2,
                }
          }
        >
          {caption}
        </StyledTooltip>
      )}
      {children}
    </TooltipWrapper>
  );
};
