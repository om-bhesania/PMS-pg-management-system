const Title = ({ children, size, customClass, customSize, colorTheme }) => {
  const baseStyle =
    "font-bold text-primaryDark  font-primary text-primary bg-transparent";
  const color = {
    primary: "text-primary",
    secondary: "text-secondary",
    light: "text-white",
    danger: "text-danger",
    success: "text-success",
    info: "text-info",
  };
  const style = {
    sm: "text-[14px]",
    md: "text-[16px]",
    lg: "text-[24px]",
    xl: "text-3xl",
    custom: `${customSize}`,
  };
  return (
    <>
      <div
        className={`${customClass ? customClass : ""} ${baseStyle} ${
          style[size]
        } ${color[colorTheme]} `}
      >
        {children}
      </div>
    </>
  );
};

export default Title;
