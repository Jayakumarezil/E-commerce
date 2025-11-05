import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CartItemAttributes {
  cart_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: Date;
}

interface CartItemCreationAttributes extends Optional<CartItemAttributes, 'cart_id' | 'created_at'> {}

class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  public cart_id!: string;
  public user_id!: string;
  public product_id!: string;
  public quantity!: number;
  public created_at!: Date;
}

CartItem.init(
  {
    cart_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'product_id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'cart_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['product_id'],
      },
      {
        unique: true,
        fields: ['user_id', 'product_id'],
      },
    ],
  }
);

export default CartItem;
