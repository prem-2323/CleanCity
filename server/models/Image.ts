import * as mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  data: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    default: 'image/jpeg',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ImageModel = mongoose.model('Image', imageSchema);
