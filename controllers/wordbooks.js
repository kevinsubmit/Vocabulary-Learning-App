import express from "express";
const router = express.Router();
import mongoose from 'mongoose';
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

router.post("/search", async (req, res) => {
  try {
    const { _id } = res.locals.user;
    const todoUser = await User.findById(_id);
    res.json({ wordbooks: todoUser.wordbooks });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
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

// delete one wordbook 
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
    // 从 User 的 wordbooks 中删除该 Wordbook
    todoUser.wordbooks.id(wordbookId).deleteOne();
    // 保存更新后的 User 数据
    await todoUser.save();
    //  删除 Wordbook 本身
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

// wordbook word list view   get
router.get("/:wordbookId/list", async (req, res) => {
  try {
    const { wordbookId } = req.params;
    // 查询特定的 Wordbook，并且填充它的 words 数组中的 Word 对象
    const wordbook = await Wordbook.findById(wordbookId)
      .populate({
        path: "words", // 填充 words 字段，关联到 Word 模型
        select: "name", // 只选择返回 name 字段
      })
      .exec();

    if (!wordbook) {
      return res.status(404).send("Wordbook not found");
    }
    // 总条数
    const totalNumber = wordbook.words.length;

    // 获取当前页码，默认为第1页
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5; // 每页展示20个单词
    const skip = (page - 1) * pageSize; // 跳过的记录数

    // 获取当前页的 wordbook.words 数组切片
    const words = wordbook.words.slice(skip, skip + pageSize);

    // 计算总页数
    const totalWords = wordbook.words.length;
    const totalPages = Math.ceil(totalWords / pageSize);

    res.render("words/list.ejs", {
      words,
      currentPage: page,
      totalPages,
      wordbookId,
      totalNumber
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

//delete one word  from one wordbook /use transaction
router.delete("/:wordbookId/:wordId", async (req, res) => {
  const { wordbookId, wordId } = req.params;
  const { _id } = req.session.user;

  // 开始事务
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 从 Wordbook 中删除对应的 wordId 引用
    const wordbook = await Wordbook.findById(wordbookId).session(session);
    if (!wordbook) {
      throw new Error("Wordbook not found");
    }

    // 移除 wordId 在 wordbook 的 words 数组中的引用
    wordbook.words.pull(wordId);
    await wordbook.save({ session });

    // 删除 Word 表中对应的单词
    const word = await Word.findById(wordId).session(session);
    if (!word) {
      throw new Error("Word not found");
    }

    await word.deleteOne({ session });

    // 更新 User 表，移除已删除的 wordbook 中的 wordId
    const user = await User.findById(_id).session(session);
    if (user) {
      const wordbookIndex = user.wordbooks.findIndex(wb => wb._id.toString() === wordbookId);
      if (wordbookIndex > -1) {
        const wordIndex = user.wordbooks[wordbookIndex].words.indexOf(wordId);
        if (wordIndex > -1) {
          // 从 User 的 wordbook 中移除 wordId
          user.wordbooks[wordbookIndex].words.splice(wordIndex, 1);
        }
        await user.save({ session });
      }
    }

    // 提交事务
    await session.commitTransaction();

    // 返回成功响应
    res.status(200).redirect(`/wordbooks/${wordbookId}/list`);
  } catch (error) {
    // 事务回滚
    await session.abortTransaction();
    console.error("Error during delete operation:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  } finally {
    // 结束会话
    session.endSession();
  }
});

export default router;
