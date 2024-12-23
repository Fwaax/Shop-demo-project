import Joi from "joi";
import mongoose from "mongoose";

export const EMAIL_REGEX = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=(?:.*[A-Z]){3})(?=(?:.*[a-z]){3})(?=(?:.*\d){1})(?=(?:.*[!@#$%^&*]){1}).*$/;

const objectIdValidation = (value, helpers) => {
    if (!(value instanceof mongoose.Types.ObjectId)) {
        return helpers.error('any.invalid');
    }
    return value;
};

export const UserSignupValidationJoi = Joi.object({
    email: Joi.string().email().pattern(EMAIL_REGEX).required(),
    password: Joi.string().min(8).max(20).pattern(PASSWORD_REGEX).required(),
    firstName: Joi.string().min(2).max(20),
    lastName: Joi.string().min(2).max(20),
    balance: Joi.number().default(0),
    inventory: Joi.array().items(Joi.object({
        itemId: Joi.custom(objectIdValidation).required(),
        quantity: Joi.number().required(),
    })).default([]),
});

export const LoginValidationJoi = Joi.object({
    email: Joi.string().email().pattern(EMAIL_REGEX).required(),
    password: Joi.string().min(7).max(20).pattern(PASSWORD_REGEX).required(),
});