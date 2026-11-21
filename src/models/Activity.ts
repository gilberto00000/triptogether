import { Schema, model, models } from "mongoose";
const schema = new Schema({
    trip: {
        type: Schema.Types.ObjectId,
        ref: "Trip", required: true
    },
    title: { type: String, required: true },
    location: { type: String, default: "" },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date },
    notes: { type: String, default: "" }
},
    { timestamps: true });
schema.index({ trip: 1, startsAt: 1 });
export const Activity = models.Activity || model("Activity", schema);
