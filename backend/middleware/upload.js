import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'node:crypto';

const uploadFolder = process.env.UPLOAD_DIR || (process.env.VERCEL ? '/tmp/images' : path.resolve('images'));

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        cb(null, `${randomUUID()}${path.extname(file.originalname)}`);
    }
});

export const handleUpload = (req, res, next) => {
    const errorFields = [];
    upload.single('fileContent')(req, res, (err) => {
        if (err) {
            // If the "File already exists" error happens, create error
            errorFields.push("file");
            return res.status(400).json({ error: err.message, errorFields });
        }
        // If no error, proceed to createProduct controller safely
        next();
    });
};


export const upload = multer({ storage });