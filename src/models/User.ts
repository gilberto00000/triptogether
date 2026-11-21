import { Schema, model, models } from "mongoose";
const schema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }
},
    { timestamps: true });
export const User = models.User || model("User", schema);
