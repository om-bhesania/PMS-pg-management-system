import React from 'react'
import useScreenSize from './../hooks/useScreenSize';

const SmallScreenAlert = () => {
    const screenSize = useScreenSize(); 
    return (
        <>
            {screenSize.width > 1024 ? null :
                <div className='fixed top-0 w-full bg-danger text-white text-center text-3xl p-6 z-[2]'>
                    Please use a larger screen for better experience
                </div>
            }
        </>
    )
}

export default SmallScreenAlert