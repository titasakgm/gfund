class CreateMainroads < ActiveRecord::Migration
  def self.up
    create_table :mainroads do |t|
      t.column :mroad_name, :string
      t.column :the_geom, :line, :create_using_addgeometrycolumn => false, :spatial => true
    end
  end

  def self.down
    drop_table :mainroads
  end
end

