import mongoose from "mongoose";
const Schema = mongoose.Schema;

const AchievementSchema = new Schema({
    description: {
        required: false,
        type: mongoose.Schema.Types.String,
    },
    expValue: {
        default: 0,
        min: 0,
        type: mongoose.Schema.Types.Number,
    },
    iconName: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
    key: {
        maxlength: 25,
        required: true,
        type: mongoose.Schema.Types.String,
    },
    title: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
});

const Achievement = mongoose.model("achievement", AchievementSchema);
export { Achievement };
