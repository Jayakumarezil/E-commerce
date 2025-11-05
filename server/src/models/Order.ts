import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface OrderAttributes {
  order_id: string;
  user_id: string;
  total_price: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address_json: any;
  created_at: Date;
  updated_at: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'order_id' | 'created_at' | 'updated_at'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public order_id!: string;
  public user_id!: string;
  public total_price!: number;
  public payment_status!: 'pending' | 'paid' | 'failed' | 'refunded';
  public order_status!: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  public shipping_address_json!: any;
  public created_at!: Date;
  public updated_at!: Date;
}

Order.init(
  {
    order_id: {
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
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    order_status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
    shipping_address_json: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['payment_status'],
      },
      {
        fields: ['order_status'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default Order;
