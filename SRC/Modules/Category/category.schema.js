import Joi from 'joi';

export const categorySchema = {
  body: Joi.object({
    name: Joi.string()
      .required()
      .min(3)
      .max(50)
      .messages({
        'any.required': 'Category name is required',
        'string.min': 'Category name must be at least 3 characters',
        'string.max': 'Category name must be less than or equal to 50 characters'
      }),

      image: Joi.object({
        secure_url: Joi.string().required().messages({
          'any.required': 'Image secure URL is required',
        }),
        public_id: Joi.string().required().messages({
          'any.required': 'Image public ID is required',
        }),
      }),
  }),
};