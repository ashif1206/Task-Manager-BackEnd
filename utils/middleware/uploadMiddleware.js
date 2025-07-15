import multer from 'multer'


const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads/");
    },
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`)
    },
});

const filterFile = (req,file,cb)=>{
    const alloedType = ['image/jpeg','image/png','image/jpg'];
    if(alloedType.includes(file.mimetype)){
        cb(null,true);
    }
    else{
        cb(new Error ("Only .jpeg jpg and .png formats are allowed"),false)
    }

};

const upload = multer({storage,filterFile});

export default upload;