import { Schema, model, Document, models, Types } from "mongoose";

// Định nghĩa interface cho Resource trong inventory
export interface IResourceItem {
  resourceName: string;
  quantity: number;
}

// Định nghĩa interface cho Tool (cúp) trong inventory
export interface IToolItem {
  _id: Types.ObjectId;
  itemId: string;
  currentDurability: number;
}

// Định nghĩa interface cho PlayerInventory document
export interface IPlayerInventory extends Document {
  playerId: string;
  resources: IResourceItem[];
  tools: IToolItem[];
  lastUpdated: Date;
}

// Schema PlayerInventory
const playerInventorySchema = new Schema<IPlayerInventory>({
  playerId: { type: String, required: true, unique: true },
  resources: [
    {
      resourceName: { type: String, required: true },
      quantity: { type: Number, required: true, default: 0 },
    },
  ],
  tools: [
    {
      itemId: { type: String, required: true, ref: "MinigameItem" },
      currentDurability: {
        type: Number,
        required: true,
        default: 0, // Có thể cập nhật logic nếu cần
      },
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
});

// Export model
const PlayerInventory =
  models.PlayerInventory || model<IPlayerInventory>("PlayerInventory", playerInventorySchema);
export default PlayerInventory;