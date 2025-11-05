import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface OrderItemAttributes {
  item_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'item_id'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public item_id!: string;
  public order_id!: string;
  public product_id!: string;
  public quantity!: number;
  public price_at_purchase!: number;
}

OrderItem.init(
  {
    item_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'order_id',
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
      validate: {
        min: 1,
      },
    },
    price_at_purchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    timestamps: false,
    indexes: [
      {
        fields: ['order_id'],
      },
      {
        fields: ['product_id'],
      },
    ],
  }
);

export default OrderItem;
