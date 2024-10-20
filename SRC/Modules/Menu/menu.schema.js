import Joi from 'joi';

export const menuSchema = {
  body: Joi.object({
    name: Joi.string()
      .required()
      .min(3)
      .max(50)
      .messages({
        'any.required': 'Menu name is required',
        'string.min': 'Menu name must be at least 3 characters',
        'string.max': 'Menu name must be less than or equal to 50 characters'
      }),

    price: Joi.number()
      .required()
      .min(0)
      .messages({
        'any.required': 'Price is required',
        'number.min': 'Price must be greater than or equal to 0',
      }),

    description: Joi.string().allow(''),
    image: Joi.object({
        secure_url: Joi.string().required().messages({
          'any.required': 'Image secure URL is required',
        }),
        public_id: Joi.string().required().messages({
          'any.required': 'Image public ID is required',
        }),
      }),
    available: Joi.boolean()
      .default(true),
    ingredients: Joi.array().items(Joi.string().trim()).optional(),
  }),
};
