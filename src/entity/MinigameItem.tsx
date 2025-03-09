import { Schema, model, Document, models } from "mongoose";

// Định nghĩa interface cho MinigameItem document
interface IMinigameItem extends Document {
  itemId: string;
  name: string;
  description: string;
  strength: number;
  rarity: string;
  sellValue: number;
  durability: number;
}

// Schema MinigameItem
const minigameItemSchema = new Schema<IMinigameItem>({
  itemId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  strength: {
    type: Number,
    required: true,
    default: 3,
  },
  rarity: {
    type: String,
    required: true,
  },
  sellValue: {
    type: Number,
    required: true,
  },
  durability: {
    type: Number,
    required: true,
  },
});

const MinigameItem =
  models.MinigameItem ||
  model<IMinigameItem>("MinigameItem", minigameItemSchema);
export default MinigameItem;
