
import express from "express";
const router = express.Router();
import { User, Word, Wordbook } from "../models/models.js";
import { name } from "ejs";

// // view   get
// router.get("/", async (req, res) => {
//   try {
//     const { _id } = res.locals.user;
//     const todoUser = await User.findById(_id);

//     res.render("wordbooks/index.ejs", { wordbooks: todoUser.wordbooks });
//   } catch (error) {
//     console.error(error);
//     res.status(418).redirect("/");
//   }
// });

// router.get("/new", (req, res) => {
//   res.render("new.ejs");
// });

// create post
router.post("/", async (req, res) => {
  try {

    const wordName = req.body.name;
    const word = new Word({
      name: wordName,
      favorite: 0,
      wordbooks: [],
    });
    await word.save();



    // push theis wordbook into the user's wordbooks  将这个 wordbook 添加到一个用户的 `wordbooks` 数组中
    const { _id } = req.session.user;
    const user = await User.findOne({ _id: _id });

    user.wordbooks.push(wordbook);
    await user.save();
    res.status(200).redirect("/wordbooks");
  } catch (error) {
    console.error(error);
    res.status(418).redirect("/");
  }
});

// delete
router.delete("/:wordbookId", async (req, res) => {
  try {
    const wordbookId = req.params.wordbookId;
    const { _id } = req.session.user;
    const todoUser = await User.findById(_id);

    todoUser.wordbooks.id(wordbookId).deleteOne();
    await todoUser.save();
    res.status(200).redirect("/wordbooks");
  } catch (error) {
    console.error(error);
    res.status(418).redirect("/");
  }
});

// edit  view
router.get("/:wordbookId/edit", async (req, res) => {
  try {
    const wordbookId = req.params.wordbookId;
    const { _id } = req.session.user;
    const todoUser = await User.findById(_id);
    const wordbook = todoUser.wordbooks.id(wordbookId);
    res.status(200).render("edit.ejs", { wordbook: wordbook });
  } catch (error) {
    console.error(error);
    res.status(500).send("Cannot load the edit form");
  }
});

// update
router.put("/:wordbookId", async (req, res) => {
  try {
    const { _id } = req.session.user;
    const wordbookId = req.params.wordbookId;

    const wordbook = await Wordbook.findById(wordbookId);

    if (!wordbook) {
      return res.status(404).send("Wordbook not found");
    }

    // update collection  Wordbook  category field
    wordbook.category = req.body.category;
    await wordbook.save();

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // update collection  user  category field
    const subwordbook = user.wordbooks.id(wordbookId);
    if (subwordbook) {
      subwordbook.category = req.body.category;
      await user.save();
    }
    res.status(200).redirect("/wordbooks");
  } catch (error) {
    console.error(error);
    res.status(500).send("Cannot load the edit form");
  }
});

export default router;
