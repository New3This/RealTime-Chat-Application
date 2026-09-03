import multer from 'multer'
import User from '../model/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
            image: file?.filename
        });
        const token = jwt.sign({id: generateUser._id, username: generateUser.username}, process.env.JWT_SECRET, {expiresIn: '3d'});
        await generateUser.save();

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            message: "User created successfully", 
            token,
            user: {
                userId: generateUser._id, 
                username: generateUser.username, 
                image: generateUser.image
            }
        });
        
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
            const token = jwt.sign({id: user._id, username: user.username}, process.env.JWT_SECRET, {expiresIn: '3d'});
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 3 * 24 * 60 * 60 * 1000,
            });
            return res.status(202).json({
                message: "User Login Accepted",
                token,
                user: {
                    userId: user._id,
                    username: user.username,
                    image: user.image
                }
            });
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

function Logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true
    });
    return res.status(204).send();
}

async function UserInfo(req, res) {
    try {
        const user = req.user;
        
        return res.status(200).json({ user });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({message: "Error fetching user: " + error});
    }
}

export {Register, Login, Logout, UserInfo}
export default upload