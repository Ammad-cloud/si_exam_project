// Validation
const Joi = require('joi');

// Register Validation
const registerValidation = (data) => {
const schema = Joi.object({
    firstName: Joi.string()
        .min(3)
        .max(255)
        .required(),
    lastName: Joi.string()
        .min(3)
        .max(255)
        .required(),
    email: Joi.string()
        .min(6)
        .max(255)
        .required()
        .email(),
    password: Joi.string()
        .min(6)
        .max(1024)
        .required()
})
// Validate the data before we make a user
return schema.validate(data);
}

// Login Validation
const loginValidation = (data) => {
const schema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(255)
        .required()
        .email(),
    password: Joi.string()
        .min(6)
        .max(1024)
        .required()
})  
return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;