class CreateLocalroads < ActiveRecord::Migration
  def self.up
    create_table :localroads do |t|
      t.column :lroad_name, :string
      t.column :the_geom, :line, :create_using_addgeometrycolumn => false, :spatial => true
    end
  end

  def self.down
    drop_table :localroads
  end
end
