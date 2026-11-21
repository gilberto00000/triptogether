import { Schema, model, models } from "mongoose";
const schema = new Schema({
    trip: {
        type: Schema.Types.ObjectId,
        ref: "Trip", required: true
    },
    title: {
        type: String,
        required: true
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User", default: null
    },
    checked: { type: Boolean, default: false }
},
    { timestamps: true });
schema.index({ trip: 1 });
export const ChecklistItem = models.ChecklistItem || model("ChecklistItem", schema);
