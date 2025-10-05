const preventDefaultPropagation = (
  e: React.MouseEvent<HTMLElement, MouseEvent>,
) => {
  e.nativeEvent.stopImmediatePropagation();
  e.nativeEvent.preventDefault();
  e.preventDefault();
  e.stopPropagation();
};

type PropagationStopperProps = React.HTMLAttributes<HTMLDivElement>;

const PropagationStopper = ({
  children,
  onClick,
  ...props
}: PropagationStopperProps) => {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <_>
    // biome-ignore lint/a11y/useKeyWithClickEvents: <_>
    <div
      {...props}
      onClick={(e) => {
        preventDefaultPropagation(e);
        if (onClick) onClick(e);
      }}
    >
      {children}
    </div>
  );
};

export { PropagationStopper };
