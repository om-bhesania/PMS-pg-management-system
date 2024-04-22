import { Link } from "react-router-dom";
import { forwardRef } from "react";
const Button = ({ role, label, variant, customClass, url, onClick, type, icon, ref, id }) => {
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
          className={` ${customClass ? customClass : ''} ${style[variant]} ${baseStyle ? baseStyle : ''} role--${role}`}
          onClick={onClick}
          type={type}
          href={url}
          ref={ref}
          id={id}
        >
          <span className="flex items-center gap-2">
            {icon ? (
              <>
                <i className={icon} />
              </>
            ) : null}
            {label ? label : null}
          </span>
        </button >
      ) : (
        <Link
          className={`${style[variant]} ${baseStyle} ${customClass} role--${role}`}
          to={url}
          onClick={onClick}
          id={id}
        >
          <span className="flex items-center gap-2">
            {icon ? (
              <>
                <i className={icon} />
              </>
            ) : null}
            {label ? label : null}
          </span>
        </Link >
      )}
    </>
  );
};

export default Button;
