class Risk < ActiveRecord::Base
  self.establish_connection :gfund
end
