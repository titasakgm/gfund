class CreateRoads < ActiveRecord::Migration
  def self.up
    create_table :roads do |t|
      t.column :road_name, :string
      t.column :the_geom, :line, :create_using_addgeometrycolumn => false, :spatial => true
    end
  end

  def self.down
    drop_table :roads
  end
end
