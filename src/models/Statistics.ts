/** Stores user statistics and unlocked achievements as embedded document */

import mongoose from "mongoose";
const Schema = mongoose.Schema;

const StatisticsSchema = new Schema({
    achievements: [{
        unlocked: mongoose.Schema.Types.ObjectId,
    }],
    experience: {
        default: 0,
        type: mongoose.Schema.Types.Number,
    },
    gamesLost: {
        default: 0,
        type: mongoose.Schema.Types.Number,
    },

    gamesWon: {
        default: 0,
        type: mongoose.Schema.Types.Number,
    },

    level: {
        default: 1,
        type: mongoose.Schema.Types.Number,
    },
    userId: {
        ref: "users",
        type: mongoose.Schema.Types.ObjectId,
    },
});

const Statistics = mongoose.model("statistics", StatisticsSchema);
module.exports = Statistics;
