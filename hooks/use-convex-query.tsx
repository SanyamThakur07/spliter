import { useMutation, useQuery } from "convex/react"
import { useEffect, useState } from "react";

export const useConvexQuery = (query: any, ...args: any) => {
    const result = useQuery(query, ...args);

    const [data, setData] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(result === undefined){
            setIsLoading(true);
        }
        else{
            try{
                setData(result);
                setError(null);
            }
            catch(err: any){
                setError(err);
            }
            finally{
                setIsLoading(false);
            }
        }
        
    }, [result]);

    return {
        data,
        isLoading,
        error
    };
}

export const useConvexMutation = (mutation: any) => {
    const mutationFn = useMutation(mutation);

    const [data, setData] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const mutate = async(...args: any) => {
        setIsLoading(true);
        setError(null);

        try{
            const response = await mutationFn(...args);
            setData(response);
            return response;
        }
        catch(err: any){
            setError(err);
            throw err;
        }
        finally{
            setIsLoading(false);
        }
    };
    return {mutate, data, isLoading, error};
};