import ProfileDropdown from './ProfileDropdown'
import velocitylogo from "../assets/images/velocitylogo-2 2.svg";
import { Link } from 'react-router-dom';
import Icon from './Icon';
import React from 'react';
interface HeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen: boolean

}

const Header = ({ isSidebarOpen, onMenuClick }: HeaderProps) => {
 
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  return (
    <>
      {/* Search */}
      <div className="w-full flex items-center gap-6">
        {!isSearchOpen &&
          <div className='sm:min-w-[254px] flex items-center justify-between'><Link to="/"><img src={velocitylogo} alt='velocitylogo' /></Link>
            <button
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10 lg-xl:hidden relative z-[10000]"
              onClick={onMenuClick}
            ><Icon name={isSidebarOpen ? 'times' : 'bars'} /></button>
          </div>}
        {!isSearchOpen && <span className="opacity-60 md:hidden block" onClick={() => setIsSearchOpen(true)}><Icon name='search' /></span>}
      </div>

      {/* Profile */}
      {!isSearchOpen && <div className='w-fit'> <ProfileDropdown /></div>}
    </>
  )
}

export default Header