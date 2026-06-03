import multer from "multer"



const upload=multer({
    storage:multer.memorystorage,
    limits:{fileSize:10*1024*1024}
})

export default upload