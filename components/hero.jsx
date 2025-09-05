"use client";

import Link from 'next/link'
import React, { useEffect, useRef } from 'react'
import { Button } from './ui/button'
import Image from 'next/image'

const HeroPart = () => {
  
    const imageref= useRef(); //uses reference from the div below for the image

    useEffect(() => {
        const imageElement=imageref.current;

        const handleScroll = () => {
            const scrollY = window.scrollY;
            const rotation = Math.max(0, 15 - scrollY * 0.1); // reduce rotateX as you scroll
            const translateY = Math.min(40, scrollY * 0.2);   // increase translateY as you scroll
          
            imageElement.style.transform = `rotateX(${rotation}deg) translateY(${translateY}px) scale(1.03)`;
            imageElement.style.opacity = `${Math.min(1, 0.8 + scrollY / 300)}`;
          };

        window.addEventListener("scroll",handleScroll)      //addes scroll event to the handleScroll function, thorugh event listener which will trigger everytime you scroll   

        return()=>window.removeEventListener("scroll",handleScroll); //cleans up the scroll event when the component unmounts, when the dom is not visible on the screen, then the listener is also not working 
    }, [])
    
  
    return (
    <div className="pb-20 px-4">
        <div className='container mx-auto text-center'>
            <h1 className='text-5xl md:text-8xl lg:text-[105px] pb-6 gradient gradient-title'>
                Take Control of Your<br/> Finances
            </h1>
            <p className='text-xl text-gray-600 mb-4 max-w-2xl mx-auto'>FinTrack helps you log expenses, analyze spending habits, and reach your financial goals. Your all in one simple, secure app.</p>
            <div className='flex justify-center space-x-4'>
                <Link href="/dashboard">
                <Button size="lg" variant="default" className='px-8'>Get Started</Button>
                </Link>

                <Link href="/dashboard">
                <Button size="lg" variant="outline" className='px-8'>Preview</Button>
                </Link>
            </div>
            <div className='hero-image-wrapper'>
                <div ref={imageref} className="hero-image">
                    <Image
                        src='/banner.png'
                        width={1280}
                        height={720}
                        alt="Dashboard Preview"
                        priority
                        className='shadow-2xl rounded-3xl mx-auto border'
                    ></Image>
                </div>
            </div>
        </div>
    </div>
  )
}

export default HeroPart