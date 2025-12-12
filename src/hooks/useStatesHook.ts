import { useState } from "react";

const useStates = () => {
    const [data, setData] = useState<any>([]);
    const [error, setError] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    return {
        data,
        setData,
        error,
        setError,
        isLoading,
        setIsLoading,
    };
};

export default useStates;
