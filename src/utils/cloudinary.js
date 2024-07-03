import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const destroyCloudVideo = async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        await cloudinary.uploader.destroy(localFilePath, {resource_type: 'video'})
        return true;
    } catch (error) {
        return console.error('Error deleting video:', error);
    }
}

const destroyCloudImage = async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        await cloudinary.uploader.destroy(localFilePath);
        return true;
    } catch (error) {
        return console.error('Error deleting Image:', error);
    }
}

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



export {uploadOnCloudinary,
    destroyCloudImage,
    destroyCloudVideo
}