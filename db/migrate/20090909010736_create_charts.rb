class CreateCharts < ActiveRecord::Migration
  def self.up
    create_table :charts do |t|
      t.column :ch_lacide, :string
      t.column :ch_p1, :integer
      t.column :ch_p2, :integer
      t.column :ch_p3, :integer
      t.column :ch_r1, :integer
      t.column :ch_r2, :integer
      t.column :ch_r3, :integer
    end
  end

  def self.down
    drop_table :charts
  end
end
