import multer from 'multer'
import {User} from '../model/model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Conversation, Message } from '../model/model.js'
import { io } from '../socket/socket.js'

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
        const generateUser = new User.create({
            username,
            password: hashedPassword,
            image: file?.filename
        });
        const token = jwt.sign({id: generateUser._id, username: generateUser.username}, process.env.JWT_SECRET, {expiresIn: '3d'});

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            message: "User created successfully", 
            token,
            user: {
                id: generateUser._id.toString(),
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
                    id: user._id.toString(),
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

async function Userbase(req, res) { // get collection of users that exist except logged in

    try {
        const currentID = req.user.id;
        const users = await User.find({
            _id: { $ne: currentID }
        });

        if (!users) {
            return res.status(404).json({message: "No users found"});
        }
        const userList = users.map((user) => ({
            id: user._id.toString(),
            username: user.username,
            image: user.image ?? null
        }));

        return res.status(200).json({ users: userList });
    }
    catch (error) {
        return res.status(400).json({message: "Error fetching users: " + error});
    }
}

async function ChatMessage(req, res) { // saves messages and participants to db
    const {receiverId} = req.params;
    const senderId = req.user.id;
    const {content} = req.body;

    let conversation = await Conversation.findOne({ // find if conversation exists
        chatParticipants: {$all: [senderId, receiverId]} // $all finds documents where a field is an array holding every value listed in the $all array
    });

    if (!conversation) {
        conversation = await Conversation.create({
            chatParticipants: [senderId, receiverId]
        });
    }

    const messageCreated = await Message.create({
        conversationId: conversation._id,
        sender: senderId,
        message: content,
    });

    io.to(conversation._id.toString()).emit('newMsg', messageCreated); // 3. sender sends messageCreated to the conversationId room, where socket listening for 'newMsg' will pick up 

    return res.status(200).json({
        conversationId: messageCreated.conversationId,
        sender: messageCreated.sender,
        message: messageCreated.message,
        id: messageCreated._id
    });
}

async function ReturnChat(req, res) {
    try {
        const { receiverId } = req.params;
        const senderId = req.user.id;

        let conversation = await Conversation.findOne({
            chatParticipants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                chatParticipants: [senderId, receiverId]
            });
        }

        const messages = await Message.find({
            conversationId: conversation._id
        });

        return res.status(200).json({
            messages,
            conversationId: conversation._id.toString()
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: err });
    }
}

async function DeleteChat(req, res) {
    try {
        const {msgId: id} = req.params;
        const message = await Message.findByIdAndDelete(id);
        return res.status(200).json({id: message._id});

    }
    catch (err) {
        return res.status(500).json({msg: err});
    }

}

async function EditChat(req, res) {
    try {
        // const isSender = await Message.findById(id);
        console.log(req.body);
        const messageComplete = await Message.findByIdAndUpdate(
            req.params.msgId,
            req.body,
            { returnDocument: 'after', runValidators: true }
        );

        console.log(messageComplete);
        
        const conversationId = messageComplete.conversationId;

        const messages = await Message.find({
            conversationId: conversationId
        });
        return res.status(200).json({
            messages,
            conversationId
        });
        
        // else {
        //     return res.status(401).json({message: "User is not authorised to edit"});
        // }

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({msg: err});
    }

}

export {Register, Login, Logout, UserInfo, Userbase, ChatMessage, ReturnChat, DeleteChat, EditChat}
export default upload