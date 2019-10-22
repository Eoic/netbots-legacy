import mongoose from "mongoose";

/**
 * Connect to MongoDb server using Mongoose instance
 * @param {String} uri MongoDB connection string
 */
const connect = (uri: string) => {

    mongoose.connect(uri, {
        promiseLibrary: global.Promise as PromiseConstructor,
        useNewUrlParser: true,
    });

    mongoose.connection.on("open", () => {
        console.log("Connected to MongoDB server.");
    });

    mongoose.connection.on("error", (err) => {
        console.log(`Failed to connect: ${err}`);
    });
};

module.exports = {
    connect,
    dbConnection: mongoose.connection,
};
