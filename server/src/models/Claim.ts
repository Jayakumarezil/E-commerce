import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ClaimAttributes {
  claim_id: string;
  warranty_id: string;
  issue_description: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
}

interface ClaimCreationAttributes extends Optional<ClaimAttributes, 'claim_id' | 'created_at' | 'updated_at'> {}

class Claim extends Model<ClaimAttributes, ClaimCreationAttributes> implements ClaimAttributes {
  public claim_id!: string;
  public warranty_id!: string;
  public issue_description!: string;
  public image_url?: string;
  public status!: 'pending' | 'approved' | 'rejected' | 'resolved';
  public admin_notes?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Claim.init(
  {
    claim_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    warranty_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'warranties',
        key: 'warranty_id',
      },
    },
    issue_description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 2000],
      },
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
      // Removed isUrl validation to allow relative paths
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'resolved'),
      defaultValue: 'pending',
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'claims',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['warranty_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default Claim;
