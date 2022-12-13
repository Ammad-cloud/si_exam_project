const authRouter = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation } = require('../model/validation');

// Register
authRouter.post('/register', async (req, res) => {

    // Validate the data before we make a user
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    // Checking if the user is already in the database
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send('Email already exists');
    
    //Hash passwords before storing in database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);


    //create a new user
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword
    });
    try {
        // This is an asynchronous operation that will save the user to the database
        const savedUser = await user.save(); 
        res.status(200).send("Registration succesful with user: "+savedUser.email);
    } 
    catch (err) {
        res.status(400).send(err);
    }
    
});

// Login
authRouter.post('/login', async (req, res) => {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Checking if the email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Email or password does not exist');

    // Checkin if the password is correct by comparing the hashed password in the database with the password entered by the user
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Email or password does not exist');
    
    // Create a token that will be sent to the user
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    // signs the token with the user id and the secret token and attach it to the header
    res.header('access-token', token)


    res.status(200).send("Login succesful with user: "+user.email + "id: "+user._id);
});

authRouter.get('/logout', (req, res) => {
    req.header('access-token', null);
    res.status(200).send("Logout succesful");
});

authRouter.post('/verify-token', (req, res) => {
    const token = req.header('access-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        res.status(200).send(verified);
    } catch (err) {
        res.status(400).send('Invalid token');
    }
})

module.exports = authRouter;