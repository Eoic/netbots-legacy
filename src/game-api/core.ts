/**
 * For running game logic (i.e. game loop(s))
 */

import uuidv4 from "uuid/v4";
import { NodeVM } from "vm2";
import { CONSTANTS, GameTracker, MESSAGE_TYPE, Player, utilities } from "./api";
const TICK_RATE = 30;
const playerKeys = ["playerOne", "playerTwo"];
import cookie from "cookie";
import { GameSession } from "../models/GameSession";
import { User } from "../models/User";
import { updateUserAchievements } from "./achievements";

const context: any = {
    delta: 0,
    robot: {},
};

const GAME_TYPE = {
    MULTIPLAYER: "M",
    SIMULATION: "S",
};

const codeCache: any = {};

const nodeVM = new NodeVM({
    require: {
        context: "sandbox",
        external: ["node-neural-network"],
        // The only working path... /Users/Karolis/Desktop/web-bots-it/node_modules/node-neural-network
    },
    sandbox: { context },
    wrapper: "commonjs",
});

const time = () => {
    const hrTime: any = process.hrtime();
    return hrTime[0] * 1000 + hrTime[1] / 1000000;
};

let previous = time();
const tickLength = 1000 / TICK_RATE;
const gameStates = {};
const callMap = {
    moveBack: false,
    moveBackX: false,
    moveBackY: false,
    moveForward: false,
    moveForwardX: false,
    moveForwardY: false,
    rotateGlobal: false,
    rotateTurret: false,
    scan: false,
};

// API
// Robot control functions
const player = {
    /**
     * Moves player forwards along by x axis
     */
    moveForwardX: () => {
        if (utilities.functionCalledThisFrame(callMap, player.moveForwardX.name) ||
            utilities.functionCalledThisFrame(callMap, player.moveForward.name)) {
            return;
        }

        if (utilities.checkBoundsUpperX(context.robot.x)) {
            context.robot.x += context.delta * CONSTANTS.MOVEMENT_SPEED;
        }
    },

    /**
     * Moves player forwards along y axis
     */
    moveForwardY: () => {
        if (utilities.functionCalledThisFrame(callMap, player.moveBackY.name) ||
            utilities.functionCalledThisFrame(callMap, player.moveForward)) {
            return;
        }

        if (context.robot.rotateGlobal(-1, 0, context.delta)) {
            if (utilities.checkBoundsUpperY(context.robot.y)) {
                context.robot.y -= context.delta * CONSTANTS.MOVEMENT_SPEED;
            }
        }
    },

    /**
     * Moves player backwards along x axis
     */
    moveBackX: () => {
        if (utilities.functionCalledThisFrame(callMap, player.moveBackX.name) ||
            utilities.functionCalledThisFrame(callMap, player.moveBack.name)) {
            return;
        }

        if (context.robot.rotateGlobal(0, -1, context.delta)) {
            if (utilities.checkBoundsLowerX(context.robot.x)) {
                context.robot.x -= context.delta * CONSTANTS.MOVEMENT_SPEED;
            }
        }
    },

    /**
     * Moves player backwards along y axis
     */
    moveBackY: () => {
        if (utilities.functionCalledThisFrame(callMap, player.moveBackY.name) ||
            utilities.functionCalledThisFrame(callMap, player.moveBack.name)) {
            return;
        }

        if (context.robot.rotateGlobal(1, 0, context.delta)) {
            if (utilities.checkBoundsLowerY(context.robot.y)) {
                context.robot.y += context.delta * CONSTANTS.MOVEMENT_SPEED;
            }
        }
    },

    /**
     * Moves player forwards according to its rotation
     */
    moveForward: () => {
        if (utilities.functionCalledThisFrame(callMap, player.moveForward.name) ||
            utilities.functionCalledThisFrame(callMap, player.moveForwardX.name)) {
            return;
        }

        if (!utilities.checkMapBounds(context.robot.x, context.robot.y)) {
            return false;
        }

        context.robot.x += context.delta * Math.cos(context.robot.rotation) * CONSTANTS.MOVEMENT_SPEED;
        context.robot.y += context.delta * Math.sin(context.robot.rotation) * CONSTANTS.MOVEMENT_SPEED;
        return true;
    },

    /**
     * Moves layer backwards according to its rotation
     */
    moveBack: () => {
        if (utilities.functionCalledThisFrame(callMap, player.moveBack.name) ||
            utilities.functionCalledThisFrame(callMap, player.moveBackX.name)) {
            return;
        }

        if (!utilities.checkMapBounds(context.robot.x, context.robot.y)) {
            return;
        }

        context.robot.x -= context.delta * Math.cos(context.robot.rotation) * CONSTANTS.MOVEMENT_SPEED;
        context.robot.y -= context.delta * Math.sin(context.robot.rotation) * CONSTANTS.MOVEMENT_SPEED;
    },

    /**
     * Rotates player clockwise if degrees < 0,
     * and counter-clockwise if degrees > 0
     */
    rotateGlobal: (degrees: number) => {
        if (utilities.functionCalledThisFrame(callMap, player.rotateGlobal.name)) {
            return;
        }

        degrees += 90;
        const radians = degrees * (Math.PI / 180);
        return context.robot.rotateGlobal(Math.cos(radians), Math.sin(radians), context.delta);
    },

    /**
     * Rotates player clockwise if degrees < 0,
     * and counter-clockwise if degrees > 0
     */
    rotateTurret: (degrees: number) => {
        if (utilities.functionCalledThisFrame(callMap, player.rotateTurret.name)) {
            return;
        }

        degrees += 90;
        const radians = degrees * (Math.PI / 180);
        return context.robot.rotateTurret(Math.cos(radians), Math.sin(radians), context.delta);
    },

    /**
     * Shoots bullets by direction of turet rotation
     */
    shoot: () => {
        if (context.robot.energy >= CONSTANTS.BULLET_COST) {
            return context.robot.createBullet();
        }

        return false;
    },

    /**
     * Returns info about player
     */
    getPlayerInfo: () => {
        return context.robot.getPlayerInfo();
    },
};

// For detecting enemy position
const scanner = {
    /**
     * Field of view of limited length from turret rotation
     * If enemy appears inside it, return its data(coordinates, etc)
     */
    pulse: () => {
        context.robot.scanEnabled = true;
        return context.robot.enemyVisible;
    },

    /**
     * Returns last scanned distance from scanned enemy
     */
    getTargetDistance: () => {
        return context.robot.enemyDistance;
    },
};

// For logging messaget so output window
const logger = {
    log: (content: any, messageType: any) => {
        context.robot.messages.push({
            content,
            type: (typeof messageType !== "undefined") ? messageType : MESSAGE_TYPE.INFO,
        });
    },
};

nodeVM.freeze(player, "player");                // Game API calls
nodeVM.freeze(CONSTANTS, "Game");               // Constants
nodeVM.freeze(logger, "logger");                 // Info output
nodeVM.freeze(MESSAGE_TYPE, "MESSAGE_TYPE");     // Logger message type
nodeVM.freeze(scanner, "scanner");               // Scanner api for locating enemy robot

/**
 * Updates pair of players and returns their updated state
 * through web socket connection
 * @param {double} delta Time since last frame
 */
function update(delta: number) {
    // Iterate through connected clients
    // tslint:disable-next-line: forin
    for (const clientID in gameStates) {
        context.delta = delta;

        // Updates multiplayer game info for client
        // If multiplayerGame ended - stop updating
        if ((updateMultiplayerInfo((gameStates as any)[clientID]) as any) < 0) {
            break;
        }

        // Run code for each robot
        playerKeys.forEach((key, index) => {
            utilities.resetCallMap(callMap);
            context.robot = (gameStates as any)[clientID][key];
            context.robot.decrementGunCooldown();
            context.robot.messages = [];

            try {
                (gameStates as any)[clientID].code[key].update();
            } catch (err) {
                console.log(err);
            }

            utilities.insideFOV(context.robot, (gameStates as any)[clientID][playerKeys[1 ^ index]]);
            utilities.wallCollision(context.robot.getPosition(), utilities.getExportedFunction((gameStates as any)[clientID].code[key], "onWallHit"));
            utilities.checkPlayerCollisions(context.robot.getPosition(), (gameStates as any)[clientID][playerKeys[1 ^ index]].getPosition(), utilities.getExportedFunction((gameStates as any)[clientID].code[key], "onCollision"));
            utilities.checkForHits((gameStates as any)[clientID][playerKeys[1 ^ index]], context.robot, utilities.getExportedFunction((gameStates as any)[clientID].code[key], "onBulletHit"), utilities.getExportedFunction((gameStates as any)[clientID].code[playerKeys[1 ^ index]], "onHitSuccess"));
            context.robot.updateBulletPositions(context.delta, utilities.getExportedFunction((gameStates as any)[clientID].code[key], "onBulletMiss"));
        });

        sendUpdate(gameStates, clientID);    // Send game update after game state were updated
    }
}

// tslint:disable-next-line: no-shadowed-variable
function sendUpdate(gameStates: any, clientId: any) {
    if (gameStates[clientId].socket.readyState === 1) {
        gameStates[clientId].socket.send(JSON.stringify({
            type: "GAME_TICK_UPDATE",
            // tslint:disable-next-line: object-literal-sort-keys
            playerOne: gameStates[clientId].playerOne.getObjectState(),
            playerTwo: gameStates[clientId].playerTwo.getObjectState(),
            gameSession: (typeof gameStates[clientId].multiplayerData !== "undefined") ? gameStates[clientId].multiplayerData : null,
            gameType: gameStates[clientId].gameType,
            messages: [...gameStates[clientId].playerOne.messages, ...gameStates[clientId].playerTwo.messages],
        }));
    }
}

/**
 * Updates info about multiplayer game session
 * @param {Object} gameState
 */
function updateMultiplayerInfo(gameState: any) {
    if (typeof gameState.multiplayerData === "undefined") {
        return 0;
    }

    gameState.multiplayerData.elapsedTicks++;

    if (gameState.multiplayerData.elapsedTicks >= CONSTANTS.ROUND_TICKS_LENGTH || damagedToZero(gameState)) {
        gameState.multiplayerData.elapsedTotalTime += gameState.multiplayerData.elapsedTicks;

        if (gameState.multiplayerData.elapsedRounds === 5) {
            // Game ended
            Reflect.deleteProperty(gameStates, gameState.socket.id);
            endMultiplayerMatch(gameState);
            return -1;
        } else {
            nextRound(gameState);
        }
    }
}

/**
 * Checks if either of two robots was damaged to 0 HP
 * If true, then call next round without waiting round time
 * @param {Object} gameState
 */
function damagedToZero(gameState: any) {
    if (gameState[playerKeys[0]].health === 0 || gameState[playerKeys[1]].health === 0) {
        return true;
    }
    return false;
}

function endMultiplayerMatch(gameState: any) {

    // Determine who won the last round
    utilities.registerRoundWin(gameState[playerKeys[0]], gameState[playerKeys[1]]);
    const winner = utilities.getGameWinner(gameState[playerKeys[0]], gameState[playerKeys[1]]);
    const data: any = [];

    playerKeys.forEach((key) => {
        data.push({
            name: gameState[key].playerName,
            statistics: gameState[key].tracker.getData(),
        });
    });

    /* Remove multiplayer session data after game is finished */
    GameSession.findOneAndRemove({
        sessionId: gameState.multiplayerData.sessionId,
    }).then((sessionData) => {
        gameState.socket.send(JSON.stringify({
            type: "GAME_END",
            // tslint:disable-next-line: object-literal-sort-keys
            gameData: data,
            totalTime: gameState.multiplayerData.elapsedTotalTime,
            winner,
        }));

        updatePlayerStatistics(sessionData, gameState, winner);
    });
}

function updatePlayerStatistics(gameSessionData: any, gameState: any, winner: any) {
    let gameWon = 0;

    if (winner === gameSessionData.createdBy) {
        gameWon = 1;
    }

    User.findOneAndUpdate({ username: gameSessionData.createdBy }, {
        $inc: {
            "statistic.gamesPlayed": 1,
            "statistic.gamesWon": gameWon,
            // tslint:disable-next-line: object-literal-sort-keys
            "statistic.gameTime": gameState.multiplayerData.elapsedTotalTime,
        },
    }).then((user) => {
        if (user !== null) {
            updateUserAchievements(user._id);
        }
    });
}

/**
 * Sets next round on multiplayer match
 * @param {Object} gameState Data about robots in the game
 */
function nextRound(gameState: any) {
    // Determine who won the round
    utilities.registerRoundWin(gameState[playerKeys[0]], gameState[playerKeys[1]]);

    playerKeys.forEach((key) => {
        gameState[key].resetVitals();
        gameState[key].resetPosition();
        gameState[key].resetBulletPool();
    });

    gameState.code = compileScripts(codeCache[gameState.socket.id], playerKeys, [gameState.playerOne, gameState.playerTwo]);
    gameState.multiplayerData.elapsedRounds++;
    gameState.multiplayerData.elapsedTicks = 0;
    return 1;
}

/**
 * Calls game loop and calculates
 * time between frames
 */
export const loop = () => {
    setTimeout(loop, tickLength);
    const now = time();
    const delta = (now - previous) / 1000;
    update(delta);
    previous = now;
};

/**
 * Runs robot scripts once and
 * returns script methods
 * @param {Array} scripts
 * @param {Array} keys
 */
function compileScripts(scripts: any, keys: any, players: any) {
    const code = {};

    try {
        keys.forEach((key: any, index: number) => {
            context.robot = players[index];
            (code as any)[key] = nodeVM.run(scripts[index]);
        });
    } catch (err) {
        console.log(err);
    }

    context.robot = {};
    return code;
}

/**
 * Creates game objects used in game loop
 * @param {Array} scripts
 * @param {Array} playerKeys
 * @param {Object} ws
 */
// tslint:disable-next-line: no-shadowed-variable
// tslint:disable-next-line: no-unnecessary-initializer
function createGameObjects(scripts: any, playerKeys: any, ws: any, gameType: any, names = ["placeholder", "placeholder"], sessionId = undefined) {
    const playerOne = new Player(CONSTANTS.P_ONE_START_POS.X, CONSTANTS.P_ONE_START_POS.Y, 0, new GameTracker(), names[0]);
    const playerTwo = new Player(CONSTANTS.P_TWO_START_POS.X, CONSTANTS.P_TWO_START_POS.Y, 0, new GameTracker(), names[1]);
    const code = compileScripts(scripts, playerKeys, [playerOne, playerTwo]);
    codeCache[ws.id] = scripts; // To compile after each round end (except first)

    (gameStates as any)[ws.id] = {
        code,
        gameType,
        playerOne,
        playerTwo,
        socket: ws,
    };

    if (gameType === GAME_TYPE.MULTIPLAYER) {
        (gameStates as any)[ws.id].multiplayerData = {
            elapsedRounds: 1,
            elapsedTicks: 0,
            elapsedTotalTime: 0,
            sessionId,
        };
    }
}

/**
 * Client connection event handler
 * @param { Object } ws Web socket object
 */
export const wsServerCallback = (ws: any, req: any) => {
    const cookieObject = cookie.parse(req.headers.cookie);
    const sessionId = cookieObject[String(process.env.SESSION_NAME)].slice(2, 38);
    const sessionData = req.session;

    ws.id = uuidv4();

    ws.on("message", (data: any) => {

        const payload = JSON.parse(data);

        switch (payload.type) {
            case "SIMULATION":
                createGameObjects([payload.playerCode, payload.enemyCode], playerKeys, ws, GAME_TYPE.SIMULATION);
                break;
            case "MULTIPLAYER":
                if (typeof sessionData.user.multiplayer !== "undefined") {

                    GameSession.findOne({
                        createdBy: sessionData.user.username,
                        sessionId: sessionData.user.multiplayer.sessionId,
                    }).then((session) => {
                        createGameObjects([(session as any).data[0].code, (session as any).data[1].code],
                            playerKeys, ws, GAME_TYPE.MULTIPLAYER,
                            [(session as any).data[0].username, (session as any).data[1].username],
                            (session as any).sessionId);

                        ws.send(JSON.stringify({
                            type: "PLAYER_NAMES",
                            // tslint:disable-next-line: object-literal-sort-keys
                            names: {
                                playerOne: (session as any).data[0].username,
                                playerTwo: (session as any).data[1].username,
                            },
                        }));
                        // tslint:disable-next-line: no-shadowed-variable
                    }).catch((err) => {
                        console.log(err);
                    });
                }
                break;
        }
    });

    // Delete player connection from gameStates array
    ws.on("close", () => {
        if ((gameStates as any)[ws.id] !== undefined) {
            if ((gameStates as any)[ws.id].gameType === GAME_TYPE.MULTIPLAYER) {

                // User left mid-game.
                // Remove session data and count game as played
                GameSession.findOneAndRemove({
                    createdBy: sessionData.user.username,
                    sessionId: sessionData.user.multiplayer.sessionId,
                }).then(() => {
                    User.findOneAndUpdate({
                        username: sessionData.user.username,
                    }, { $inc: { "statistic.gamesPlayed": 1 } }).then((user) => {
                        if (user !== null) {
                            updateUserAchievements(user._id);
                        }
                    });

                    Reflect.deleteProperty(gameStates, ws.id);
                });
            }
        } else {
            Reflect.deleteProperty(gameStates, ws.id);
        }
    });
};
