const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const express = require("express");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "todoApplication.db");
let db = null;

const initialiseAndStartServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`dbError:${e.message}`);
    process.exit(1);
  }
};
initialiseAndStartServer();

//todos api

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  const getbooks = `SELECT * FROM todo WHERE status LIKE '%${status}%' AND priority LIKE '%${priority}%' AND todo LIKE '%${search_q}%';`;
  const dbResponse = await db.all(getbooks);
  response.send(dbResponse);
});

//todos/:todoId/
//specific todo

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const gettodo = `SELECT * FROM todo WHERE id=${todoId};`;
  const dbResponse = await db.get(gettodo);
  response.send(dbResponse);
});

//create todo
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const createtodo = `INSERT INTO todo (id,todo,priority,status) VALUES (${id},'${todo}','${priority}','${status}');`;
  const dbResponse = await db.run(createtodo);
  response.send("Todo Successfully Added");
});

//update todo
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updated = request.body;
  let upvalue = null;
  let updaterow = null;
  let row = null;
  switch (true) {
    case updated.status !== undefined:
      upvalue = updated.status;
      updaterow = "Status";
      row = "status";
      break;
    case updated.priority !== undefined:
      upvalue = updated.priority;
      updaterow = "Priority";
      row = "priority";
      break;
    case updated.todo !== undefined:
      upvalue = updated.todo;
      updaterow = "Todo";
      row = "todo";
      break;
  }
  //console.log(upvalue);
  //console.log(updaterow);
  const previoustodoquery = `SELECT * FROM todo WHERE id=${todoId};`;
  const previoustodo = await db.get(previoustodoquery);
  const updatequery = `UPDATE todo SET '${row}'='${upvalue}' WHERE id=${todoId};`;
  const updateddbResponse = await db.run(updatequery);
  response.send(`${updaterow} Updated`);
});

//delete todo

const deletetodo = app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletequery = `DELETE FROM todo WHERE id=${todoId};`;
  const dbResponse = await db.run(deletequery);
  response.send("Todo Deleted");
});

module.exports = deletetodo;
