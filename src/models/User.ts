import bcrypt from "bcryptjs";
import mongoose from "mongoose";
const Schema = mongoose.Schema;
const SALT_ROUNDS = 10;

const UserSchema = new Schema({
    achievements: [{
        key: mongoose.Schema.Types.String,
        unlockedAt: mongoose.Schema.Types.Date,
    }],
    email: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
    identiconHash: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
    isAdmin: {
        default: false,
        required: false,
        type: mongoose.Schema.Types.Boolean,
    },
    multiplayerScript: {
        default: null,
        required: false,
        type: mongoose.Schema.Types.ObjectId,
    },
    password: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
    resetPasswordToken: {
        required: false,
        type: mongoose.Schema.Types.String,
    },
    resetPasswordTokenExpires: {
        required: false,
        type: mongoose.Schema.Types.Date,
    },
    scripts: [{
        code: mongoose.Schema.Types.String,
        name: mongoose.Schema.Types.String,
    }],
    statistic: {
        experience: {
            default: 4,
            type: mongoose.Schema.Types.Number,
        },
        gameTime: {
            default: 0,
            type: mongoose.Schema.Types.Number,
        },
        gamesPlayed: {
            default: 0,
            type: mongoose.Schema.Types.Number,
        },
        gamesWon: {
            default: 0,
            type: mongoose.Schema.Types.Number,
        },
    },
    username: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
}, {
    timestamps: true,
});

/**
 * Hash password before saving to DB
 */
UserSchema.pre("save", function(next) {
    const user = this as any;

    return bcrypt.hash(user.password, SALT_ROUNDS).then((hash) => {
        user.password = hash;
        next();
    });
});

/**
 * Compare password with one stored in the database
 */
UserSchema.methods.comparePasswords = function(password: string, callback: any) {
    const user = this;
    bcrypt.compare(password, user.password, callback);
};

const User = mongoose.model("user", UserSchema);
export { User };
