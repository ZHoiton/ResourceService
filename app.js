const express = require("express");
const router = express.Router();
const body_parser = require("body-parser");

const { Connection } = require("./db/connection");
Connection.connect();

const { UserMiddleware, CompanyMiddleware } = require("./app/middleware/middleware");
const { UserController, CompanyController, TaskController, ProjectController } = require("./app/controllers/controllers");

const app = express();

const user_activity_server = require("http").Server(app);
UserController._init(user_activity_server);

const user_socket_port = 9010;
const port = 9000;

// parse application/x-www-form-urlencoded
app.use(body_parser.urlencoded({ extended: false }));

// parse application/json
app.use(body_parser.json());

router.get("/", (req, res) => res.sendStatus(200));

/*
|================================================================
| User routes
|================================================================
*/
router.post("/user", UserController.addUser);

router.get("/user", UserController.getUser);

router.delete("/user", UserController.removeUser);

router.put("/user", UserController.updateUserDetails);

router.patch("/user/image", UserController.updateUserImage);

router.patch("/user/position", UserController.updateUserPosition);

/*
|================================================================
| Company routes
|================================================================
*/

router.post("/company", CompanyMiddleware.addCompany, CompanyController.addCompany);

router.delete("/company", CompanyMiddleware.removeCompany, CompanyController.removeCompany);

router.patch("/company", CompanyMiddleware.updateCompany, CompanyController.updateCompany);

router.delete("/company/clear", CompanyController.cleanCompanies);

router.get("/company/all", CompanyController.getAllCompanies);

/*
|================================================================
| Project routes
|================================================================
*/

router.get("/project", ProjectController.getProject);

router.get("/project/tasks", ProjectController.getTasks);

router.post("/project", ProjectController.createProject);

router.delete("/project", ProjectController.deleteProject);

router.put("/project/participants", ProjectController.updateParticipants);

router.patch("/project/participants", ProjectController.addParticipants);

router.delete("/project/participants", ProjectController.removeParticipants);

router.patch("/project/description", ProjectController.updateDescription);

/*
|================================================================
| Task routes
|================================================================
*/
router.get("/task", TaskController.getTask);

router.post("/task", TaskController.createTask);

router.patch("/task/state", TaskController.updateState);

router.patch("/task/deadline", TaskController.updateDeadline);

router.put("/task/assignees", TaskController.updateAssignees);

router.patch("/task/assignees", TaskController.addAssignees);

router.delete("/task/assignees", TaskController.removeAssignees);

router.patch("/task/labels", TaskController.updateLabels);

router.patch("/task/description", TaskController.updateDescription);

router.patch("/task/author", TaskController.updateTaskAuthor);

router.get("/task/comment", TaskController.getComments);

router.post("/task/comment", TaskController.createComment);

router.patch("/task/comment/body", TaskController.updateCommentBody);

router.delete("/task/comment", TaskController.deleteComment);

//setting a prefix for v1
app.use("/api/v1", router);

app.listen(port, () => console.log(`app started on port ${port}!`));
user_activity_server.listen(user_socket_port);
