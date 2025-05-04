import { FC } from 'react';
import './Header.css';
import logoFuria from '../../assets/logo-furia-header.png';

const Header: FC = () => {
  return (
    <header className="chat-header">
      <img src={logoFuria} alt="Logo FURIA" className="furia-logo" />
    </header>
  );
};

export default Header;