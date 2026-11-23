import React from "react";

export function Card({ children, className = "" }:any) {
  return (
    <div
      className={`rounded-2xl shadow-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }:any) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
