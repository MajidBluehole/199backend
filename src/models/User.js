module.exports = (sequelize, DataTypes) => {

  const User = sequelize.define("User", {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizations', // table name
        key: 'organization_id',
      },
      field: 'organization_id'
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true,
      validate: { isEmail: true },
      set(value) {
        this.setDataValue("email", value.trim().toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // set to true for Google login
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    country_code: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    countryId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Countries", // matches table name in DB
        key: "id",
      },
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: DataTypes.DATE,
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
    verificationToken: DataTypes.STRING,
    verificationExpires: DataTypes.DATE,
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    googleId: DataTypes.STRING,
    twitterId: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true, // Enables createdAt and updatedAt
    paranoid: true,   // Enables soft deletes by using deletedAt
    underscored: false, // Fields are explicitly mapped, so this is not strictly needed but good practice to be explicit
  });
  return User;
};
