class CreateReports < ActiveRecord::Migration
  def self.up
    create_table :reports do |t|
      t.column :rep_lacode, :string
      t.column :rep_problemcode, :integer
      t.column :rep_icontype, :integer
      t.column :rep_population, :integer
      t.column :rep_resourcecode, :integer
      t.column :rep_loc_id, :integer
    end
  end

  def self.down
    drop_table :reports
  end
end

