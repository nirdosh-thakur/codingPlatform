const validator = require('validator');

const validateUser = (data) => {
    const mandatoryField = ['firstName', 'emailId', 'password'];

    const isAllowed = mandatoryField.every((ele) => Object.keys(data).includes(ele));
    if(!isAllowed) 
        throw new Error("Some fields missing.");

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Email Id");

    //if(!validator.isStrongPassword(data.password))
    //    throw new Error("Weak Password");
}

module.exports = validateUser;