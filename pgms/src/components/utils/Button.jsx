import { Link } from "react-router-dom";

const Button = ({ role, label, variant, customClass, url, onClick,type }) => {
  const style = {
    primary:
      "bg-primary text-white hover:outline-primary hover:outline hover:text-primary hover:bg-transparent",
    outline:
      "border-primary text-secondary border-2  hover:bg-primary hover:text-white",
    secondary: "bg-secondary text-white",
    danger: "bg-danger text-white",
    warning: "bg-warning text-white",
    success: "bg-success text-white",
    info: "bg-info text-white",
    light: "bg-light text-white",
    dark: "bg-dark text-white",
    link: "text-primary",
  };

  const baseStyle =
    "py-2 px-6 mx-[16px] rounded font-medium text-lg text-center transition duration-300 font-bold";
  return (
    <>
      {role === "button" ? (
        <button
          className={`${style[variant]} ${customClass ? customClass : ''} ${baseStyle ? baseStyle : ''} role--${role}`}
          onClick={onClick}
          type={type}
          href={url}
        >
          {label}
        </button>
      ) : (
        <Link
          className={`${style[variant]} || ${baseStyle} ${customClass} role--${role}`}
          to={url}
          onClick={onClick}
        >
          {label}
        </Link>
      )}
    </>
  );
};

export default Button;
