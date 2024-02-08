//jslint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");


const DB_URL = "mongodb+srv://myAtlasDBUser:12345@myatlasclusteredu.zdyf7zp.mongodb.net/todoListDB";


async function dbConnect() {
  await mongoose
    .connect(
        DB_URL
    )
    .then(() => {
      console.log("Successfully connected to MongoDB Atlas!");
    })
    .catch((error) => {
      console.log("Unable to connect to MongoDB Atlas!");
      console.error(error);
    });
}

dbConnect();

const itemsSchema = {
  name: { type: String, required: true, minlength: 1 },
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your todolist!",
});
const item2 = new Item({
  name: "Hit the + button to add a new item.",
});
const item3 = new Item({
  name: "Hit this to delete an item -->",
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = new mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  let day = "Today";

  Item.find({}).then((foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
    } else {
      res.render("list", { listTitle: day, newList: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const listName = req.body.list;

  if (item) {
    const newItem = new Item({
      name: item,
    });

    if (listName === "Today") {
      newItem.save();
      res.redirect("/");
    } else {
      List.findOne({ name: listName }).then((foundList) => {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  }
});

app.post("/delete", function (req, res) {
  const delName = req.body.delete;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({ name: delName }).then(() => {
        res.redirect("/");
    });
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {name: delName}}}).then(() => {
        res.redirect("/" + listName);
    })
  }
});



app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName;
  const capCustomListName = _.capitalize(customListName);

  const list = new List({
    name: capCustomListName,
    items: defaultItems,
  });

  List.findOne({ name: capCustomListName }).then(async(foundList) => {
    if (foundList === null) {
      await list.save();
      res.redirect("/" + capCustomListName);
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newList: foundList.items,
      });
    }
  });
});



app.listen(3000, function () {
  console.log("Server is running on port 3000.");
});
