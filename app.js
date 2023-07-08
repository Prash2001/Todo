//Importing required modules
const express = require("express");
const mongoose = require("mongoose");
const parser = require("body-parser");
require("dotenv").config();
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const { getLocaleDAte } = require("./date");
const app = express();
//connecting to the mongodb cloud
var uri = process.env.URL;
mongoose.connect(uri);
//Defining the schema of simple todo
const todoSchema = mongoose.Schema({
  todo: {
    type: String,
    required: true,
  },
  isDone: {
    type: Boolean,
    default: false,
  },
});

//Craeting model of schema todoSchema
const Todo = mongoose.model("Todo", todoSchema);

//Making ejs as default view engine
app.set("view engine", "ejs");
app.use(parser.urlencoded({ extended: true }));
//all static files are stored in public folder
app.use(express.static("public/"));
//making App to listen on port decided by process thread
app.listen(process.env.PORT || 3000, () => {
  console.log("App is live!");
});

//Making default todo's to boot start user
const todo1 = new Todo({
  todo: "Welcome to your todolist!",
  isDone: false,
});
const todo2 = new Todo({
  todo: "Hit the + button to add a new item.",
  isDone: false,
});
const todo3 = new Todo({
  todo: "<-- Hit this to delete an item",
  isDone: false,
});
const defaultitems = [todo1, todo2, todo3];

//Defining schema of list of different todo's
const listSchema = mongoose.Schema({
  name: String,
  items: [todoSchema],
});
//Creating model of listSchema
const List = mongoose.model("list", listSchema);

//Inserting default todos in database
Todo.find().then(function (FoundItems) {
  if (FoundItems.length <= 0) {
    Todo.insertMany(defaultitems);
  }
});

//Currrent day to show on default todo list
const currentDay = date.getLocaleDate();
app.get("/", async (req, res) => {
  const lst = await Todo.find();
  res.render("list", { listTitle: currentDay, toDos: lst });
});

//Custom todoList will be created on user demand
app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);//making use of lodash to avoid ambugity
  const lst = await List.find({ name: customListName });
  if (lst.length <= 0) {
    const list = new List({
      name: customListName,
      items: defaultitems,
    });
    if (customListName != "Favicon.ico") {
      list.save();
    }
    res.redirect("/" + customListName);
  } else {
    res.render("list", { listTitle: customListName, toDos: lst[0].items });
  }
});

//Adding new todos to particular list 
app.post("/", async (req1, res1) => {
  const todo = req1.body.toDo;
  const list = req1.body.list;
  const newTodo = new Todo({
    todo: todo,
    isDone: false,
  });
  if (list === currentDay) {
    newTodo.save();
    res1.redirect("/");
  } else {
    const newList = await List.findOne({ name: list });
    newList.items.push(newTodo);
    newList.save();
    res1.redirect("/" + list);
  }
});

// Rendering about page
app.get("/about", async (req, res) => {
  res.render("about");
});

//Deleting todo's completed by user
app.post("/deleteItem", async (req3, res3) => {
  const lstName = req3.body.listName;
  const id = req3.body.isDone;
  if (lstName === currentDay) {
    await Todo.findOneAndDelete({ _id: id });
    res3.redirect("/");
  } else {
    await List.findOneAndUpdate(
      { name: lstName },
      { $pull: { items: { _id: id } } }
    );
    res3.redirect("/" + lstName);
  }
});
