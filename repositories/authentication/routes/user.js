const User = require('../model/User');
const verify = require('../model/token');
const userRouter = require('express').Router();

userRouter.get('/users/:id', verify, async (req, res) => {
    const user = await User.findOne({ _id: req.user._id });
    res.status(200).send(user);
});

userRouter.get('/users', verify, (req, res) => {
    res.send(req.user);
    User.find({}, (err, users) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(users);
        }
    });
});

userRouter.put('/users/:id', verify, async (req, res) => {
    const user = await User.findOne({ _id: req.user._id });
    if (req.body.firstName) {
        user.firstName = req.body.firstName;
    }
    if (req.body.lastName) {
        user.lastName = req.body.lastName;
    } 
    if (req.body.password) {
        user.password = req.body.password;
    }
    try {
        const savedUser = await user.save();
        res.status(200).send( savedUser.email+" updated succesfully");
    }
    catch (err) {
        res.status(400).send(err);
    }
    
});

userRouter.delete('/users/:id', verify, (req, res) => {
    User.findByIdAndRemove(req.params.id, (err, user) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send("User deleted");
        }
    });
});

module.exports = userRouter;