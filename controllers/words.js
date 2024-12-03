import express from "express";
const router = express.Router();
import mongoose from "mongoose";
import { User, Word, Wordbook } from "../models/models.js";

// search   get
router.get("/search", (req, res) => {
  res.render("words/index.ejs", {
    apiKey: process.env.apiKey,
    apiURL: process.env.apiURL,
  });
});

// create post
router.post("/", async (req, res) => {
  try {
    const { _id } = req.session.user;
    const user = await User.findById(_id);
    const wordbook = await Wordbook.findById(req.body.id);

    // 启动 Mongoose 事务 transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 先判断该word之前存不存在word表中 (这个word是针对所有的user)
      const existingWord = await Word.findOne({ name: req.body.name });
      if (existingWord) {
        if (existingWord.wordbooks.includes(req.body.id)) {
          // 该word之前存在wordbooks中，说明该wordbook已经有该单词了，不存进去
          res.status(501).send("This word aleady exists the wordbook");
          return false;
        } else {
          // 该word之前存在wordbooks中，但是不在这个wordbook了，则存进去这个单词的id，但是不生成该单词
          wordbook.words.push(existingWord._id);
          await wordbook.save({ session });
          // 但是该word 单词 的wordbooks数组里面也要添加目前的wordbook的id
          existingWord.wordbooks.push(req.body.id);
          await existingWord.save({ session });
          // 表user也要更新里面的word字段
          const wordbookIndex = user.wordbooks.findIndex(
            (wb) => wb._id.toString() === req.body.id
          ); // 查找是否存在相应的 wordbook

          if (wordbookIndex !== -1) {
            // 如果该 wordbook 已存在，确保 word 数组已初始化
            if (!user.wordbooks[wordbookIndex].word) {
              user.wordbooks[wordbookIndex].word = [];
            }

            user.wordbooks[wordbookIndex].word.push(existingWord._id);
          } else {
            // 如果 wordbook 不存在，可以选择是否要创建一个新的 wordbook 结构
            user.wordbooks.push({
              _id: req.body.id,
              word: [existingWord._id],
            });
          }

          await user.save({ session });
        }
      } else {
        // 创建新的 Word 并保存
        const newWord = new Word({
          name: req.body.name,
        });

        // 在事务中保存新单词
        await newWord.save({ session });

        // 更新 wordbook
        wordbook.words.push(newWord._id);
        await wordbook.save({ session });

        // 更新单词word的 wordbooks 数组，关联到 wordbook
        newWord.wordbooks.push(wordbook._id);
        await newWord.save({ session });

        // 确保 user 的 wordbooks 数组更新
        const wordbookIndex = user.wordbooks.findIndex(
          (wb) => wb._id.toString() === wordbook._id.toString()
        );
        if (wordbookIndex !== -1) {
          // 如果 `wordbook` 存在，更新其中的 `words`
          user.wordbooks[wordbookIndex] = wordbook; // 更新 wordbook
        } else {
          // 如果 `wordbook` 不在 `user.wordbooks` 中，可以选择将其添加
          user.wordbooks.push(wordbook);
        }
        // 保存更新后的 user 数据
        await user.save({ session });
      }
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

export default router;
