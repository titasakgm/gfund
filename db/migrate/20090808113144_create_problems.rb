class CreateProblems < ActiveRecord::Migration
  def self.up
    create_table :problems do |t|
      t.column :prob_code, :integer
      t.column :prob_desc, :string
    end
  end

  def self.down
    drop_table :problems
  end
end

