import "dotenv/config"
import ImageKit from "@imagekit/nodejs";
import crypto from "crypto"

const imageKit=new ImageKit({
    publicKey:process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey:process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint:process.env.IMAGEKIT_URL_ENDPOINT
})

async function uploadImages(buffer,OriginalFileName,pgId){

    const uniqueName=crypto.randomBytes(16).toString("hex")+"-"+OriginalFileName
    const response= await imageKit.files.upload({
    file:buffer.toString("base64"),
    fileName:uniqueName,
    folder:`/pgImages/pg_${pgId}`,
    useUniqueFileName:true,
})
return {
    url:response.url,fileId:response.fileId
}
}

async function deleteImage(fileId) {
  await imageKit.files.delete(fileId);
}



export default {uploadImages,deleteImage}