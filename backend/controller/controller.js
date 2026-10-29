import {User} from '../model/model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Conversation, Message } from '../model/model.js'
import { io } from '../socket/socket.js'
import cloudinary from '../config/cloudinary.js';
import { unlink } from 'node:fs/promises';

const extractURL = (imageUrl) => {
    if (!imageUrl) return null;
    try {
        // https://res.cloudinary.com/dylancloudstore/image/upload/v1782630691/store-products/kbssggtpophr85oftrbq.png
        const parts = imageUrl.split('/');
        // [
        //   'https:',
        //   '',
        //   'res.cloudinary.com',
        //   'dylancloudstore',
        //   'image',
        //   'upload',
        //   'v1782630691',     
        //   'store-products',  
        //   'kbssggtpophr85oftrbq.png'
        // ]
        const uploadIndex = parts.indexOf('upload');


        if (uploadIndex === -1) return null;
        const publicId = parts.slice(uploadIndex + 2).join('/').split('.')[0];
        // slice
        // 'store-products',  
        // 'kbssggtpophr85oftrbq.png'

        // join
        // Result: 'store-products/kbssggtpophr85oftrbq.png'

        // split
        // store-products/kbssggtpophr85oftrbq

        return publicId;    
    } 
    catch (error) {
        console.error('Error extracting public_id:', error);
        return null;
    }
};

async function Register(req, res) {
    try {
        const {username, password} = req.body;
        const file = req.file;

        let imageUrl;

        if (file) {
            try {
                const uploadedImage = await cloudinary.uploader.upload(file.path, {
                    folder: 'chat-application/pfp',
                    transformation: [{quality: 'auto'}]
                });
                imageUrl = uploadedImage.secure_url;
            } catch (error) {
                console.error('Cloudinary message image upload failed:', error);
                return res.status(502).json({message: 'Failed to upload message image'});
            } finally {
                try {
                    await unlink(file.path);
                } catch (error) {
                    console.error('Failed to remove image from local storage:', error);
                }
            }
        }

        const user = await User.findOne({username});
        if (user) {
            return res.status(400).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const generateUser = await User.create({
            username,
            password: hashedPassword,
            image: imageUrl ?? null
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
        const user = await User.findById(req.user.id).select('_id username image');

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        
        return res.status(200).json({
            user: {
                id: user._id.toString(),
                username: user.username,
                image: user.image ?? null
            }
        });
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
        let unreadMsgs = [];
        
        await Promise.all(users.map(async (user) => {
            let conversationInstance = await Conversation.findOne({
                chatParticipants: {$all: [currentID, user._id]}
            });

            if (!conversationInstance) {
                unreadMsgs.push({
                    id: user._id,
                    username: user.username,
                    image: user.image ?? null,
                    unread: false
                });
                return;
            }

            const messages = await Message.find({
                conversationId: conversationInstance._id
            });

            if (messages.length > 0) {
                const lastMsg = await Message.findOne({conversationId: conversationInstance._id}).sort({createdAt: -1});
                if (lastMsg.sender.toString() !== currentID.toString() && lastMsg.isRead === false) {
                    unreadMsgs.push({
                        id: user._id,
                        username: user.username,
                        image: user.image ?? null,
                        unread: true
                    });
                }
                else {
                    unreadMsgs.push({
                        id: user._id,
                        username: user.username,
                        image: user.image ?? null,
                        unread: false
                    });
                }
            }
            else {
                unreadMsgs.push({
                    id: user._id,
                    username: user.username,
                    image: user.image ?? null,
                    unread: false
                });
            }
            return conversationInstance;
        }));

        return res.status(200).json({users: unreadMsgs});
    }
    catch (error) {
        return res.status(400).json({message: "Error fetching users: " + error});
    }
}

async function ChatMessage(req, res) { // saves messages and participants to db
    const {receiverId} = req.params;
    const senderId = req.user.id;
    const messageContent = req.body.messageContent?.trim() || ''; // if no msg sent, message is empty string

    if (!messageContent && !req.file) { // if msg empty string and no file
        return res.status(400).json({message: 'A message or image is required'}); // error
    }

    try {
        let imageUrl;
        if (req.file) {
            try {
                const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'chat-application/messages',
                    transformation: [{quality: 'auto'}]
                });
                imageUrl = uploadedImage.secure_url;
            } catch (error) {
                console.error('Cloudinary message image upload failed:', error);
                return res.status(502).json({message: 'Failed to upload message image'});
            } finally {
                try {
                    await unlink(req.file.path);
                } catch (error) {
                    console.error('Failed to remove image from local storage:', error);
                }
            }
        }

        let conversation = await Conversation.findOne({
            chatParticipants: {$all: [senderId, receiverId]}
        });

        if (!conversation) {
            conversation = await Conversation.create({
                chatParticipants: [senderId, receiverId]
            });
        }

        const conversationId = conversation._id.toString();
        const receiverIsViewing = (await io.in(conversationId).fetchSockets())
            .some((socket) => socket.data.userId === receiverId);

        const messageCreated = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            message: messageContent,
            image: imageUrl,
            isRead: receiverIsViewing
        });

        io.to(conversationId).emit('newMsg', messageCreated);
        io.to(`user:${receiverId}`).emit('unreadUpdate');

        return res.sendStatus(204);
    } catch (error) {
        console.error('Failed to save chat message:', error);
        return res.status(500).json({message: 'Failed to save chat message'});
    }
}

async function ReturnChat(req, res) {
    try {
        const { receiverId } = req.params;
        const senderId = req.user.id;

        let user = await User.findById(receiverId);
        let conversation = await Conversation.findOne({
            chatParticipants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                chatParticipants: [senderId, receiverId]
            });
        }

        const readResult = await Message.updateMany({ // marks the msgs from other person as read
            conversationId: conversation._id,
            sender: { $ne: senderId },
            isRead: false
        }, { $set: { isRead: true } });

        if (readResult.modifiedCount > 0) { // if any msg is marked as read, we re-render their msg as read in frontend
            io.to(conversation._id.toString()).emit('messagesRead', { readerId: senderId });
        }
        const messages = await Message.find({ conversationId: conversation._id });

        return res.status(200).json({
            image: user.image,
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
        let conversation = await Message.findById(id).select('conversationId');
        const message = await Message.findByIdAndDelete(id);
        const messages = await Message.find({
            conversationId: conversation.conversationId.toString()
        });

        const normalisedMessages = messages.map((msg) => ({
            id: msg._id.toString(), // change _id to id to match frontend
            message: msg.message,
            sender: msg.sender.toString(),
            reactions: msg.reactions,
            createdAt: msg.createdAt,
            isRead: msg.isRead,
            isEdited: msg.isEdited
        }));

        io.to(conversation.conversationId.toString()).emit('newChange', normalisedMessages); // 3. sender sends updated conversation to the conversationId room, where socket listening for 'newChange' will pick up 


        return res.status(200).json({id: message._id});

    }
    catch (err) {
        return res.status(500).json({msg: err});
    }

}

async function EditChat(req, res) {
    try {

        const messageComplete = await Message.findByIdAndUpdate(
            req.params.msgId,
            {
                message: req.body.message,
                isEdited: true,
            },
            { returnDocument: 'after', runValidators: true }
        );
        
        const conversationId = messageComplete.conversationId;

        const messages = await Message.find({
            conversationId: conversationId
        });
                
        const normalisedMessages = messages.map((msg) => ({
            id: msg._id.toString(), // change _id to id to match frontend
            message: msg.message,
            sender: msg.sender.toString(),
            reactions: msg.reactions,
            createdAt: msg.createdAt,
            isEdited: msg.isEdited
        }));

        io.to(conversationId.toString()).emit('newChange', normalisedMessages); // 3. sender sends updated conversation to the conversationId room, where socket listening for 'newChange' will pick up 

        return res.status(200).json({
            messages,
            conversationId
        });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({msg: err});
    }

}

async function EmojiReaction(req, res) {
    try {
        const { msgId } = req.params;
        const { emoji, receiverId } = req.body;

        const userId = req.user.id;

        let storedReaction;

        // check if message exists with emoji reaction from user
        let UserReacted = await Message.findOne({
            _id: msgId,
            reactions: {
                $elemMatch: {
                    emoji: emoji,
                    userIds: userId
                }
            }
        });

        if (UserReacted) { // if reaction by that user exist

            // then make user unreact the emoji it has already reacted
            storedReaction = await Message.findOneAndUpdate(
                {_id: msgId, "reactions.emoji" : emoji}, 
                {$pull : {"reactions.$.userIds": userId}},
                {returnDocument: true}
            );

            await Message.updateOne(
                { _id: msgId },
                { $pull: { reactions: { emoji: emoji, userIds: { $size: 0 } } } }
            );
        }

        else { // otherwise 
            
            const emojiExists = await Message.findOne({
                _id: msgId,
                "reactions.emoji" : emoji
            });

            if (emojiExists) { // if emoji exists, add user to reaction 
                storedReaction = await Message.findOneAndUpdate(
                        {_id: msgId, "reactions.emoji" : emoji},
                        {$push : {"reactions.$.userIds" : userId}},
                        {returnDocument: true}
                    );
            } 
            else { // else create emoji and add reaction
                storedReaction = await Message.findByIdAndUpdate(
                        msgId,
                        {$push : {reactions : {emoji, userIds: [userId]}}},
                        {returnDocument: true}
                );
            }
  
        }

        let conversation = await Conversation.findOne({ // find if conversation exists
            chatParticipants: {$all: [userId, receiverId]} // $all finds documents where a field is an array holding every value listed in the $all array
        });

        const messages = await Message.find({conversationId: conversation._id});
        const normalisedMessages = messages.map((msg) => ({
            id: msg._id.toString(), 
            message: msg.message,
            image: msg.image,
            sender: msg.sender.toString(),
            reactions: msg.reactions,
            createdAt: msg.createdAt,
            isRead: msg.isRead,
            isEdited: msg.isEdited
        }))
        io.to(conversation._id.toString()).emit('newChange', normalisedMessages); // 3. sender sends messageCreated to the conversationId room, where socket listening for 'newMsg' will pick up 

        return res.status(200).json(storedReaction);
        
    }
    catch (err) {
        console.log(err);
        return res.status(404).json({message: err});
    }
}


export {Register, Login, Logout, UserInfo, Userbase, ChatMessage, ReturnChat, DeleteChat, EditChat, EmojiReaction}
