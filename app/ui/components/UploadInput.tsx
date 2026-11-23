import Image from "next/image";
import Loading from "../../loading";
import { API_BASE_URL } from "@/lib/config";

interface UploadProps{
    uploading:boolean
    handleImageUpload:(event: React.ChangeEvent<HTMLInputElement>) => void
    uploadedImage:string
}

const UploadInput = ({uploading , handleImageUpload , uploadedImage}:UploadProps) => {
    return ( 
        <div className="w-full flex justify-center items-center font-Dana ">
            <label className="w-1/3 text-sm">آپلود عکس:</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-elf hover:file:bg-violet-100 " 
            />
        {uploading && (<Loading/>)}
        <div className="overflow-hidden rounded-full border">
            <Image
                src={`${uploadedImage}` || "/images/avatar.png"}
                alt="uploadImage"
                width={128}
                height={128}
                
            />
            </div>
        </div>
     );
}
 
export default UploadInput;