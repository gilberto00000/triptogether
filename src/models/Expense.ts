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
    amountCents: { type: Number, required: true, min: 1 },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    splitAmong: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    spentAt: { type: Date, default: Date.now }
},
    { timestamps: true });
schema.index({ trip: 1 });
export const Expense = models.Expense || model("Expense", schema);
