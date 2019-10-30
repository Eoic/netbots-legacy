import bcryptjs from "bcryptjs";
import chai from "chai";
import { config } from "dotenv";
import { before } from "mocha";
import mongoose from "mongoose";
import { User } from "../models/User";

const expect = chai.expect;

describe("User", () => {
    const user = {
        username: "mockUser",
        password: "mockPassword",
        identiconHash: "none",
        email: "mockUser@mail.com",
    };

    // Befor all tests, connect to DB.
    before((done) => {
        config();
        mongoose.connect(process.env.MONGO_MOCK_URI as string, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            done();
        });
    });

    // Clean data before each test run
    beforeEach(() => {
        for (const collection in mongoose.connection.collections) {
            if (mongoose.connection.collections.hasOwnProperty(collection)) {
                mongoose.connection.collections[collection].deleteMany({});
            }
        }
    });

    // After tests are executed, clean database and close connection
    after((done) => {
        for (const collection in mongoose.connection.collections) {
            if (mongoose.connection.collections.hasOwnProperty(collection)) {
                mongoose.connection.collections[collection].deleteMany({});
            }
        }

        mongoose.connection.close().then(() => done());
    });

    describe("#pre()", () => {
        it("should hash password before saving to the database", (done) => {
            User.create(user).then((newUser: mongoose.Document) => {
                const match = bcryptjs.compareSync(user.password, (newUser as any).password);
                expect(match, "password is hashed properly").to.be.equal(true);
                done();
            });
        });
    });

    describe("#comparePasswords()", () => {
        it("should return true when user's password is correct", (done) => {
            User.create(user).then((newUser: mongoose.Document) => {
                (newUser as any).comparePasswords(user.password, (err: any, success: boolean) => {
                    expect(success, "password is correct").to.be.equal(true);
                    done();
                });
            });
        });
    });

    describe("#comparePasswords()", () => {
        it("should return false when user's password is incorrect", (done) => {
            User.create(user).then((newUser: mongoose.Document) => {
                (newUser as any).comparePasswords("incorrect pass", (err: any, success: boolean) => {
                    expect(success, "password is correct").to.be.equal(false);
                    done();
                });
            });
        });
    });
});
