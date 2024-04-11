import logo from '../../assets/pms-bg.png'
const Logo = ({ customClass }) => {
  return (
    <>
      <img src={logo} alt="logo" className={`max-h-[60px] ${customClass}`} />
    </>
  );
};

export default Logo