module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
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
  }, {
    tableName: "Users",
    timestamps: true,
  });

  // Associate using models parameter
  User.associate = (models) => {
    User.belongsTo(models.Country, {
      foreignKey: "countryId",
      as: "country",
    });
  };

  return User;
};
