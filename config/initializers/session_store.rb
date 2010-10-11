# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_gfund_session',
  :secret      => '3d50ad397e4554bfc0d2998e1567fceed630613ada8202d810b4f707cc396dc93051d3da2b5f31d3b690d9bfecd06a83d51f9697460e375c248e873eb8a6aee5'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
