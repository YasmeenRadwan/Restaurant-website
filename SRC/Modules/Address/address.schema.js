import joi from 'joi';

//////////////////// Address Schema ///////////////
export const addressSchema = {
    body: joi.object({
       
        country: joi.string().required().min(3).max(50).messages({
            "any.required": "Country is required",
            "string.min": "Country must be at least 3 characters long",
            "string.max": "Country must not exceed 50 characters"
        }),
        city: joi.string().required().min(3).max(50).messages({
            "any.required": "City is required",
            "string.min": "City must be at least 3 characters long",
            "string.max": "City must not exceed 50 characters"
        }),
        buildingNumber: joi.number().min(1).messages({
            "number.min": "Building number must be at least 1"
        }),
        floorNumber: joi.number().min(0).max(15).messages({
            "number.min": "Floor number must be at least 0",
            "number.max": "Floor number must not exceed 15"
        }),
        addressLabel: joi.string().optional().min(3).max(50).messages({
            "string.min": "Address label must be at least 3 characters long",
            "string.max": "Address label must not exceed 50 characters"
        }),
        setAsDefault: joi.boolean().default(false),
    })
}