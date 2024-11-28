import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {RiUserLine } from "react-icons/ri"
import logo from "../assests/img/logo.svg"

const Header = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  return (
    <>
     {/* desktop and table version */}
    <div className='w-full bg-[#E1F7FF] hidden sm:flex justify-center border-b border-gray-300'>
    <header className='md:w-4/5 flex flex-row items-center sm:gap-8 md:gap-10 lg:gap-16 py-4'>
        <div className='min-w-[56px] flex flex-row items-center'>
          <NavLink to={""}><img src={logo} alt="" className="w-14"/></NavLink>
          <NavLink to={""} className={`flex h-[30px] text-center`}>SabaiDee Bó</NavLink>
        </div>
        <nav className='flex gap-10 lg:gap-16 ms-auto '>
            {token && (<>
              <NavLink to={"greetword"} className={({ isActive }) => `flex items-center text-[16px] w-auto text-center px-3 pt-1 pb-2 rounded-[50px] ${isActive ? "text-[#fff] font-bold bg-sky-800" : ""} `}>Greet Word</NavLink>
              <NavLink
                to={'student'}
                className={`
                  flex items-center text-[16px] w-auto text-center px-3 pt-1 pb-2 rounded-[50px]
                  ${location.pathname === '/student' || location.pathname.includes('/studentadd') ? 'text-[#fff] font-bold bg-sky-800' : ''}
                `}
              >
                Student
              </NavLink>
              <NavLink to={"report"} className={({ isActive }) => `flex items-center text-[16px] w-auto text-center px-3 pt-1 pb-2 rounded-[50px] ${isActive ? "text-[#fff] font-bold bg-sky-800" : ""} `}>Report</NavLink>
            </>)}
        </nav>
        <nav className='text-xl text-slate-500 border p-1 rounded-full border-slate-500'>
        {token ? (
          <NavLink to={"profile"}><RiUserLine /></NavLink>
        ) : (
          <NavLink to={"login"}><RiUserLine /></NavLink>
        )}
        </nav>
    </header>
</div>
</>
  )
}

export default Header