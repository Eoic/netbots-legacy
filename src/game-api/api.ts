/**
 * Functions, classes and constants used in the game (i.e. move, rotate, shoot etc.)
 */

const MESSAGE_TYPE = {
    DANGER: 3,
    INFO: 1,
    WARNING: 2,
};

class Vector {
    constructor(public x: number, public y: number) {
        this.x = x;
        this.y = y;
    }

    public dot(vector: Vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    public normalize() {
        const dotProduct = this.dot(this);
        const x = this.x / Math.sqrt(dotProduct);
        const y = this.y / Math.sqrt(dotProduct);
        return new Vector(x, y);
    }

    public subtract(vector: Vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    public toString() {
        return `(${this.x}, ${this.y})`;
    }
}

class GameTracker {
    public damageDone: number;
    public roundsWon: number;
    public shotsFired: number;
    public enemiesEliminated: number;

    constructor() {
        this.damageDone = 0;
        this.roundsWon = 0;
        this.shotsFired = 0;
        this.enemiesEliminated = 0;
    }

    /**
     * Update number of damage done by
     * successful bullet hit
     * @param {Number} value Number of damage done to enemy player
     */
    public registerDamageDone(value: number) {
        this.damageDone += value;
    }

    public registerRoundWon() {
        this.roundsWon++;
    }

    public registerShotFired() {
        this.shotsFired++;
    }

    public reset() {
        this.damageDone = 0;
        this.roundsWon = 0;
        this.shotsFired = 0;
        this.enemiesEliminated = 0;
    }

    /**
     * Update number of times enemy was depleted
     * to 0 HP per multiplayer match
     */
    public registerEnemyEliminated() {
        this.enemiesEliminated++;
    }

    public getData() {
        return {
            damageDone: this.damageDone,
            roundsWon: this.roundsWon,
            shotsFired: this.shotsFired,
            enemiesEliminated: this.enemiesEliminated,
        };
    }
}

export interface IBullet {
    x: number;
    y: number;
    rotation: number;
    isAlive: boolean;
}

class Player {
    public playerName: string;
    public x: number;
    public y: number;
    public enemyVisible: boolean;
    public rotation: number;
    public turretRotation: number;
    private startPosX: number;
    private startPosY: number;
    private startRotation: number;
    private health: number;
    private energy: number;
    private enemyDistance: number;
    private bulletPool: IBullet[];
    private messages: [];
    private targetPosX: number;
    private targetPosY: number;
    private tracker: GameTracker;
    private cooldownTicks: number;
    private targetPositionReached: boolean;

    constructor(x: number, y: number, rotation: number, tracker: GameTracker, playerName: string) {
        this.startPosX = x;
        this.startPosY = y;
        this.startRotation = rotation;
        this.x = x;
        this.y = y;
        this.health = CONSTANTS.HP_FULL;
        this.energy = CONSTANTS.EN_FULL;
        this.rotation = rotation;
        this.turretRotation = 0;
        this.enemyDistance = -1;
        this.bulletPool = [];
        this.messages = [];
        this.initBulletPool();
        this.targetPosX = 0;
        this.targetPosY = 0;
        this.tracker = tracker;
        this.playerName = playerName;
        this.cooldownTicks = 0;
        this.targetPositionReached = true;
        this.enemyVisible = false;
    }

    public refreshEnergy() {
        if (this.energy + CONSTANTS.ENERGY_REFRESH_STEP <= CONSTANTS.EN_FULL) {
            this.energy += CONSTANTS.ENERGY_REFRESH_STEP;
        } else {
            this.energy = CONSTANTS.EN_FULL;
        }
    }

    public getTracker() {
        return this.tracker;
    }

    public resetVitals() {
        this.health = CONSTANTS.HP_FULL;
        this.energy = CONSTANTS.EN_FULL;
    }

    public resetPosition() {
        this.x = this.startPosX;
        this.y = this.startPosY;
        this.rotation = this.startRotation;
        this.turretRotation = 0;
    }

    public applyDamage(damage: number) {
        if (this.health - damage >= 0) {
            this.health -= damage;
            return damage;
        } else {
            const healthLeftover = this.health;
            this.health = 0;
            return healthLeftover;
        }
    }

    public rotateGlobal(x: number, y: number, delta: number) {
        const destinationDegree = Math.atan2(x, y);
        const direction = (destinationDegree > 0) ? 1 : -1;

        if (Math.abs(this.rotation - destinationDegree) > CONSTANTS.PRECISION) {
            this.rotation += direction * delta;
            this.rotation = this.rotation % (2 * Math.PI);
            return true;
        } else {
            this.rotation = Math.atan2(x, y);
            return false;
        }
    }

    public getPosition() {
        return {
            x: this.x,
            y: this.y,
        };
    }

    public setTargetPosition(x: number, y: number) {
        this.targetPosX = x;
        this.targetPosY = y;
    }

    public getTargetPosition() {
        return {
            x: this.targetPosX,
            y: this.targetPosY,
        };
    }

    public initBulletPool() {
        if (this.bulletPool.length > 0) {
            this.bulletPool = [];
        }

        for (let i = 0; i < CONSTANTS.BULLET_POOL_SIZE; i++) {
            this.bulletPool.push({
                isAlive: false,
                rotation: 0,
                x: 0,
                y: 0,
            });
        }
    }

    // Called on each round.
    public resetBulletPool() {
        this.cooldownTicks = 0;
        this.bulletPool.forEach((bullet: IBullet) => {
            bullet.x = 0;
            bullet.y = 0;
            bullet.rotation = 0;
            bullet.isAlive = false;
        });
    }

    public getCurrentBulletPoolSize() {
        return this.bulletPool.filter((bullet) => bullet.isAlive === false).length;
    }

    public getActiveBullets() {
        return this.bulletPool.filter((bullet: IBullet) => bullet.isAlive === true);
    }

    public updateBulletPositions(delta: number, onBulletMissCallback: any) {
        this.getActiveBullets().forEach((bullet: IBullet) => {
            if (bullet.x > CONSTANTS.MAP_WIDTH + CONSTANTS.VISIBLE_MAP_OFFSET ||
                bullet.x < -CONSTANTS.VISIBLE_MAP_OFFSET || bullet.y < -CONSTANTS.VISIBLE_MAP_OFFSET ||
                bullet.y > CONSTANTS.MAP_HEIGHT + CONSTANTS.VISIBLE_MAP_OFFSET) {
                bullet.isAlive = false;

                // Bullet is outside of map. Call bullet miss
                if (typeof onBulletMissCallback !== "undefined") {
                    onBulletMissCallback();
                }
            } else {
                bullet.x += delta * Math.cos(bullet.rotation) * CONSTANTS.BULLET_TRAVEL_SPEED;
                bullet.y += delta * Math.sin(bullet.rotation) * CONSTANTS.BULLET_TRAVEL_SPEED;
            }
        });
    }

    public decrementGunCooldown() {
        if (this.cooldownTicks > 0) {
            this.cooldownTicks--;
        }
    }

    public createBullet() {
        if (this.cooldownTicks !== 0) {
            return false;
        }

        for (let i = 0; i < CONSTANTS.BULLET_POOL_SIZE; i++) {
            if (this.bulletPool[i].isAlive === false) {
                this.bulletPool[i] = {
                    isAlive: true,
                    rotation: this.rotation + this.turretRotation,
                    x: this.x,
                    y: this.y,
                };
                this.tracker.registerShotFired();
                this.cooldownTicks = CONSTANTS.GUN_COOLDOWN;
                this.energy -= CONSTANTS.BULLET_COST;
                return true;
            } else if (i === CONSTANTS.BULLET_POOL_SIZE - 1) {
                return false;
            }
        }
    }

    public rotateTurret(x: number, y: number, delta: number) {
        const destinationDegree: number = Math.atan2(x, y);
        const direction: number = (destinationDegree > 0) ? 1 : -1;

        if (Math.abs(this.turretRotation - destinationDegree) > CONSTANTS.PRECISION) {
            this.turretRotation += direction * delta * CONSTANTS.TURRET_ROTATION_SPEED;
            this.turretRotation = this.turretRotation % (2 * Math.PI);
            return true;
        } else {
            this.turretRotation = Math.atan2(x, y);
            return false;
        }
    }

    public setEnemyDistance(targetPosition: any) {
        this.enemyDistance = Math.sqrt(Math.pow(targetPosition.x - this.x, 2) + Math.pow(targetPosition.y - this.y, 2));
        this.enemyVisible = true;
    }

    public getObjectState() {
        return {
            bulletPool: this.bulletPool,
            enemyDistance: this.enemyDistance,
            enemyVisible: false,
            energy: this.energy,
            gunCooldown: this.cooldownTicks,
            health: this.health,
            rotation: this.rotation,
            tracker: this.tracker.getData(),
            turretRotation: this.turretRotation,
            x: this.x,
            y: this.y,
        };
    }

    public getPlayerInfo() {
        return {
            enemyDistance: this.enemyDistance,
            enemyVisible: false,
            energy: this.energy,
            gunCooldown: this.cooldownTicks,
            health: this.health,
            position: {
                x: this.x,
                y: this.y,
            },
            rotation: this.rotation,
            turretRotation: this.turretRotation,
        };
    }
}

const CONSTANTS = {
    BULLET_COST: 6,
    BULLET_DAMAGE: 20,
    BULLET_POOL_SIZE: 20,
    BULLET_TRAVEL_SPEED: 350,
    EN_FULL: 100,
    HP_FULL: 100,
    // Game info
    MAP_HEIGHT: 464,
    MAP_WIDTH: 674,
    MOVEMENT_SPEED: 130,
    PLAYER_BOX_SIZE: 27,
    P_ONE_START_POS: {
        X: 40,
        Y: 40,
    },
    P_TWO_START_POS: {
        X: 630,
        Y: 420,
    },
    TURRET_ROTATION_SPEED: 3,

    // Player info
    FOV: 8,                             // Approximate half angle size
    GUN_COOLDOWN: 30,                   // In ticks
    PLAYER_HALF_HEIGHT: 21.3,
    PLAYER_HALF_WIDTH: 28,

    // Misc
    ENERGY_REFRESH_STEP: 10,
    PRECISION: 0.1,
    ROUND_COUNT: 5,                 // One multiplayer match length
    ROUND_TICKS_LENGTH: 800,         // 1800 -> ~1 min
    VISIBLE_MAP_OFFSET: 100,
};

const utilities = {
    checkBoundsLowerX: (x: number) => {
        return (x >= CONSTANTS.PLAYER_BOX_SIZE);
    },
    checkBoundsLowerY: (y: number) => {
        return (y + CONSTANTS.PLAYER_BOX_SIZE <= CONSTANTS.MAP_HEIGHT);
    },
    checkBoundsUpperX: (x: number) => {
        return (x + CONSTANTS.PLAYER_BOX_SIZE <= CONSTANTS.MAP_WIDTH);
    },
    checkBoundsUpperY: (y: number) => {
        return (y >= CONSTANTS.PLAYER_BOX_SIZE);
    },

    /**
     * Checks if object with coordinates (x; y) is not hitting a wall
     */
    checkMapBounds: (x: number, y: number) => {
        return (utilities.checkBoundsLowerX(x) && utilities.checkBoundsLowerY(y) &&
            utilities.checkBoundsUpperX(x) && utilities.checkBoundsUpperY(y));
    },

    /**
     * Checks if player colliding with map border and
     * calls callback function
     */
    wallCollision: (position: any, onWallHitCallback: any) => {
        if (!utilities.checkMapBounds(position.x, position.y)) {
            onWallHitCallback();
            return true;
        }

        return false;
    },

    // (Called once per frame, not per robot update)
    checkPlayerCollisions: (playerOnePos: any, playerTwoPos: any, onRobotHitCallback: any) => {
        if (playerOnePos.x >= playerTwoPos.x - CONSTANTS.PLAYER_HALF_WIDTH &&
            playerOnePos.y >= playerTwoPos.y - CONSTANTS.PLAYER_HALF_HEIGHT &&
            playerOnePos.x <= playerTwoPos.x + CONSTANTS.PLAYER_HALF_WIDTH &&
            playerOnePos.y <= playerTwoPos.y + CONSTANTS.PLAYER_HALF_HEIGHT) {

            if (typeof onRobotHitCallback !== "undefined") {
                onRobotHitCallback();
            }

            return true;
        }

        return false;
    },

    /**
     * Checks if any of fired bullets damaged enemy player.
     * If hit was detected, dispose bullet and apply damage
     * @param {Array} playerBulletPool
     * @param {Object} enemyInstance
     */
    checkForHits(playerInstance: any, enemyInstance: any, onBulletHitCallback: any, onHitSuccessCallback: any) {
        playerInstance.getActiveBullets().forEach((bullet: IBullet) => {
            if (bullet.isAlive) {
                if (bullet.x >= enemyInstance.x - CONSTANTS.PLAYER_HALF_WIDTH &&
                    bullet.y >= enemyInstance.y - CONSTANTS.PLAYER_HALF_HEIGHT &&
                    bullet.x <= enemyInstance.x + CONSTANTS.PLAYER_HALF_WIDTH &&
                    bullet.y <= enemyInstance.y + CONSTANTS.PLAYER_HALF_HEIGHT) {
                    bullet.isAlive = false;

                    // Register dealt damage
                    const damageAmount = enemyInstance.applyDamage(CONSTANTS.BULLET_DAMAGE);
                    playerInstance.getTracker().registerDamageDone(damageAmount);

                    // Pass info event of enemy being hit
                    // Should be wrapped inside try / catch
                    if (typeof onBulletHitCallback !== "undefined") {
                        onBulletHitCallback();
                    }

                    if (typeof onHitSuccessCallback !== "undefined") {
                        onHitSuccessCallback({
                            health: enemyInstance.health,
                            x: enemyInstance.x,
                            y: enemyInstance.y,
                        });
                    }
                }
            }
        });
    },

    /**
     * Checks if function of given name was called
     * during current frame
     * @param {Object} callMap Function calls lookup object
     * @param {String} functionKey Function name
     */
    functionCalledThisFrame(callMap: any, functionKey: any) {
        if (callMap[functionKey] === true) {
            return true;
        }

        callMap[functionKey] = true;
        return false;
    },

    /**
     * Sets all game API function as uncalled before running code of selected user
     * @param {Object} callMap Function calls lookup object
     */
    resetCallMap(callMap: any) {
        Object.keys(callMap).forEach((key) => {
            callMap[key] = false;
        });
    },

    /**
     * Checks if player exported function of given name
     * exists and returns it
     * @param {Object} apiFunctions
     * @param {String} functionName
     */
    getExportedFunction(apiFunctions: any, functionName: any) {
        try {
            if (apiFunctions.hasOwnProperty(functionName)) {
                return apiFunctions[functionName];
            }
            return undefined;
        } catch (err) {
            return undefined;
        }
    },

    registerRoundWin(playerOne: any, playerTwo: any) {
        if (playerOne.getObjectState().health > playerTwo.getObjectState().health) {
            playerOne.getTracker().registerRoundWon();
        } else if (playerOne.getObjectState().health < playerTwo.getObjectState().health) {
            playerTwo.getTracker().registerRoundWon();
        }

        // Otherwise: draw. Match round count is still incremented,
        // but win is not registered to either player
    },

    /**
     * Determines round winner by comparing won rounds of both players
     * @param {Object} playerOne First player
     * @param {Object} playerTwo Second player
     */
    getGameWinner(playerOne: any, playerTwo: any) {
        if (playerOne.getTracker().roundsWon > playerTwo.getTracker().roundsWon) {
            return playerOne.playerName;
        } else if (playerOne.getTracker().roundsWon < playerTwo.getTracker().roundsWon) {
            return playerTwo.playerName;
        } else {
            return -1;
        }
    },

    /**
     * Checks if enemy is visible in robot's field of view
     * @param {Object} player
     * @param {Object} enemy
     */
    insideFOV(player: any, enemy: any) {
        const turretDirection = new Vector(Math.cos(player.turretRotation + player.rotation), Math.sin(player.turretRotation + player.rotation));
        const targetPosition = new Vector(enemy.x, enemy.y);
        const turretDirectionNormalized = turretDirection.normalize();
        const turretToTarget = targetPosition.subtract(new Vector(player.x, player.y)).normalize();
        const angleDeg = Math.acos(turretDirectionNormalized.dot(turretToTarget)) * (180 / Math.PI);

        // Update target data if it's in robot's FOV range
        if (angleDeg <= CONSTANTS.FOV) {
            player.setEnemyDistance(enemy.getPosition());
            return true;
        }

        // Update target visibility so scanner could return that target is not in range
        player.enemyVisible = false;
        return false;
    },
};

export {
    CONSTANTS,
    GameTracker,
    MESSAGE_TYPE,
    Player,
    Vector,
    utilities,
};
