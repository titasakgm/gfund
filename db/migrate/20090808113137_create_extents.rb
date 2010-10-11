class CreateExtents < ActiveRecord::Migration
  def self.up
    create_table :extents do |t|
      t.column :code, :string
      t.column :bound, :string
    end
  end

  def self.down
    drop_table :extents
  end
end

