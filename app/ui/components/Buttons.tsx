import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

interface props {
    name:string;
    btntype:DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
}

export const SuccessButton= ({name , btntype}:props)=>{
    return(
        <button className="text-white bg-green-500 box-border border border-transparent hover:bg-green-700 focus:ring-4 focus:ring-success-medium shadow-xs font-medium leading-5 rounded-md text-sm px-4 py-2.5 focus:outline-none">{name}</button>
)}

export const GrayButton= ({name}:props)=>{
    return(
        <button type="button" className="text-white bg-gray-500 box-border border border-transparent hover:bg-gray-700 focus:ring-4 focus:ring-success-medium shadow-xs font-medium leading-5 rounded-md text-sm px-4 py-2.5 focus:outline-none">{name}</button>
)}

export const DangerButton= ({name}:props)=>{
    return(
    <button type="button" className="text-white bg-danger box-border border border-transparent hover:bg-danger-strong focus:ring-4 focus:ring-danger-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">{name}</button>
)}

export const WarningButton= ({name}:props)=>{
    return(
<button type="button" className="text-white bg-danger box-border border border-transparent hover:bg-danger-strong focus:ring-4 focus:ring-danger-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">{name}</button>
)}