module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define("Country", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    country_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: "Countries",
    timestamps: false,
  });

  // Optional: Define reverse association if needed
  Country.associate = (models) => {
    Country.hasMany(models.User, {
      foreignKey: "countryId",
      as: "users",
    });
  };

  return Country;
};
