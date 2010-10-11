class CreateProvinces < ActiveRecord::Migration
  def self.up
    create_table :provinces do |t|
      t.column :prov_code, :string
      t.column :prov_name, :string
      t.column :the_geom, :polygon, :create_using_addgeometrycolumn => false, :spatial => true
    end
  end

  def self.down
    drop_table :provinces
  end
end

