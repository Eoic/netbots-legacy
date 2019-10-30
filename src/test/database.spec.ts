import chai from "chai";
import { config } from "dotenv";
import mongoose from "mongoose";
import { mongoConnect } from "../database";

const expect = chai.expect;

describe("database", () => {
    // Load environment variables.
    before(() => config());

    // Disconnect from database
    after((done) => {
        mongoose.connection.close().then(() => {
            done();
        });
    });

    describe("#mongoConnect()", () => {
        it("should establish connection with the database", (done) => {
            mongoConnect(process.env.MONGO_URI as string).then(() => {
                expect(mongoose.connection.readyState, "should be 1 (connected)").to.be.equal(1);
                done();
            });
        });
    });
});
