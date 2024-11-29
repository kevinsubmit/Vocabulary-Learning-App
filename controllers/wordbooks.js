import express from "express";
const router = express.Router();
import { User, Wordbook, Word } from "../models/models.js";

// view   get
router.get("/", async (req, res) => {
  try {
    const { _id } = res.locals.user;
    const todoUser = await User.findById(_id);

    res.render("wordbooks/index.ejs", { wordbooks: todoUser.wordbooks });
  } catch (error) {
    console.error(error);
    res.status(418).redirect("/");
  }
});

router.get("/new", (req, res) => {
  res.render("new.ejs");
});

// create post
router.post("/", async (req, res) => {
  try {
    const wordbookName = req.body.name || "unfamiliar";

    // Check if a Wordbook with the same name already exists for the user
    const { _id } = req.session.user;
    const user = await User.findById(_id);

    const existingWordbook = user.wordbooks.find(
      (wb) => wb.category === wordbookName
    );

    // If a Wordbook with the same name exists, return an error
    if (existingWordbook) {
      return res.status(400).send("A Wordbook with this name already exists.");
    }

    //Create a new Wordbook
    const wordbook = new Wordbook({
      wordAmount: 0,
      category: wordbookName,
      words: [],
    });

    // Save the new Wordbook to the database
    await wordbook.save();

    // Add the new Wordbook to the user's wordbooks array
    user.wordbooks.push(wordbook);
    await user.save();

    // Redirect to the wordbooks page
    res.status(200).redirect("/wordbooks");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while creating the Wordbook.");
  }
});

// delete
router.delete("/:wordbookId", async (req, res) => {
  try {
    const { wordbookId } = req.params;
    const { _id } = req.session.user;
    const todoUser = await User.findById(_id);
    const wordbook = todoUser.wordbooks.id(wordbookId);
  
    // 遍历该 wordbook 中的每个 word，处理其在 wordbooks 中的引用
    for (let wordId of wordbook.words) {
      const word = await Word.findById(wordId);
      if (word) {
        // 如果该 word 只属于当前 wordbook，则删除它
        if (word.wordbooks.length === 1) {
          await word.deleteOne();
        } else {
          // 否则，只从 wordbooks 数组中移除当前 wordbookId
          word.wordbooks.pull(wordbookId);
          await word.save();
        }
      }
    }
    // 2. 从 User 的 wordbooks 中删除该 Wordbook
    todoUser.wordbooks.id(wordbookId).deleteOne();
    // 3. 保存更新后的 User 数据
    await todoUser.save();
    // 4. 删除 Wordbook 本身
    await Wordbook.findById(wordbookId).deleteOne();

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
    const { wordbookId } = req.params;

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

// wordbookList view   get
router.get("/:wordbookId/list", async (req, res) => {
  try {
    const { wordbookId } = req.params;
    // 查询特定的 Wordbook，并且填充它的 words 数组中的 Word 对象
    const wordbook = await Wordbook.findById(wordbookId)
      .populate({
        path: "words", // 填充 words 字段，关联到 Word 模型
        select: "name", // 可以选择你需要返回的字段
      })
      .exec();

    if (!wordbook) {
      return res.status(404).send("Wordbook not found");
    }
    res.render("wordbooks/list.ejs", { words: wordbook.words });
  } catch (error) {
    console.error(error);
    res.status(418).redirect("/");
  }
});

export default router;
