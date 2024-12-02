import mongoose from 'mongoose';


// Wordbook Schema  contains many words - 包含多个 Word 
const wordbookSchema = mongoose.Schema({
  category: {
    type: String,
    required: true,
    default:'unfamiliar'
  },
  words:[{
    type:mongoose.Schema.Types.ObjectId,// 引用 Word 模型，允许每个 Wordbook 包含多个 Word
    ref:'Word'
  }]
 
});
// User Schema - every users can have many wordbooks 每个用户有多个 Wordbook
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  wordbooks: [wordbookSchema]
});

// Word Schema - 每个 Word 关联多个 Wordbook
const wordSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  wordbooks:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Wordbook'// 每个 Word 可能存在于多个 Wordbook 中
  }]
 
});

const User     = mongoose.model('User', userSchema);
const Wordbook = mongoose.model('Wordbook', wordbookSchema);
const Word     = mongoose.model('Word', wordSchema);

export {User,Wordbook,Word};
