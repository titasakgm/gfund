class CreateTambons < ActiveRecord::Migration
  def self.up
    create_table :tambons do |t|
      t.column :tam_pcode, :string
      t.column :tam_acode, :string
      t.column :tam_code, :string
      t.column :tam_name, :string
      t.column :the_geom, :polygon, :create_using_addgeometrycolumn => false, :spatial => true
    end
  end

  def self.down
    drop_table :tambons
  end
end

