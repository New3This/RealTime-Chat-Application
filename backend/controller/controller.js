import multer from 'multer'
import User from '../model/User.js'
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })

async function Register(req, res) {
    try {
        const {username, password} = req.body;
        const file = req.file;

        const user = await User.findOne({username});
        if (user) {
            return res.status(400).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const generateUser = new User({
            username,
            password: hashedPassword,
            image: file.filename
        });
        
        await generateUser.save();
        return res.status(201).json({message: "User created successfully"});
        
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({message: "Error creating user: " + error});
    }
}


async function Login(req, res) {
    try {
        const {username, password} = req.body;

        const user = await User.findOne({username});
        if (!user) {
            return res.status(404).json({message: "User does not exist"});
        }
        else if (await bcrypt.compare(password, user.password)) {
            return res.status(202).json({message: "User Login Accepted"});
        }
        else {
            return res.status(401).json({message: "User details are incorrect"});
        }   
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({message: "Error logging in user: " + error});
    }
}

export {Register, Login}
export default upload