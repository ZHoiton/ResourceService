const express = require("express");
const body_parser = require("body-parser");
const { Connection } = require("./db/connection");
Connection.connect();

const { UserMiddleware, CompanyMiddleware } = require("./app/middleware/middleware");
const { UserController, CompanyController } = require("./app/controllers/controllers");

const app = express();

const port = 9000;

// parse application/x-www-form-urlencoded
app.use(body_parser.urlencoded({ extended: false }));

// parse application/json
app.use(body_parser.json());

app.get("/", (req, res) => res.sendStatus(200));


app.post("/user", UserMiddleware.addUser, UserController.addUser);

app.get("/user", UserMiddleware.getUser, UserController.getUser);

app.delete("/user", UserMiddleware.removeUser, UserController.removeUser);

app.patch("/user/image", UserMiddleware.updateUserImage, UserController.updateUserImage);

app.patch("/user/position", UserMiddleware.updateUserPosition, UserController.updateUserPosition);


app.post("/company", CompanyMiddleware.addCompany, CompanyController.addCompany);

app.delete("/company", CompanyMiddleware.removeCompany, CompanyController.removeCompany);

app.patch("/company", CompanyMiddleware.updateCompany, CompanyController.updateCompany);

app.listen(port, () => console.log(`app started on port ${port}!`));
