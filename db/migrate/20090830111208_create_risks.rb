class CreateRisks < ActiveRecord::Migration
  def self.up
    create_table :risks do |t|
      t.column :risk_lacode, :string
      t.column :risk_code, :integer
      t.column :risk_hotid, :integer
      t.column :risk_hottype, :integer
      t.column :risk_population, :integer
      t.column :risk_rescode, :integer
    end
  end

  def self.down
    drop_table :risks
  end
end
