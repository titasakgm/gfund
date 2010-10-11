class CreateResprogs < ActiveRecord::Migration
  def self.up
    create_table :resprogs do |t|
      t.column :prog_lacode, :string
      t.column :prog_probcode, :integer
      t.column :prog_progress, :integer
      t.column :prog_resource, :integer
    end
  end

  def self.down
    drop_table :resprogs
  end
end
