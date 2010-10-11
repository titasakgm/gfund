class CreateHotspots < ActiveRecord::Migration
  def self.up
    create_table :hotspots do |t|
      t.column :hot_code, :integer
      t.column :hot_desc, :string
    end
  end

  def self.down
    drop_table :hotspots
  end
end
