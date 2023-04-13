import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const News = new Schema({
  title: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
