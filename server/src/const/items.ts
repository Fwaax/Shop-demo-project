import { IItem } from "../schema/item";
import { ObjectId } from "mongodb";
import mongoose, { Schema, Document } from "mongoose";

export const itemHealingPotion: IItem = { name: "Healing Potion", description: "Restores 10 HP", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemSteelSword: IItem = { name: "Steel Sword", description: "Deal 10 damage", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemWoodenSword: IItem = { name: "Wooden Sword", description: "Deal 5 damage", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemIronSword: IItem = { name: "Iron Sword", description: "Deal 15 damage", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemDagger: IItem = { name: "Dagger", description: "Deal 5 damage", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemSword: IItem = { name: "Sword", description: "Deal 10 damage", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemAxe: IItem = { name: "Axe", description: "Deal 15 damage", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemPickaxe: IItem = { name: "Pickaxe", description: "Deal 5 damage", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemDragonhideBoots: IItem = { name: "Dragonhide Boots", description: "+2 armor", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemLeatherBoots: IItem = { name: "Leather Boots", description: "+1 armor", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemIronBoots: IItem = { name: "Iron Boots", description: "+3 armor", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemEnchantedRing: IItem = { name: "Enchanted Ring", description: "+2 damage", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemMagicRing: IItem = { name: "Magic Ring", description: "+3 damage", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemBagOfHolding: IItem = { name: "Bag of Holding", description: "Stores 5 items", imageUrl: "", id: new mongoose.Types.ObjectId() };

export const itemIronHelm: IItem = { name: "Iron Helm", description: "+5 armor", imageUrl: "", id: new mongoose.Types.ObjectId() };