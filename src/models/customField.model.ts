import { 
    Table, 
    Column, 
    Model, 
    DataType, 
    PrimaryKey, 
    Default, 
    AllowNull, 
    Unique, 
    Index 
} from 'sequelize-typescript';

export const fieldTypeEnum = ['TEXT', 'NUMBER', 'DATE', 'DROPDOWN', 'MULTI_SELECT'] as const;
export type FieldType = typeof fieldTypeEnum[number];

@Table({
  tableName: 'custom_fields',
  timestamps: true, // This will add createdAt and updatedAt fields
  underscored: true, // This will convert camelCase fields to snake_case in the DB
})
export class CustomField extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @AllowNull(false)
  @Column(DataType.UUID)
  id!: string;

  @Unique({ name: 'idx_custom_fields_name', msg: 'Custom field name must be unique.' })
  @AllowNull(false)
  @Column(DataType.STRING(255))
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  label!: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...fieldTypeEnum))
  fieldType!: FieldType;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  isDeletable!: boolean;

  @Index({ name: 'idx_custom_fields_display_order' })
  @AllowNull(false)
  @Column(DataType.INTEGER)
  displayOrder!: number;

  // createdAt and updatedAt are automatically managed by Sequelize
  // due to the 'timestamps: true' option in the table configuration.
  // They are of type Date.
  createdAt!: Date;
  updatedAt!: Date;
}
