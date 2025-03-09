import { Schema, model, Document, models } from "mongoose";

// Định nghĩa interface cho Resource trong inventory
interface IResourceItem {
  resourceName: string;
  quantity: number;
}

// Định nghĩa interface cho Tool (cúp) trong inventory
interface IToolItem {
  itemId: string; // ID tham chiếu đến MinigameItem
  currentDurability: number; // Độ bền hiện tại của công cụ
}

// Định nghĩa interface cho PlayerInventory document
interface IPlayerInventory extends Document {
  playerId: string; // ID của người chơi (có thể là userId từ hệ thống auth)
  resources: IResourceItem[]; // Tài nguyên (Iron, Gold, v.v.)
  tools: IToolItem[]; // Danh sách các "cúp" đã sở hữu
  lastUpdated: Date;
}

// Schema PlayerInventory
const playerInventorySchema = new Schema<IPlayerInventory>({
  playerId: {
    type: String,
    required: true,
    unique: true, // Mỗi người chơi chỉ có một kho
  },
  resources: [
    {
      resourceName: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 0,
      },
    },
  ],
  tools: [
    {
      itemId: {
        type: String,
        required: true,
        ref: "MinigameItem", // Tham chiếu đến MinigameItem
      },
      currentDurability: {
        type: Number,
        required: true,
        default: function () {
          // Lấy độ bền mặc định từ MinigameItem khi thêm mới (nếu có populate)
          return 0; // Giá trị mặc định tạm thời, cần logic populate từ MinigameItem
        },
      },
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Export model
const PlayerInventory =
  models.PlayerInventory || model<IPlayerInventory>("PlayerInventory", playerInventorySchema);
export default PlayerInventory;