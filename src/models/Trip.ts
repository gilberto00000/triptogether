import { Schema, model, models } from "mongoose";
const schema = new Schema({
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }]
},
    { timestamps: true });
schema.index({ participants: 1 });
export const Trip = models.Trip || model("Trip", schema);
