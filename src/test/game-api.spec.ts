import chai from "chai";
import { CONSTANTS, GameTracker, Player, utilities, Vector } from "../game-api/api";

const should = chai.should();
const expect = chai.expect;

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
            expect(normalized.x, "x [value]").to.be.closeTo(0.894, 0.001);
            expect(normalized.y, "y [value]").to.be.closeTo(0.447, 0.001);
        });
    });
});

describe("Player", () => {
    const gameTrackerOne = new GameTracker();
    const gameTrackerTwo = new GameTracker();
    const playerOne = new Player(0, 0, 0, gameTrackerOne, "playerOne");
    const playerTwo = new Player(0, 0, 0, gameTrackerTwo, "playerTwo");
});
