import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const News = new Schema({
  title: String,
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
});
