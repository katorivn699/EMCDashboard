import { Schema, model, Document, models } from "mongoose";

// Định nghĩa interface cho Resource
interface IResource {
  resourceName: string;
  rarity: string;
  dropRate: number;
  baseValue: number;
}

// Định nghĩa interface cho Mine document
interface IMine extends Document {
  mineId: string;
  mineName: string;
  mineDurability: number;
  resources: IResource[];
  createAt: Date;
  lastReset?: Date; // Optional vì không có default
}

// Schema Mine
const mineSchema = new Schema<IMine>({
  mineId: {
    type: String,
    required: true,
    unique: true,
  },
  mineName: {
    type: String,
    required: true,
  },
  mineDurability: {
    type: Number,
    required: true,
  },
  resources: [
    {
      resourceName: {
        type: String,
        required: true,
      },
      rarity: {
        type: String,
        required: true,
      },
      dropRate: {
        type: Number,
        required: true,
      },
      baseValue: {
        type: Number,
        required: true,
      },
    },
  ],
  createAt: {
    type: Date,
    default: Date.now,
  },
  lastReset: {
    type: Date,
  },
});

const Mine = models.Mine || model<IMine>("Mine", mineSchema);
export default Mine;
