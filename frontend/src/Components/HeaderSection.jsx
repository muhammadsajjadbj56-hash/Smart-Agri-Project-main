import React from 'react';
import "@fontsource/open-sans";

import logo from '../Images/logo.png';
function HeaderSection() {
    return (
        <div className='slide-right header-shell'>
            <img className="header-logo" src={logo} alt="Agri Assist logo" />
            <span className="header-brand">Smart AGRI </span>
        </div>
    )
}
export default HeaderSection;