const { DataTypes } = require('sequelize');
const FIELD_TYPES = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  DATE: 'DATE',
  DROPDOWN: 'DROPDOWN',
  MULTI_SELECT: 'MULTI_SELECT',
};

module.exports = (sequelize, DataTypes) => {
  const CustomField = sequelize.define('CustomField', {
     id: {
     type: DataTypes.BIGINT.UNSIGNED,
     autoIncrement: true,
     primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'idx_custom_fields_name',
        msg: 'Custom field name must be unique.'
      },
    },
    label: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fieldType: {
      type: DataTypes.ENUM(
        FIELD_TYPES.TEXT,
        FIELD_TYPES.NUMBER,
        FIELD_TYPES.DATE,
        FIELD_TYPES.DROPDOWN,
        FIELD_TYPES.MULTI_SELECT
      ),
      allowNull: false,
    },
    isDeletable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'CustomField',
    tableName: 'custom_fields',
    timestamps: true,
    underscored: true,
  });

  return CustomField;
};
