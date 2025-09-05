"use client";

import React, { useEffect, useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from 'react-hook-form';
import { accountSchema } from '@/app/lib/schema';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { createAccount } from '@/actions/DashboardAccount';
import useFetch from '@/hooks/use-fetch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CreateAccountTab = ({children}) => { //whatever is inside children will render inside the drawerTrigger as we will be using this component in multiple places so we need to use children property
    //whatever is between the starting and closing tag is the child, so in page.jsx of dashboard where CreateAccountTab is used, we wrote <CreateAccountTab>open</CreateAccountTab> so open is the child.
    const[open,setOpen]=useState(false);  //by default the tab is closed
    
    //register is important as this is what will connect our form to a react hook form
    const { register,handleSubmit,formState:{errors},setValue,watch,reset }=useForm({
        resolver:zodResolver(accountSchema), //lets us connect to the zod schema that we created
        defaultValues: {
            name:"",
            type: "CURRENT",
            balance: "",
            isDefault: false,
        },
    })

    //useFetch hook that we created
    //createAccount is the server action that we created in the actions folder
    const {data:newAccount,
        error,
        fn: createAccountfn,
        loading:CreateAccountLoading
    }=useFetch(createAccount)


    const onSubmit=async(data)=>{
        await createAccountfn(data);
    }

    //now if account created we send a toaster to show account creation successful, we will use useEffect hook
    useEffect(()=>{
        //if newAccount from useFetch(createAccount) has any changes, and it is not loading then success
        if(newAccount && !CreateAccountLoading){
            toast.success("Account Created Successfully")
            reset(); //reset the form
            setOpen(false); //clase the account creation tab
        }
    },[CreateAccountLoading,newAccount])

    //if error in account creating, then we send a toaster to show the error, again using useEffect
    useEffect(()=>{
        if(error){
            toast.error(error.message || "Account Creation Failed");
        }   
    },[error])


    return (
    <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger>{children}</DrawerTrigger>
        <DrawerContent>
            <DrawerHeader className="items-start">
                <DrawerTitle>Create New Account</DrawerTitle>
            </DrawerHeader>
        
        <div className='px-4 pb-4'>
            <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
                <div className='space-y-2'>
                    <label htmlFor='name' className='text-sm font-medium'>Account Name</label>
                    <Input id='name' placeholder="e.g. Axis Account"
                    {...register("name")} /*this is to connect it to react hook form*/
                    />
                    {errors.name && (
                        <p className='text-sm text-red-600'>{errors.name.message}</p>
                    )}
                </div>
                
                <div className='space-y-2'>
                    <label htmlFor='type' className='text-sm font-medium'>Account Type</label>
                    {/* we get the value whenever the dropdown/select value is changed then we send it to setValue parameter and change the value of "TYPE" and watch is used so that it gets updated instantly */}
                    <Select onValueChange={(value)=>setValue("type",value)}
                        defaultValue={watch("type")}> 
                    <SelectTrigger id='type' className="w-full">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="CURRENT">Current</SelectItem>
                        <SelectItem value="SAVINGS">Savings</SelectItem>
                    </SelectContent>
                    </Select>

                    {errors.type && (
                        <p className='text-sm text-red-600'>{errors.type.message}</p>
                    )}
                </div>
                
                <div className='space-y-2'>
                    <label htmlFor='balance' className='text-sm font-medium'>Initial Balance</label>
                    <Input id='balance' type='number' step='0.01' placeholder="0.00" 
                    {...register("balance")} /* step basically shows the values can be upto 2 deciaml places*/ 
                    /> 
                    {errors.balance && (
                        <p className='text-sm text-red-600'>{errors.balance.message}</p>
                    )}
                </div>

                <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                    <label htmlFor='isDefault' className='text-sm font-medium cursor-pointer'>Set as Default</label>
                    <p className='text-sm text-muted-foreground'>Make this the default account for transactions?</p>
                    </div>
                    <Switch 
                    id="isDefault"
                        className="cursor-pointer data-[state=checked]:bg-[#06b6d4]"
                        checked={watch("isDefault")}
                        onCheckedChange={(checked) => setValue("isDefault", checked)}
                    />  
                </div>
                
                <div className='flex gap-4 pt-4'>
                    <DrawerClose asChild>
                        <Button type='button' variant="outline" className="flex-1">Cancel</Button>
                    </DrawerClose>

                    <Button type="submit" disabled={CreateAccountLoading} className="flex-1 border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4] hover:text-white transition">
                        {/* if create account is loading then we will show loader and the button will be disabled */}
                        {CreateAccountLoading? 
                        (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creating account</>
                        ):(
                            "Create Account"
                          )
                        }
                    
                    </Button>
                </div>

            </form>
        </div>
        </DrawerContent>
    </Drawer>
  )
}

export default CreateAccountTab