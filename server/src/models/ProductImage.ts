import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProductImageAttributes {
  image_id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  created_at: Date;
}

interface ProductImageCreationAttributes extends Optional<ProductImageAttributes, 'image_id' | 'created_at'> {}

class ProductImage extends Model<ProductImageAttributes, ProductImageCreationAttributes> implements ProductImageAttributes {
  public image_id!: string;
  public product_id!: string;
  public image_url!: string;
  public alt_text?: string;
  public display_order!: number;
  public is_primary!: boolean;
  public created_at!: Date;
}

ProductImage.init(
  {
    image_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'product_id',
      },
      onDelete: 'CASCADE',
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    alt_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'product_images',
    timestamps: false,
    indexes: [
      {
        fields: ['product_id'],
      },
      {
        fields: ['display_order'],
      },
      {
        fields: ['is_primary'],
      },
    ],
  }
);

export default ProductImage;
