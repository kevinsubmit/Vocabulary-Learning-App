import express from "express";
const router = express.Router();
import mongoose from 'mongoose';
import { User, Word, Wordbook } from "../models/models.js";

// search   get
router.get("/search", (req, res) => {
  res.render("words/index.ejs",{apiKey:process.env.apiKey,apiURL:process.env.apiURL});
});

// create post
router.post("/", async (req, res) => {
  try {
    const { _id } = req.session.user;
    const user = await User.findById(_id);
    const wordbook = await Wordbook.findById(req.body.id);

    // 启动 Mongoose 事务 transaction
  const session = await mongoose.startSession();
  session.startTransaction();  // 开始事务

  try {
    // 创建新的 Word 并保存
    const newWord = new Word({
      name: req.body.name,
      favorite: 0,
    });

    // 在事务中保存新单词
    await newWord.save({ session });

    // 更新 wordbook，添加新单词并更新 wordAmount
    wordbook.words.push(newWord._id);
    wordbook.wordAmount += 1;
    await wordbook.save({ session });

    // 更新新单词的 wordbooks 数组，关联到 wordbook
    newWord.wordbooks.push(wordbook._id);
    await newWord.save({ session });

    // 确保 user 的 wordbooks 数组更新
    const wordbookIndex = user.wordbooks.findIndex(wb => wb._id.toString() === wordbook._id.toString());
    if (wordbookIndex !== -1) {
      // 如果 `wordbook` 存在，更新其中的 `words` 和 `wordAmount`
      user.wordbooks[wordbookIndex] = wordbook;  // 更新 wordbook
    } else {
      // 如果 `wordbook` 不在 `user.wordbooks` 中，可以选择将其添加
      user.wordbooks.push(wordbook);
    }

    // 保存更新后的 user 数据
    await user.save({ session });

    // 提交事务
    await session.commitTransaction();
    res.status(200).send("Successfully added");

  } catch (err) {
    // 如果任何操作失败，回滚事务
    await session.abortTransaction();
    console.error("Transaction failed:", err);
    res.status(500).send("Error processing your request");
  } finally {
    // 结束事务会话
    session.endSession();
  }
  } catch (error) {
    console.error(error);
    res.status(418).send("Error processing your request");
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
