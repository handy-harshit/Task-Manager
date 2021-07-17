const express = require('express');
const multer = require('multer');
const bufferType = require('buffer-type');
const sharp = require('sharp');

const User = require('./../models/user');
const auth = require('./../middleware/auth');
const { sendWelcomeEmail, sendCancelationEmail } = require('./../emails/account');

const router = new express.Router();

router.post('/', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch (err) {
        res.status(400).send();
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();

        res.send({ user, token });
    } catch (err) {
        res.status(400).send();
    }
});

router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

router.post('/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

router.get('/me', auth, async (req, res) => {
    res.send(req.user);
});

router.patch('/me', auth,  async (req, res) => {
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update];
        });

        await req.user.save();
        res.send(req.user);
    } catch (err) {
        res.status(400).send();
    }
})

router.delete('/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user);
    } catch (err) {
        res.status(500).send();
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return cb(new Error('File must be an image.'));
        }

        cb(undefined, true);
    }
});

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'Image must be provided.' });
    }
    const avatarBuffer = req.file.buffer;
    const avatarInfo = bufferType(avatarBuffer);
    const imageCheckRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
    const isImage = typeof avatarInfo !== 'undefined' && imageCheckRegex.test(avatarInfo.extension);

    if (!isImage) {
        return res.status(400).send({ error: 'File must be an image.' });
    }

    const croppedAvatar = await sharp(avatarBuffer)
        .resize({
            width: 250,
            height: 250
        })
        .png()
        .toBuffer();

    req.user.avatar = croppedAvatar;
    await req.user.save();
    res.send();
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message });
});

router.delete('/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }
        
        res.set('Content-Type', 'image/png').send(user.avatar);
    } catch (err) {
        res.status(404).send();
    }
});

module.exports = router;