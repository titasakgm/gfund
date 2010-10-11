class User < ActiveRecord::Base
  self.establish_connection :gfund
end
