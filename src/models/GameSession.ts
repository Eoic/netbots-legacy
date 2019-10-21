import mongoose from "mongoose";
const Schema = mongoose.Schema;

const GameSessionSchema = new Schema({
    createdBy: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
    data: [{
        code: mongoose.Schema.Types.String,
        username: mongoose.Schema.Types.String,
    }],
    sessionId: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
});

const GameSession = mongoose.model("game_session", GameSessionSchema);
export { GameSession };
