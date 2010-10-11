class CreateRiskmaps < ActiveRecord::Migration
  def self.up
    create_table :riskmaps do |t|
      t.column :rm_riskcode, :integer
      t.column :rm_hotdesc, :string
      t.column :rm_hottype, :integer
      t.column :rm_population, :integer
      t.column :rm_rescode, :integer
      t.column :the_geom, :point, :create_using_addgeometrycolumn => false, :spatial => true
    end
  end

  def self.down
    drop_table :riskmaps
  end
end
