import chai from "chai";
import { before } from "mocha";
import { CONSTANTS, GameTracker, Player, utilities, Vector } from "../game-api/api";

const expect = chai.expect;
const getPlayerInstance = (): Player => new Player(0, 0, 0, new GameTracker(), "player");

describe("GameTracker", () => {
    describe("#registerEnemyEliminated", () => {
        it("registers eliminated enemy and increases their count by one", () => {
            const gameTracker = new GameTracker();
            const initialValue = gameTracker.getData().enemiesEliminated;
            gameTracker.registerEnemyEliminated();
            const newValue = gameTracker.getData().enemiesEliminated;
            expect(newValue - initialValue).to.be.equal(1);
        });
    });
});

describe("utilities", () => {
    describe("#checkMapBounds()", () => {
        const tests = [
            {
                args: { x: 0, y: 0 },
                expected: false,
            },
            {
                args: { x: CONSTANTS.PLAYER_BOX_SIZE, y: CONSTANTS.PLAYER_BOX_SIZE },
                expected: true,
            },
            {
                args: { x: CONSTANTS.PLAYER_BOX_SIZE, y: -1000 },
                expected: false,
            },
            {
                args: { x: -10, y: -10 },
                expected: false,
            },
            {
                args: { x: 215, y: 105 },
                expected: true,
            },
            {
                args: { x: CONSTANTS.MAP_WIDTH, y: CONSTANTS.MAP_HEIGHT },
                expected: false,
            },
            {
                args: { x: 10000, y: 50000 },
                expected: false,
            },
        ];

        tests.forEach((test) => {
            it(`correctly checks if given point (${test.args.x};${test.args.y}) is on the map`, () => {
                const { x, y } = test.args;
                expect(utilities.checkMapBounds(x, y), `Assertion failed for point (${x};${y})`).to.be.equal(test.expected);
            });
        });
    });

    describe("#checkPlayerCollisions()", () => {
        const tests = [
            {
                args: { x0: 0, y0: 0, x1: 0, y1: 0 },
                expected: true,
            },
            {
                args: { x0: 0, y0: 0, x1: 100, y1: 1000 },
                expected: false,
            },
            {
                args: { x0: 0, y0: 0, x1: 5, y1: 10 },
                expected: false,
            },
            {
                args: { x0: 100, y0: 50, x1: 100, y1: 10000 },
                expected: false,
            },
            {
                args: { x0: 500, y0: 500, x1: 500 + CONSTANTS.PLAYER_HALF_WIDTH, y1: 10000 },
                expected: true,
            },
            {
                args: { x0: 500, y0: 500, x1: 500 + CONSTANTS.PLAYER_HALF_WIDTH, y1: 500 + CONSTANTS.PLAYER_HALF_HEIGHT },
                expected: true,
            },
            {
                args: { x0: 500, y0: 500, x1: 500 + CONSTANTS.PLAYER_HALF_HEIGHT, y1: 500 + CONSTANTS.PLAYER_HALF_HEIGHT },
                expected: false,
            },
        ];

        tests.forEach((test) => {
            const { x0, y0, x1, y1 } = test.args;
            it(`players should${(test.expected) ? "" : " not"} intersect where P1: (${x0};${y0}) and P2: (${x1};${y1})`, () => {
                const playerOne = new Player(x0, y0, 0, new GameTracker(), "P0");
                const playerTwo = new Player(x1, y1, 0, new GameTracker(), "P1");
                // tslint:disable-next-line: no-empty
                utilities.checkPlayerCollisions(playerOne, playerTwo, () => { });
            });
        });
    });

    describe("#functionCalledThisFrame()", () => {
        it("should return false when no api functions were called this frame", () => {
            const callMap = {
                moveForward: false,
                rotate: false,
            };

            expect(utilities.functionCalledThisFrame(callMap, "moveForward")).to.be.equal(false);
            expect(utilities.functionCalledThisFrame(callMap, "rotate")).to.be.equal(false);
        });

        it("should return true when api functions were called this frame", () => {
            const callMap = {
                moveForward: true,
                rotate: true,
            };

            expect(utilities.functionCalledThisFrame(callMap, "moveForward")).to.be.equal(true);
            expect(utilities.functionCalledThisFrame(callMap, "rotate")).to.be.equal(true);
        });
    });

    describe("#resetCallMap()", () => {
        it("should reset object holding data about called api functions", () => {
            const callMap = {
                moveForward: true,
                moveBackward: true,
                rotate: true,
                shoot: false,
            };

            utilities.resetCallMap(callMap);
            expect(callMap).to.have.property("moveForward", false, "moveForward was not reset");
            expect(callMap).to.have.property("moveBackward", false, "moveBackward was not reset");
            expect(callMap).to.have.property("rotate", false, "rotate is not reset");
            expect(callMap).to.have.property("shoot", false, "shoot is not reset");
        });
    });

    describe("#getExportedFunction()", () => {
        const apiFunctions = {
            move: () => {
                return true;
            },
        };

        it("should return function 'move' of requested key", () => {
            expect(utilities.getExportedFunction(apiFunctions, "move")).to.be.a("function");
        });

        it("should return 'undefined' when requested function does not exist", () => {
            expect(utilities.getExportedFunction(apiFunctions, "shoot")).to.be.a("undefined");
        });

        it("should return 'undefined' when given function map is invalid", () => {
            expect(utilities.getExportedFunction(null, "move")).to.be.a("undefined");
        });
    });

    describe("#registerRoundWin()", () => {
        const p0 = new Player(0, 0, 0, new GameTracker(), "P0");
        const p1 = new Player(0, 0, 0, new GameTracker(), "P1");

        beforeEach(() => {
            p0.resetVitals();
            p0.getTracker().reset();
            p1.resetVitals();
            p1.getTracker().reset();
        });

        it("player 'p0' should win the round", () => {
            p1.applyDamage(50);
            utilities.registerRoundWin(p0, p1);
            expect(p0.getTracker().roundsWon).to.be.equal(1);
            expect(p1.getTracker().roundsWon).to.be.equal(0);
        });

        it("player 'p1' should win the round", () => {
            p0.applyDamage(50);
            utilities.registerRoundWin(p0, p1);
            expect(p0.getTracker().roundsWon).to.be.equal(0);
            expect(p1.getTracker().roundsWon).to.be.equal(1);
        });

        it("neither player wins the round", () => {
            p0.applyDamage(10);
            p1.applyDamage(10);
            utilities.registerRoundWin(p0, p1);
            expect(p0.getTracker().roundsWon).to.be.equal(0);
            expect(p1.getTracker().roundsWon).to.be.equal(0);
        });
    });

    describe("#getGameWinner()", () => {
        const p0 = new Player(0, 0, 0, new GameTracker(), "P0");
        const p1 = new Player(0, 0, 0, new GameTracker(), "P1");

        beforeEach(() => {
            p0.resetVitals();
            p0.getTracker().reset();
            p1.resetVitals();
            p1.getTracker().reset();
        });

        it("should decide 'P0' as a game winner", () => {
            p1.applyDamage(50);
            utilities.registerRoundWin(p0, p1);
            expect(utilities.getGameWinner(p0, p1)).to.be.equal("P0");
        });

        it("should decide 'P1' as a game winner", () => {
            p0.applyDamage(50);
            utilities.registerRoundWin(p0, p1);
            expect(utilities.getGameWinner(p0, p1)).to.be.equal("P1");
        });

        it("should decide a draw", () => {
            p0.applyDamage(50);
            p1.applyDamage(50);
            utilities.registerRoundWin(p0, p1);
            expect(utilities.getGameWinner(p0, p1)).to.be.equal(-1);
        });
    });

    describe("#insideFov", () => {
        const p0 = getPlayerInstance();
        const p1 = getPlayerInstance();

        beforeEach(() => {
            p0.resetPosition();
            p1.resetPosition();
        });

        it("player 'p1' should be visible by player 'p2'", () => {
            p1.x = 100;
            expect(utilities.insideFOV(p0, p1)).to.be.equal(true);
        });

        it("player 'p1' should not be visible by player 'p2'", () => {
            p0.rotateGlobal(0.1, 0.5, 0.16);
            expect(utilities.insideFOV(p0, p1)).to.be.equal(false);
        });
    });

    describe("#checkForHits", () => {
        const p0 = getPlayerInstance();
        const p1 = getPlayerInstance();

        beforeEach(() => {
            p0.getTracker().reset();
            p1.getTracker().reset();
            p0.resetVitals();
            p1.resetVitals();
        });

        it("player 'p0' should be hit by player 'p1'", () => {
            p1.createBullet();
            p1.updateBulletPositions(0.16, undefined);
            p0.x = 56;

            utilities.checkForHits(p1, p0, () => {
                expect(true).to.be.equal(true);
            }, (event: any) => {
                expect(event).to.be.a("object");
            });

            expect(p1.getTracker().damageDone).to.be.greaterThan(0);
        });

        it("player 'p0' should not be hit by player 'p1'", () => {
            p1.createBullet();
            p1.updateBulletPositions(0.16, undefined);
            p0.x = 560;

            utilities.checkForHits(p1, p0, () => {
                expect(true).to.be.equal(true);
            }, (event: any) => {
                expect(event).to.be.a("object");
            });

            expect(p1.getTracker().damageDone).to.be.equal(0);
        });
    });

    describe("#wallCollision()", () => {
        const tests = [
            {
                args: { x: 0, y: 0 },
                expected: true,
            },
            {
                args: { x: 250, y: 250 },
                expected: false,
            },
            {
                args: { x: CONSTANTS.MAP_WIDTH, y: CONSTANTS.MAP_HEIGHT },
                expected: true,
            },
        ];

        tests.forEach((test) => {
            const { x, y } = test.args;
            const player = getPlayerInstance();
            player.x = x;
            player.y = y;

            it(`player should collide with wall at position (${player.x};${player.y})`, () => {
                // tslint:disable-next-line: no-empty
                const result = utilities.wallCollision(player.getPosition(), () => { });
                expect(result).to.be.equal(test.expected);
            });
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

    describe("#getPosition()", () => {
        const player = getPlayerInstance();

        it("should return player's initial position object with x and y coordinates", () => {
            const position = player.getPosition();
            expect(position).to.have.property("x", 0);
            expect(position).to.have.property("y", 0);
        });
    });

    describe("#setTargetPosition()", () => {
        const player = getPlayerInstance();

        it("should set target's position in x and y coordinates", () => {
            player.setTargetPosition(100, 200);
            expect(player.getTargetPosition(), "to be equal").to.deep.equal({
                x: 100,
                y: 200,
            });
        });
    });

    describe("#initBulletPool()", () => {
        const player = getPlayerInstance();

        it("should create new bullet pool for player", () => {
            player.initBulletPool();
            expect(player.getCurrentBulletPoolSize()).to.be.equal(CONSTANTS.BULLET_POOL_SIZE);
        });
    });

    describe("#refreshEnergy()", () => {
        const player = getPlayerInstance();

        beforeEach(() => {
            player.resetBulletPool();
            player.resetVitals();
        });

        it(`should replenish player's energy by ${CONSTANTS.ENERGY_REFRESH_STEP}`, () => {
            let energySpent = 0;

            for (let i = 0; i < 2; i++) {
                player.createBullet();
                energySpent += CONSTANTS.BULLET_COST;

                while (player.getObjectState().gunCooldown !== 0) {
                    player.decrementGunCooldown();
                }
            }

            player.refreshEnergy();
            energySpent -= CONSTANTS.ENERGY_REFRESH_STEP;
            expect(player.getObjectState().energy).to.be.equal(CONSTANTS.EN_FULL - energySpent);
        });

        it(`should not go above maximum energy capacity of ${CONSTANTS.EN_FULL}`, () => {
            expect(player.getObjectState().energy).to.be.equal(CONSTANTS.EN_FULL);
            player.refreshEnergy();
            expect(player.getObjectState().energy).to.be.equal(CONSTANTS.EN_FULL);
        });
    });

    describe("#updateBulletPositions()", () => {
        const player = getPlayerInstance();

        beforeEach(() => {
            player.resetBulletPool();
        });

        it("should update position of active bullets", () => {
            player.createBullet();
            // tslint:disable-next-line: no-empty
            player.updateBulletPositions(0.01, () => { });
            const bullet = player.getActiveBullets()[0];
            expect(bullet.x).to.not.be.equal(0);
        });

        it("should dispose bullet back to pool it it is outside map", () => {
            player.createBullet();
            expect(player.getActiveBullets().length).to.be.equal(1);

            for (let i = 0; i < 2; i++) {
                // tslint:disable-next-line: no-empty
                player.updateBulletPositions(16, () => { });
            }

            expect(player.getActiveBullets().length).to.be.equal(0);
        });
    });

    describe("#rotateTurret()", () => {
        const player = getPlayerInstance();

        beforeEach(() => {
            player.turretRotation = 0;
        });

        it("should rotate bot's gun", () => {
            const initialRotation = player.getObjectState().turretRotation;
            player.rotateTurret(1, 0, 0.16);
            const currentRotation = player.getObjectState().turretRotation;
            expect(currentRotation).to.not.be.equal(initialRotation);
        });

        it("should rotate bot's gun by 10 degrees until destination angle is reached", () => {
            const radians = 10 * (Math.PI / 180);
            const reverseAngleRadians = 80 * (Math.PI / 180);
            const xComponent = Math.cos(radians);
            const yComponent = Math.sin(radians);

            while (player.rotateTurret(xComponent, yComponent, 0.16)) {
                player.rotateTurret(xComponent, yComponent, 0.16);
            }

            expect(player.turretRotation).to.be.closeTo(reverseAngleRadians, 0.01);
        });
    });

    describe("#rotateGlobal()", () => {
        const player = getPlayerInstance();

        before(() => {
            player.rotation = 0;
        });

        it("should rotate player by 90 degrees", () => {
            const destinationAngle = Math.atan2(-1, 0);

            while (player.rotateGlobal(-1, 0, 0.16)) {
                player.rotateGlobal(-1, 0, 0.16);
            }

            expect(destinationAngle).to.be.closeTo(destinationAngle, 0.01);
        });
    });

    describe("#getPlayerInfo()", () => {
        it("should return object of player's state with appropriate fields", () => {
            const player = getPlayerInstance();
            const info = player.getPlayerInfo();

            expect(info).to.have.all.keys([
                "enemyDistance",
                "enemyVisible",
                "energy",
                "gunCooldown",
                "health",
                "position",
                "rotation",
                "turretRotation",
            ]);
        });
    });
});
