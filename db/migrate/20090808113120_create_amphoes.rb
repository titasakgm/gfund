class CreateAmphoes < ActiveRecord::Migration
  def self.up
    create_table :amphoes do |t|
      t.column :amp_pcode, :string
      t.column :amp_code, :string
      t.column :amp_name, :string
      t.column :the_geom, :polygon, :create_using_addgeometrycolumn => false, :spatial => true
    end
  end

  def self.down
    drop_table :amphoes
  end
end

