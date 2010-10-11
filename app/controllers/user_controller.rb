class UserController < ApplicationController

  protect_from_forgery :only => [:destroy]

  def index
    render :layout => 'ext'
  end

  def login
    @user = params[:user]
    @pass = params[:pass]
    if (@user =~ /\d{4}/ && @user == @pass)
      if (@user == '0000') # This is ADMIN  
        data = { :success => 'true', :user =>'admin' }
      else
        data = { :success => 'true', :user => @user }
      end
    else
      data = { :success => 'true', :msg => 'Invalid Username/Password' }
    end

    render :text => data.to_json, :layput => false
  end

  def profile
    render :layout => 'ext'
  end

  def update
    userid = params[:user]
    oldpass = params[:oldpass]
    newpass = params[:newpass]
    fname = params[:firstname]
    lname = params[:lastname]
    telno = params[:telno]

    u = User.find_by_user_id(userid)
    data = Hash.new
    if (u.nil?) # This is the first time update
      if (userid != oldpass) # 3303 VS 3303
        data[:success] = 'false'
        data[:msg] = 'Incorrect Username/Password'
      else #=> create a new user
        u = User.create(:user_id => userid,
                        :user_password => newpass,
                        :user_firstname => fname,
                        :user_lastname => lname, 
                        :user_telno => telno)
        data[:success] = 'true'
        data[:msg] = "User Profile ID:#{userid} updated"
      end
    elsif (u.user_password != oldpass) # incorrect password
      data[:success] = 'false'
      data[:msg] = 'Incorrect Username/Password'
    else
      u.user_password = newpass
      u.user_firstname = fname
      u.user_lastname = lname
      u.user_telno = telno
      if (u.save)
        data[:success] = 'true'
        data[:msg] = "User Profile ID:#{userid} updated!"
      else
        data[:success] = 'false'
        data[:msg] = "Fail update profile ID:#{userid}"
      end
    end
    render :text => data.to_json, :layout => false
  end

end
