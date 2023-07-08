const express = require("express");
const mongoose = require("mongoose");
const parser = require("body-parser");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const { getLocaleDAte } = require("./date");
const app = express();
mongoose.connect("mongodb+srv://admin-prashant:Prash%401237387614381@cluster0.vogammm.mongodb.net/todoDB");
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
const Todo = mongoose.model("Todo", todoSchema);

app.set("view engine", "ejs");
app.use(parser.urlencoded({ extended: true }));
app.use(express.static("public/"));
app.listen(3000, () => {
  console.log("App is live on port 3000!");
});
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
const listSchema = mongoose.Schema({
  name: String,
  items: [todoSchema],
});
const List = mongoose.model("list", listSchema);

Todo.find().then(function (FoundItems) {
  if (FoundItems.length <= 0) {
    Todo.insertMany(defaultitems);
  }
});

const workItems = [];

const currentDay = date.getLocaleDate();
app.get("/", async(req, res) => {
  const lst = await Todo.find();
  if(lst.length<=0){
    await Todo.insertMany(defaultitems);
    res.redirect("/");
  }
  else{
    res.render("list", { listTitle: currentDay, toDos: lst });
  }
});

app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  console.log("------->" + customListName);
  const lst = await List.find({ name: customListName });
  console.log(lst);
  console.log(lst.length);
  if (lst.length <= 0) {
    const list = new List({
      name: customListName,
      items: defaultitems,
    });
    if(customListName!='Favicon.ico'){
      list.save();
    }
    res.redirect("/" + customListName);
  } else {
    res.render("list", { listTitle: customListName, toDos: lst[0].items });
  }
});
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
app.get("/about", async(req, res) => {
  res.render("about");
});

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
