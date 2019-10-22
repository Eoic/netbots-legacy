import { Achievement } from "../models/Achievement";
import { User } from "../models/User";

interface IRule {
    condition: number;
    key: string;
    type: number;
    value: number;
}

let RuleSet: IRule[];

const RULE_CONDITIONS = {
    LESS_THAN: 0,
    LESS_OR_EQUAL_THAN: 1,
    GREATER_THAN: 2,
    GREATER_OR_EQUAL_THAN: 3,
    EQUAL: 4,
};

const ACHIEVEMENT_TYPE = {
    WIN: 0,
    PLAY: 1,
    DAMAGE: 2,
};

Object.freeze(RULE_CONDITIONS);

RuleSet = [{
    condition: RULE_CONDITIONS.EQUAL,
    key: "ACH_WIN_ONE_GAME",
    type: ACHIEVEMENT_TYPE.WIN,
    value: 1,
}, {
    condition: RULE_CONDITIONS.EQUAL,
    key: "ACH_WIN_TEN_GAMES",
    type: ACHIEVEMENT_TYPE.WIN,
    value: 10,
}, {
    condition: RULE_CONDITIONS.EQUAL,
    key: "ACH_WIN_FIFTY_GAMES",
    type: ACHIEVEMENT_TYPE.WIN,
    value: 50,
}, {
    condition: RULE_CONDITIONS.EQUAL,
    key: "ACH_PLAY_ONE_GAME",
    type: ACHIEVEMENT_TYPE.PLAY,
    value: 1,
}, {
    condition: RULE_CONDITIONS.EQUAL,
    key: "ACH_PLAY_TEN_GAMES",
    type: ACHIEVEMENT_TYPE.PLAY,
    value: 10,
}, {
    condition: RULE_CONDITIONS.EQUAL,
    key: "ACH_PLAY_FIFTY_GAMES",
    type: ACHIEVEMENT_TYPE.PLAY,
    value: 50,
}, {
    condition: RULE_CONDITIONS.EQUAL,
    key: "ACH_NO_GAME_DAMAGE",
    type: ACHIEVEMENT_TYPE.DAMAGE,
    value: 0,
}];

class AchievementUnlocker {

    constructor(private ruleSet: IRule[]) {
        // this.ruleSet = ruleSet;
    }

    /**
     * Returns true if given value meets rule conditions
     * (if such rule is found)
     * @param {String} key
     * @param {Number} statisticsValue
     */
    public unlock(key: string, statisticsValue: number) {
        const rule: any = this.ruleSet.find((item: any) => item.key === key);

        if (rule === undefined) {
            return false;
        }

        return this.compare(rule.value, statisticsValue, rule.condition);
    }

    /**
     * Compares two given values by
     * given condition
     * @param {Number} leftValue
     * @param {Number} rightValue
     * @param {Number} condition
     */
    public compare(leftValue: number, rightValue: number, condition: number) {
        switch (condition) {
            case RULE_CONDITIONS.EQUAL:
                return leftValue === rightValue;
            case RULE_CONDITIONS.LESS_THAN:
                return leftValue < rightValue;
            case RULE_CONDITIONS.LESS_OR_EQUAL_THAN:
                return leftValue <= rightValue;
            case RULE_CONDITIONS.GREATER_THAN:
                return leftValue > rightValue;
            case RULE_CONDITIONS.GREATER_OR_EQUAL_THAN:
                return leftValue >= rightValue;
            default:
                return false;
        }
    }
}

function updateUserAchievements(userId: string) {
    const unlocker = new AchievementUnlocker(RuleSet as any);
    const unlockedList: any = [];

    User.findOne({
        _id: userId,
    }).select({
        achievements: 1,
        statistic: 1,
    }).then((user) => {
        unlockedList.push(...filterAchievements(user, ACHIEVEMENT_TYPE.WIN, (user as any).statistic.gamesWon, unlocker));
        unlockedList.push(...filterAchievements(user, ACHIEVEMENT_TYPE.PLAY, (user as any).statistic.gamesPlayed, unlocker));
        unlockedList.push(...filterAchievements(user, ACHIEVEMENT_TYPE.DAMAGE, 0, unlocker));

        calculateUnlockedExp(unlockedList, (unlockedExp: any) => {
            User.findOneAndUpdate({
                _id: userId,
            }, {
                $inc: { "statistic.experience": unlockedExp },
                $push: { achievements: unlockedList },
            }).exec();
        });
    });
}

function filterAchievements(user: any, achievementType: any, statisticsValue: any, unlocker: any) {
    const unlockedList: any = [];

    RuleSet.filter((rule) => rule.type === achievementType).forEach((rule) => {
        if (!user.achievements.some((unlocked: any) => unlocked.key === rule.key)) {
            if (unlocker.unlock(rule.key, statisticsValue)) {
                unlockedList.push({ key: rule.key, unlockedAt: Date.now() });
            }
        }
    });

    return unlockedList;
}

function calculateUnlockedExp(unlockedList: any, callback: any) {
    let unlockedExp = 0;
    const keys: any = [];
    unlockedList.forEach((achievement: any) => keys.push(achievement.key));

    Achievement.find({
        key: { $in: keys },
    }).then((achievements) => {
        achievements.forEach((item: any) => unlockedExp += item.expValue);
        callback(unlockedExp);
    });
}

export {
    AchievementUnlocker,
    RULE_CONDITIONS,
    RuleSet,
    updateUserAchievements,
};
