import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import { LayoutDashboard, PenBox } from 'lucide-react'
import { checkUser } from '@/lib/checkUser'

const Header = async() => {
  await checkUser();


  return (
    <div className="fixed top-0 w-full bg-white backdrop-blur-md z-50 border-b">
      <nav className="w-auto px-3 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/">
          <Image 
            src={"/finixlogosmall.png"}
            priority 
            alt="Finix logo" 
            width={160} 
            height={72} 
            className="h-8 w-auto object-contain"
          />
        </Link>
        
        {/* Right side buttons */}
        <div className='flex items-center space-x-4'>

          <SignedIn>
            <Link href={"/dashboard"}>
              <Button className="border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4] hover:text-white transition flex items-center gap-2">
                <LayoutDashboard size={18}/>
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>

            <Link href={"/transaction/create"}>
              <Button className="border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4] hover:text-white transition flex items-center gap-2">
                <PenBox size={18}/>
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl='/dashboard'>
              <Button className="bg-[#06b6d4] text-white hover:bg-[#0891b2] transition">
                Login
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "!w-9 !h-9",
                }
              }}
            />  
          </SignedIn>

        </div>
      </nav>
    </div>
  )
}

export default Header
