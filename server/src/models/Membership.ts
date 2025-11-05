import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MembershipAttributes {
  id: number;
  full_name: string;
  dob: Date | null;
  mobile_primary: string;
  membership_start_date: Date;
  expiry_date: Date;
  payment_mode: 'Cash' | 'GPay';
  amount: number;
  unique_membership_id: string;
  phone_brand_model: string;
  imei_number: string;
  created_at: Date;
  updated_at: Date;
}

interface MembershipCreationAttributes extends Optional<MembershipAttributes, 'id' | 'created_at' | 'updated_at' | 'dob'> {}

class Membership extends Model<MembershipAttributes, MembershipCreationAttributes> implements MembershipAttributes {
  public id!: number;
  public full_name!: string;
  public dob!: Date | null;
  public mobile_primary!: string;
  public membership_start_date!: Date;
  public expiry_date!: Date;
  public payment_mode!: 'Cash' | 'GPay';
  public amount!: number;
  public unique_membership_id!: string;
  public phone_brand_model!: string;
  public imei_number!: string;
  public created_at!: Date;
  public updated_at!: Date;

  // Helper method to check if membership is active
  public isActive(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(this.expiry_date);
    expiry.setHours(0, 0, 0, 0);
    return expiry >= today;
  }
}

Membership.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [2, 255],
      },
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    mobile_primary: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        len: [10, 15],
      },
    },
    membership_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    payment_mode: {
      type: DataTypes.ENUM('Cash', 'GPay'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    unique_membership_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    phone_brand_model: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    imei_number: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        len: [10, 30],
      },
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
    tableName: 'memberships',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeUpdate: (membership: Membership) => {
        membership.updated_at = new Date();
      },
    },
    indexes: [
      {
        fields: ['imei_number'],
        unique: true,
      },
      {
        fields: ['unique_membership_id'],
        unique: true,
      },
      {
        fields: ['mobile_primary'],
      },
      {
        fields: ['expiry_date'],
      },
      {
        fields: ['full_name'],
      },
    ],
  }
);

export default Membership;

