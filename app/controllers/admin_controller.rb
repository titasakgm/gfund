class AdminController < ApplicationController

  protect_from_forgery :only => [:create, :update, :destroy]

  def index
    if (session[:user] != 'admin0000')
      redirect_to :controller => 'user', :action => 'index'
    end
    render :layout => 'ext'
  end

  def del_hotspot
    id = params[:id]
    h = Hotspot.find(id)
    h.destroy
    data = { :success => 'true', :msg => '1 record deleted!' }
    render :text => data.to_json, :layout => false
  end

  def del_problem
    id = params[:id]
    p = Problem.find(id)
    p.destroy
    data = { :success => 'true', :msg => '1 record deleted!' }
    render :text => data.to_json, :layout => false
  end

  def del_ladmin
    id = params[:id]
    la = Ladmin.find(id)
    la.destroy
    data = { :success => 'true', :msg => '1 record deleted!' }
    render :text => data.to_json, :layout => false
  end

end
