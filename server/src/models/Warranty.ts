import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface WarrantyAttributes {
  warranty_id: string;
  user_id: string;
  product_id: string;
  purchase_date: Date;
  expiry_date: Date;
  serial_number?: string;
  invoice_url?: string;
  registration_type: 'auto' | 'manual';
  created_at: Date;
  updated_at: Date;
}

interface WarrantyCreationAttributes extends Optional<WarrantyAttributes, 'warranty_id' | 'created_at' | 'updated_at'> {}

class Warranty extends Model<WarrantyAttributes, WarrantyCreationAttributes> implements WarrantyAttributes {
  public warranty_id!: string;
  public user_id!: string;
  public product_id!: string;
  public purchase_date!: Date;
  public expiry_date!: Date;
  public serial_number?: string;
  public invoice_url?: string;
  public registration_type!: 'auto' | 'manual';
  public created_at!: Date;
  public updated_at!: Date;
}

Warranty.init(
  {
    warranty_id: {
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
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    serial_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    invoice_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    registration_type: {
      type: DataTypes.ENUM('auto', 'manual'),
      defaultValue: 'manual',
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
    tableName: 'warranties',
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
        fields: ['expiry_date'],
      },
      {
        fields: ['serial_number'],
        unique: true,
      },
      {
        fields: ['registration_type'],
      },
    ],
  }
);

export default Warranty;
