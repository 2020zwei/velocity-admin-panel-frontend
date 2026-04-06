import React from "react";

const Spinner: React.FC<{ className?: string,size?:number}> = ({ className = "",size=72}) => {
  return (
    <div className={`flex justify-center items-center py-16 ${className}`}>
      <img
        src="/icon.png"
        alt="Loading"
        className="animate-spin [animation-duration:1.8s]"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default Spinner;
