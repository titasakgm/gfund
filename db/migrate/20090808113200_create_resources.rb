class CreateResources < ActiveRecord::Migration
  def self.up
    create_table :resources do |t|
      t.column :res_ampcode, :string
      t.column :res_problemcode, :integer
      t.column :res_icontype, :integer
      t.column :res_population, :integer
      t.column :res_code, :integer
      t.column :res_loc_desc, :string
      t.column :the_geom, :point, :create_using_addgeometrycolumn => false, :spatial => true
    end
  end

  def self.down
    drop_table :resources
  end
end

