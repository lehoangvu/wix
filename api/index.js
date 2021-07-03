let bodyParser = require("body-parser");
let config = require("config");
let path = require("path");
let express = require("express");
const cors = require("cors");
let mongo = require("./mongo");


let app = express();
app.enable("trust proxy");
app.set("view engine", "ejs").set("views", "./views");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('./route'))

module.exports = {
	app,
	prepare: async () => {
		return mongo.connect()
	}
}