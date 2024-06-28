import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.cloudinary_cloud_name, 
    api_key: process.env.cloudinary_api_key, 
    api_secret: process.env.cloudinary_api_secret
});

// Upload a file function
const uploadOnCloudinary = async (localFilePath)=>{
   try {
    if(!localFilePath) return null
    //Upload file on Cloudinary
    const response = await cloudinary.uploader
    .upload(localFilePath,{
        resource_type:'auto'
        })
        //file uploaded successfully
        // console.log('file is uploaded on cloudinary')
        fs.unlinkSync(localFilePath)
        return response;
   } catch (error) {
    fs.unlinkSync(localFilePath)  //removed the locally saved temporary file as the upload operation got failed
    return null;
   }
}


export default uploadOnCloudinary 