import React from 'react'
import { MdOutlineDarkMode, MdOutlineLightMode } from 'react-icons/md'

const ThemeSwitcher = ({className}:{className?:string}) => {
  return (
    <div className={className}>
      <MdOutlineDarkMode className='flex-none w-6 h-6'/>
      {/* <MdOutlineLightMode/> */}
    </div>
  )
}

export default ThemeSwitcher