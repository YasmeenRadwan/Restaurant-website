import multer from "multer";
import { errorHandlerClass } from "../utils/error-class.utils.js";
import { extensions } from "../utils/file-extensions.utils.js";

export const multerHost = ({allowedExtensions = extensions.images}) =>{
    const storage = multer.diskStorage({});
    const fileFilter = (req,file,cb) => {
        if (allowedExtensions?.includes(file.mimetype)){
            return cb (null , true)
        }
        cb(new errorHandlerClass (`invalid file type only allowed ${allowedExtensions}`,400),false) 
}

  return multer({fileFilter,storage});

}