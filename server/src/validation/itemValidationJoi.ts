import joi from "joi";
import mongoose from "mongoose";

const objectIdValidation = (value, helpers) => {
    if (!(value instanceof mongoose.Types.ObjectId)) {
        return helpers.error('any.invalid');
    }
    return value;
}

export const ItemValidationJoi = joi.object({
    itemName: joi.string().required(),
    itemDescription: joi.string().required(),
    itemImage: joi.string().required(),
    itemQuantity: joi.number().required(),
});

export const ItemUpdateValidationJoi = joi.object({
    name: joi.string(),
    description: joi.string(),
    imageUrl: joi.string(),
    id: joi.custom(objectIdValidation).required(),
});

export const ItemDeleteValidationJoi = joi.object({
    id: joi.custom(objectIdValidation).required(),
});

export const ItemStoreValidationJoi = joi.object({
    itemId: joi.custom(objectIdValidation).required(),
    quantity: joi.number().required(),
    pricePerItem: joi.number().required(),
});