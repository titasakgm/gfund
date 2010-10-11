class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users do |t|
      t.column :user_id, :string
      t.column :user_firstname, :string
      t.column :user_lastname, :string
      t.column :user_telno, :string
    end
  end

  def self.down
    drop_table :users
  end
end
