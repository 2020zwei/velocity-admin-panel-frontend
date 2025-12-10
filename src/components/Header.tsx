import ProfileDropdown from './ProfileDropdown'
import velocitylogo from "../assets/images/velocitylogo-2 2.svg";
import { Link } from 'react-router-dom';
import Icon from './Icon';
import clsx from 'clsx';
import React from 'react';
interface HeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen:boolean

}
 
const Header = ({ isSidebarOpen,onMenuClick }: HeaderProps) => {
  const[isSearchOpen,setIsSearchOpen]=React.useState(false);
  return (
    <>
      {/* Search */}
      <div className="w-full flex items-center gap-6">
        <div className='min-w-[250px] flex items-center justify-between'><Link to="/"><img src={velocitylogo} alt='velocitylogo' /></Link>
          <button
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10 lg-xl:hidden"
            onClick={onMenuClick}
          ><Icon name={isSidebarOpen?'times':'bars'}/></button>
        </div>
        <div className={clsx("flex items-center gap-2 h-11 px-3 rounded-md w-[300px] md:border border-[#212129] md:relative absolute",isSearchOpen?"!border bg-black-800 w-[75%]":"")}>
          <span className={clsx("opacity-60 md:block hidden",isSearchOpen?"!block":"")}><Icon name='search' /></span>
          <input
            type="text"
            placeholder="Search here..."
            className={clsx("bg-transparent outline-none flex-1 text-white md:block hidden",isSearchOpen?"!block":"")}
          />
           {isSearchOpen&& <span className="opacity-60 md:hidden block" onClick={()=>setIsSearchOpen(false)}><Icon name='times' /></span>}
        </div>
       {!isSearchOpen&& <span className="opacity-60 md:hidden block" onClick={()=>setIsSearchOpen(true)}><Icon name='search' /></span>}
      </div>

      {/* Profile */}
      <div className='w-fit'> <ProfileDropdown /></div>
    </>
  )
}

export default Header