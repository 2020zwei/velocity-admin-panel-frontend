import React from "react";

const Spinner: React.FC<{ className?: string,size?:number}> = ({ className = "",size=32}) => {
  return (
    <div className={`flex justify-center items-center py-10 ${className}`}>
      <div className="border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      style={{width:size,height:size}}
      ></div>
    </div>
  );
};

export default Spinner;
