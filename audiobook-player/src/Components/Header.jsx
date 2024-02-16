/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { NavLink } from 'react-router-dom'


function Header({ setIsAuthenticated }) {

  function logout() {
    setIsAuthenticated(false);
  }

return (
<div className='fixed top-0 w-full h-16 max-h-16 bg-slate-700 z-10 drop-shadow-xl' >
  <nav class="flex items-center justify-between flex-wrap bg-slate-700 p-4">
    <div class="flex items-center flex-shrink-0 text-white mr-6">
      <NavLink to={'/'}>
      <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.75rem', paddingRight: '0.5em' }} viewBox="0 0 512 512">
        <path fill='white' d="M256 80C149.9 80 62.4 159.4 49.6 262c9.4-3.8 19.6-6 30.4-6c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48c-44.2 0-80-35.8-80-80V384 336 288C0 146.6 114.6 32 256 32s256 114.6 256 256v48 48 16c0 44.2-35.8 80-80 80c-26.5 0-48-21.5-48-48V304c0-26.5 21.5-48 48-48c10.8 0 21 2.1 30.4 6C449.6 159.4 362.1 80 256 80z" />
      </svg>    
      </NavLink>
      <NavLink to={'/'}>
        <h1 class="font-semibold text-xl tracking-tight">PlayerJR</h1>
      </NavLink>
      <NavLink to={'/addbook'}>
        <a class="pl-6 inline-block text-m text-white hover:text-slate-400">Add Book</a>
      </NavLink>
    </div>
    <a class="inline-block text-m text-white hover:text-slate-400" onClick={logout}>Logout</a>
  </nav>
</div>
);
}
export default Header;