import joi from 'joi';

//////////////////// sign up schema ///////////////
export const signUpSchema= {
    body : joi.object( {
        firstName : joi.string().required().min(3).max(10),
        lastName : joi.string().required().min(3).max(10),

        email : joi.string().email({
            tlds: { allow: ['com', 'net']}}).lowercase().required().messages({"any.required" : " You must enter Email "}),

        password : joi.string().min(6).required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/),
        mobileNumber : joi.string().pattern(/^\d{11}$/),
        
        city: joi.string().min(3).max(50),
        country: joi.string().min(3).max(50),
        buildingNumber: joi.number().min(1),
        floorNumber: joi.number().min(1).max(15),
        addressLabel: joi.string().min(3).max(50),
        isDefault: joi.boolean().default(false),
        isMarkedAsDeleted: joi.boolean().default(false),
        
        role:joi.string().valid('User', 'Admin').default('User')
    })
}

//////////////////// update account schema ////////////////

export const updateSchema= {
    body : joi.object( {
        firstName : joi.string().min(3).max(10),
        lastName : joi.string().min(3).max(10),

        email : joi.string().email({
            tlds: { allow: ['com', 'net']}}).lowercase(),

        mobileNumber : joi.string().pattern(/^\d{11}$/),
    })
}

//////////////////// update account schema ////////////////

export const updatePasswordSchema= {
    body : joi.object( {
        newPassword : joi.string().min(6).required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/),
        currentPassword : joi.string().min(6).required()
    })
}

//////////////////// login schema ///////////////
export const forgetPasswordSchema= {
    body : joi.object( {
        newPassword : joi.string().min(6).required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/),

        email : joi.string().email({
        tlds: { allow: ['com', 'net']}}).required().lowercase().messages({"any.required" : " You must enter Email "}),
        otp : joi.string().required()
        })
}
