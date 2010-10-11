class CreateLocations < ActiveRecord::Migration
  def self.up
    create_table :locations do |t|
      t.column :loc_code, :integer
      t.column :loc_desc, :string
      t.column :the_geom, :point, :create_using_addgeometrycolumn => false, :spatial => true
    end
  end

  def self.down
    drop_table :locations
  end
end

