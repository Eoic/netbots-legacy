import express from "express";
const app = express();
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import expressHbs from "express-handlebars";
import session from "express-session";
import morgan from "morgan";
import path from "path";
dotenv.config();
/*
import uuidv4 from "uuid/v4";
const useRoutes = require("./routes/routes");
const config = require('../config');
const { connect } = require('./models/Index');
connect(process.env.MONGO_URI || config.mongoURI);
const port = process.env.PORT || config.devPort;
import WebSocket from 'ws';
*/
// const MemoryStore = require("memorystore")(session);
// const store = new MemoryStore();

// Game logic
// const { loop, wsServerCallback } = require("./game-api/core");

// Create handlebars engine instance
const hbs = expressHbs.create({
    defaultLayout: "layout",
    extname: ".hbs",
    helpers: {
        compareStrings: (left: string, right: string) => {
            if (left === right) {
                return "selected";
            }
        },
        ticksToSeconds(ticks: number) {
            const secondsTotal = Math.round(ticks / 30);
            const minutes = Math.floor(secondsTotal / 60);
            const seconds = secondsTotal % 60;
            return `${minutes} mins. and ${seconds} sec.`;
        },
        getPercent: (numerator: number, denominator: number) => {
            if (denominator !== 0 && numerator <= denominator) {
                return Math.round((numerator / denominator) * 100);
            }

            return 0;
        },
        getValueOrEmpty: (data: object) => (typeof data !== "undefined") ? data : "",
        increment: (value: number) => ++value,
        isArrayEmpty: (array: []) => (array.length === 0),
        isDefined: (value: object) => (typeof value !== "undefined") ? true : false,
        isNotZero: (value: number) => !(value === 0),
        isTrue: (value: boolean) => (value === true),
        toLocaleString: (dateString: string) => {
            return new Date(dateString).toLocaleString("lt-LT", { day: "numeric", month: "2-digit", year: "numeric", hour: "numeric", minute: "numeric" });
        },
    },
    partialsDir: "views/partials",
});

// Set handlebars view engine
app.engine("hbs", hbs.engine as any);
app.set("view engine", "handlebars");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/static", express.static(path.join(__dirname, "public")));

/*
app.use(session({
    cookie: {
        maxAge: config.cookieAge || process.env.COOKIE_AGE,
    },
    genid: () => uuidv4(),
    resave: false,
    saveUninitialized: false,
    secret: config.sessionKey || process.env.SESSION_KEY,
    store,
}));
*/

app.use(morgan("tiny"));
app.use(cookieParser());
// useRoutes(app);

app.get("/", (req, res) => {
    res.json({ msg: "Message" });
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

/*
// Start game web socket server and game loop
const wsServer = new WebSocket.Server({ server });
wsServer.on("connection", (ws, req) => {
    wsServerCallback(ws, req, store)
});

loop();
*/
