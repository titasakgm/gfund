class CreateLadmins < ActiveRecord::Migration
  def self.up
    create_table :ladmins do |t|
      t.column :la_pcode, :string
      t.column :la_acode, :string
      t.column :la_code, :string
      t.column :la_name, :string
      t.column :the_geom, :polygon, :create_using_addgeometrycolumn => false, :spatial => true
    end
  end

  def self.down
    drop_table :ladmins
  end
end

