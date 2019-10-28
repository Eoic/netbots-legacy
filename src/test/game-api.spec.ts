import chai from "chai";
import { before } from "mocha";
import { CONSTANTS, GameTracker, Player, utilities, Vector } from "../game-api/api";

const should = chai.should();
const expect = chai.expect;
const getPlayerInstance = (): Player => new Player(0, 0, 0, new GameTracker(), "player");

describe("utilities", () => {
    describe("#checkBoundsLowerX()", () => {
        it(`should return true if given x coordinate of value 29 is greater than ${CONSTANTS.PLAYER_BOX_SIZE}`, () => {
            should.equal(utilities.checkBoundsLowerX(29), true);
        });

        it(`should return false if given x coordinate of value 10 is less than ${CONSTANTS.PLAYER_BOX_SIZE}`, () => {
            should.equal(utilities.checkBoundsLowerX(10), false);
        });
    });

    describe("#checkMapBounds()", () => {
        it(`should return true if given point (155, 298) is inside map bounds: X: [0, ${CONSTANTS.MAP_WIDTH}] y: [0; ${CONSTANTS.MAP_HEIGHT}]`, () => {
            should.equal(utilities.checkMapBounds(155, 298), true);
        });

        it(`should return false if given point (700, 464) is outside of map: X: [0, ${CONSTANTS.MAP_WIDTH}] y: [0; ${CONSTANTS.MAP_HEIGHT}]`, () => {
            should.equal(utilities.checkMapBounds(700, 464), false);
        });
    });
});

describe("Vector", () => {
    const vectorOne: Vector = new Vector(1, 3);
    const vectorTwo: Vector = new Vector(4, 2);

    describe("#dot(vector: Vector)", () => {
        it(`vectors ${vectorOne.toString()} and ${vectorTwo.toString()} should have dot product of 10`, () => {
            expect(vectorOne.dot(vectorTwo)).to.equal(10);
        });
    });

    describe("#normalize()", () => {
        it(`normalized vector ${vectorTwo} should be equal to (0.894, 0.447)`, () => {
            const normalized = vectorTwo.normalize();
            expect(normalized.x, "x").to.be.closeTo(0.894, 0.001);
            expect(normalized.y, "y").to.be.closeTo(0.447, 0.001);
        });
    });
});

describe("Player", () => {
    const gameTrackerOne = new GameTracker();
    const gameTrackerTwo = new GameTracker();
    const playerOne = new Player(0, 0, 0, gameTrackerOne, "playerOne");
    const playerTwo = new Player(0, 0, 0, gameTrackerTwo, "playerTwo");

    describe("#applyDamage()", () => {
        const player = getPlayerInstance();
        const partialDamage = 30;

        beforeEach(() => player.applyDamage(partialDamage));

        it(`after taking ${partialDamage} damage player should have 70 health points left`, () => {
            expect(player.getObjectState().health, "health").to.be.equal(70);
        });

        it(`after taking ${partialDamage} damage player should have 40 health points left`, () => {
            expect(player.getObjectState().health, "health").to.be.equal(40);
        });

        it(`after taking ${partialDamage} damage player should have 10 health points left`, () => {
            expect(player.getObjectState().health, "health").to.be.equal(10);
        });

        it(`after taking ${partialDamage} damage player should have 0 health points left`, () => {
            expect(player.getObjectState().health, "health").to.be.equal(0);
        });
    });

    describe("#resetBulletPool()", () => {
        const player = getPlayerInstance();

        it(`should reset all bullet pool projectiles and make them available to launch`, () => {
            player.resetBulletPool();
            const bulletPoolSize = player.getCurrentBulletPoolSize();
            expect(bulletPoolSize, "all projectiles in bullet pool are available").to.be.equal(CONSTANTS.BULLET_POOL_SIZE);
        });
    });

    describe("#createBullet()", () => {
        const player = getPlayerInstance();

        afterEach(() => {
            player.resetVitals();
            player.resetBulletPool();
        });

        it(`can launch projectile from bullet pool`, () => {
            const beforeLaunch = player.getCurrentBulletPoolSize();
            const result = player.createBullet();
            const afterLaunch = player.getCurrentBulletPoolSize();
            expect(beforeLaunch, "max pool size on start").to.be.equal(CONSTANTS.BULLET_POOL_SIZE);
            expect(result, "bullet launched").to.be.equal(true);
            expect(beforeLaunch - afterLaunch, "pool size decreased by one").to.be.equal(1);
        });

        it(`projectile launches are limited by cooldown`, () => {
            const resultOne = player.createBullet();
            const resultTwo = player.createBullet();
            const cooldown = player.getObjectState().gunCooldown;
            expect(cooldown, "should not be zero").to.be.greaterThan(0);
            expect(resultTwo, "should not be equal").to.not.equal(resultOne);
        });

        it(`fired projectile consumes energy`, () => {
            player.createBullet();
            const remainingEnergy = CONSTANTS.EN_FULL - CONSTANTS.BULLET_COST;
            expect(player.getObjectState().energy, "should be equal to").to.be.equal(remainingEnergy);
        });

        it(`should stop firing projectiles after all bullet pool is used`, () => {
            // Use all bullet pool.
            for (let i = 0; i < CONSTANTS.BULLET_POOL_SIZE; i++) {
                player.createBullet();

                while (player.getObjectState().gunCooldown !== 0) {
                    player.decrementGunCooldown();
                }
            }

            const shotResult = player.createBullet();
            expect(shotResult, "should be false").to.be.equal(false);
        });
    });

    describe("#resetVitals()", () => {
        const player = getPlayerInstance();

        before(() => {
            player.applyDamage(50);
            player.createBullet();
        });

        it(`should restore player's health and energy values to initial`, () => {
            const { health, energy } = player.getObjectState();
            expect(health, "should be equal to").to.be.equal(CONSTANTS.HP_FULL - 50);
            expect(energy, "shoudl be equal to").to.be.equal(CONSTANTS.EN_FULL - CONSTANTS.BULLET_COST);
            player.resetVitals();
            expect(player.getObjectState().health, "should be equal to").to.be.equal(CONSTANTS.HP_FULL);
            expect(player.getObjectState().energy, "should be equal to").to.be.equal(CONSTANTS.EN_FULL);
        });
    });

    describe("#decrementGunCooldown", () => {
        const player = getPlayerInstance();

        before(() => {
            player.createBullet();
        });

        it(`should decrease gun cooldown by one after fired projectile`, () => {
            const cooldownBefore = player.getObjectState().gunCooldown;
            player.decrementGunCooldown();
            const cooldownAfter = player.getObjectState().gunCooldown;
            expect(cooldownBefore - cooldownAfter, "should be less by one then cooldown at start").to.be.equal(1);
        });
    });
});
