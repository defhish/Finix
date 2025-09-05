import { useState } from "react";
import { toast } from "sonner";
//write 'use' keyword in the beginning to show its a hook 
//its like a function but with  more capanilities given by react

const useFetch=(cb)=>{ //cb stands for callback function, it basically means tell me how to fetch the data and ill handle the loading error states
    const [data,setData]=useState(undefined);
    const [loading,setLoading]=useState(null);
    const [error,setError]=useState(null);

    //we only have to call this fn whenever we have to call an api, so the logic will be inside it 
    const fn=async(...args)=>{ //(...args) is the rest operator → it collects any arguments you pass into fn and forwards them to cb
        setLoading(true);
        setError(null);

        try{
            const response=await cb(...args)
            setData(response)
            setError(null);
        }catch(error){
            setError(error);
            toast.error(error.message);
        }finally{
            setLoading(false);
        }
    }

    return {data,loading,error,fn,setData }
}

export default useFetch;