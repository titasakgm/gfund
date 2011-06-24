require 'postgres'

class MapController < ApplicationController

  protect_from_forgery :only => [:create, :update, :destroy] 

  def index
    render :layout => 'ext'
  end

  def log(msg)
    log = open("/tmp/map","a")
    log.write(msg)
    log.write("\n")
    log.close
  end

  def logx(msg)
    log = open("/tmp/showx","a")
    log.write(msg)
    log.write("\n")
    log.close
  end

  def login
    @user = params[:user]
    @pass = params[:pass]

    #logx("login: #{@use}|#{@pass}")    
    u = User.find_by_user_id(@user)
    
    if (u.nil?) # First time user not update profile
      if (@user == @pass) 
        data = { :success => 'true', :user => @user }
      else
        data = { :success => 'true', :user => 'Invalid', :msg => 'Sorry, Invalid Username/Password' }
      end
    else # This user updated his profile already
      if (u.user_password == @pass) # Correct password
        if (@user == '0000') # This is admin
          data = { :success => 'true', :user => 'admin' }
        else
          data = { :success => 'true', :user => @user }
        end
      else
        data = { :success => 'true', :user => 'Invalid', :msg => 'Sorry, Invalid Username/Password' }
      end
    end    

    if (@user =~ /^10/) # Bangkok
      @acc_2_title = 'รหัสแขวง'
    else
      @acc_2_title = 'รหัสตำบล'
    end

    session[:user] = @user
    session[:user] = 'admin0000' if (@user == '0000')

    render :text => data.to_json, :layout => false
  end

  def logout
    session[:user] = nil
    data = { :success => 'true' }
    render :text => data.to_json, :layout => false
  end

  def show
    id = params[:id]
    pcode = id[0..1]
    acode = id[2..3]
    @ampcode = ''
    @ampname = ''
    @ampbound = ''
    if (id != 'Invalid')
      a = Amphoe.find(:first,:select=>'amp_name',
        :conditions => "amp_pcode = '#{pcode}' AND amp_code = '#{acode}' ")
      @ampname = a.amp_name
      @ampcode = pcode << acode
      b = Extent.find(:first, :conditions=> "code = '#{@ampcode}'")
      ext = b.bound.split(',')
      ext[0] = sprintf("%.3f",ext[0].to_f - 0.005)
      ext[1] = sprintf("%.3f",ext[1].to_f - 0.005)
      ext[2] = sprintf("%.3f",ext[2].to_f + 0.005)
      ext[3] = sprintf("%.3f",ext[3].to_f + 0.005)
      @ampbound = ext.join(',')
    end

    if (session[:user] == nil)
      redirect_to :controller => 'user', :action => 'index'
    elsif (id != session[:user])
      redirect_to :controller => 'map', :action => 'show', :id => session[:user]
    else
      render :layout => 'ext'
    end
  end
   
  def showx
    lacode = params[:id]
    ampcode = Ladmin.find_by_sql(["SELECT la_pcode || la_acode as acode FROM ladmins WHERE la_code = ?", lacode])
    id = ampcode[0].acode
    pcode = id[0..1]
    acode = id[2..3]

    @ampcode = ''
    @ampname = ''
    @ampbound = ''
    if (id != 'Invalid')
      a = Amphoe.find(:first,:select=>'amp_name',
        :conditions => "amp_pcode = '#{pcode}' AND amp_code = '#{acode}' ")
      @ampname = a.amp_name
      @ampcode = pcode << acode
      b = Extent.find(:first, :conditions=> "code = '#{@ampcode}'")
      ext = b.bound.split(',')
      ext[0] = sprintf("%.3f",ext[0].to_f - 0.005)
      ext[1] = sprintf("%.3f",ext[1].to_f - 0.005)
      ext[2] = sprintf("%.3f",ext[2].to_f + 0.005)
      ext[3] = sprintf("%.3f",ext[3].to_f + 0.005)
      @ampbound = ext.join(',')
    end

    session[:user] = id
    redirect_to :controller => 'map', :action => 'show', :id => session[:user]
  end
   
  def get_problem
    start = params[:start]
    limit = params[:limit]

    sql = "SELECT * FROM problems "
    sql += "ORDER BY id "
    totalCount = Problem.find_by_sql(sql).size
    if (limit.to_i > 0 && start.to_i >= 0)
      sql += "LIMIT #{limit} OFFSET #{start}"
    end
    @problem = Problem.find_by_sql(sql)
    data = Hash.new
    data[:success] = 'true'
    data[:totalCount] = totalCount
    data[:rows] = @problem.collect{|u| {:id=>u.id,:probcode=>u.prob_code,:probdesc=>u.prob_desc} }
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def get_progress
    lacode = params[:lacode]
    probcode = params[:probcode]

    rp = Resprog.find(:first, 
                        :conditions => "prog_lacode='#{lacode}' AND prog_probcode='#{probcode}'")
    if (rp.nil?)
      plevel = 0
      rlevel = 0
    else
      plevel = rp.prog_progress
      rlevel = rp.prog_resource
    end

    data = Hash.new
    data[:success] = 'true'
    data[:plevel] = plevel
    data[:rlevel] = rlevel
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def get_hotspot
    start = params[:start]
    limit = params[:limit]

    sql = "SELECT * FROM hotspots "
    sql += "WHERE hot_code > 0 "
    sql += "ORDER BY hot_code "
    totalCount = Ladmin.find_by_sql(sql).size
    if (limit.to_i > 0 && start.to_i >= 0)
      sql += "LIMIT #{limit} OFFSET #{start}"
    end
    @hotspot = Hotspot.find_by_sql(sql)
    data = Hash.new
    data[:success] = 'true'
    data[:totalCount] = totalCount
    data[:rows] = @hotspot.collect{|u| {:id=>u.id,:hotcode=>u.hot_code,:hotdesc=>u.hot_desc} }
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def get_cbhotspot
    @hotspot = Hotspot.find(:all, :order => :id)
    totalCount = @hotspot.size
    data = Hash.new
    data[:success] = 'true'
    data[:totalCount] = totalCount
    data[:rows] = @hotspot.collect{|u| {:id=>u.id,:hotcode=>u.hot_code,:hotdesc=>u.hot_desc} }
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def get_ladmin
    start = params[:start]
    limit = params[:limit]
    filter = params[:filter]

    sql = "SELECT * FROM ladmins "
    if !(filter.nil?)
      sql += "WHERE la_code||la_name LIKE '%#{filter}%' "
    end
    totalCount = Ladmin.find_by_sql(sql).size
    sql += "ORDER BY id "
    if (limit.to_i > 0 && start.to_i >= 0)
      sql += "LIMIT #{limit} OFFSET #{start}"
    end
    @ladmin = Ladmin.find_by_sql(sql)
    data = Hash.new
    data[:success] = 'true'
    data[:totalCount] = totalCount
    data[:rows] = @ladmin.collect{|u| {:id=>u.id,:lacode=>u.la_code,:laname=>u.la_name} }
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def get_location
    ampcode = params[:ampcode]
    hotcode = params[:hotcode]
    box = params[:extent]
    if (box.nil?)
      b = Extent.find(:first, :conditions=> "code = '#{ampcode}'")
      ext = b.bound.split(',')
      ext[0] = sprintf("%.3f",ext[0].to_f - 0.005)
      ext[1] = sprintf("%.3f",ext[1].to_f - 0.005)
      ext[2] = sprintf("%.3f",ext[2].to_f + 0.005)
      ext[3] = sprintf("%.3f",ext[3].to_f + 0.005)
      box = ext.join(',')
    end
   
    e = box.to_s.split(',')
    extent = "#{e[0]} #{e[1]},#{e[2]} #{e[3]}"
    sql = "SELECT * FROM locations "
    sql += "WHERE contains(setSRID('BOX3D(#{extent})'::box3d, 4326), the_geom) "
    if (hotcode > '0')
      sql += "AND loc_code=#{hotcode} "
    end

    log("get_location:sql=> #{sql}")

    @location = Location.find_by_sql(sql)
    totalCount = @location.size
    data = Hash.new
    data[:success] = 'true'
    data[:totalCount] = totalCount
    data[:rows] = @location.collect{|u| {:id=>u.id,
                                         :loc_code=>u.loc_code,
                                         :loc_desc=>u.loc_desc,
                                         :lon=>u.the_geom.x,
                                         :lat=>u.the_geom.y} }

    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def get_locations
    ampcode = params[:ampcode]
    hotcodes = params[:hotcodes]
    hcs = hotcodes.split('|')
    if hcs.length == 1
      hotcodes = hcs[0]
    else
      hotcodes = "'" << hcs.join("','") << "'"
    end
    box = params[:extent]
    if (box.nil?)
      b = Extent.find(:first, :conditions=> "code = '#{ampcode}'")
      ext = b.bound.split(',')
      ext[0] = sprintf("%.3f",ext[0].to_f - 0.005)
      ext[1] = sprintf("%.3f",ext[1].to_f - 0.005)
      ext[2] = sprintf("%.3f",ext[2].to_f + 0.005)
      ext[3] = sprintf("%.3f",ext[3].to_f + 0.005)
      box = ext.join(',')
    end
   
    e = box.to_s.split(',')
    extent = "#{e[0]} #{e[1]},#{e[2]} #{e[3]}"
    sql = "SELECT * FROM locations "
    sql += "WHERE contains(setSRID('BOX3D(#{extent})'::box3d, 4326), the_geom) "
    if (hcs.length == 1)
      sql += "AND loc_code='#{hotcodes}' "
    else
        sql += "AND loc_code IN (#{hotcodes}) "
    end

    log("get_locations:sql=> #{sql}")

    @location = Location.find_by_sql(sql)
    totalCount = @location.size
    data = Hash.new
    data[:success] = 'true'
    data[:totalCount] = totalCount
    data[:rows] = @location.collect{|u| {:id=>u.id,
                                         :loc_code=>u.loc_code,
                                         :loc_desc=>u.loc_desc,
                                         :loc_date=>u.loc_date,
                                         :lon=>u.the_geom.x,
                                         :lat=>u.the_geom.y} }

    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def get_riskmap
    ampcode = params[:ampcode]
    riskcode = params[:riskcode]
    box = params[:extent]
    if (box.nil?)
      b = Extent.find(:first, :conditions=> "code='#{ampcode}'")
      ext = b.bound.split(',')
      ext[0] = sprintf("%.3f",ext[0].to_f - 0.005)
      ext[1] = sprintf("%.3f",ext[1].to_f - 0.005)
      ext[2] = sprintf("%.3f",ext[2].to_f + 0.005)
      ext[3] = sprintf("%.3f",ext[3].to_f + 0.005)
      box = ext.join(',')
    end
    e = box.to_s.split(',')
    extent = "#{e[0]} #{e[1]},#{e[2]} #{e[3]}"
    sql = "SELECT * FROM riskmaps "
    sql += "WHERE contains(setSRID('BOX3D(#{extent})'::box3d, 4326), the_geom) "
    sql += "AND rm_riskcode='#{riskcode}' "
    log("get_riskmap:sql=> #{sql}")
    @riskmap = Riskmap.find_by_sql(sql)

    totalCount = @riskmap.size
    data = Hash.new
    data[:success] = 'true'
    data[:totalCount] = totalCount
    data[:rows] = @riskmap.collect{|u| {:id=>u.id,
                                        :riskcode=>u.rm_riskcode,
                                        :hotdesc=>u.rm_hotdesc,
                                        :icon=>u.rm_hottype,
                                        :radius=>u.rm_population,
                                        :color=>u.rm_rescode,
                                        :lon=>u.the_geom.x,
                                        :lat=>u.the_geom.y} }

    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def get_tamcode
    ampcode = params[:ampcode]
    pcode = ampcode[0..1]
    acode = ampcode[2..3]
    @tam = Tambon.find(:all,:select=>'id,tam_code,tam_name',
      :conditions=>"tam_pcode='#{pcode}' AND tam_acode='#{acode}'")
    totalCount = @tam.size
    data = Hash.new
    data[:success] = 'true'
    data[:totalCount] = totalCount
    data[:rows] = @tam.collect{|u| {:id=>u.id,
                               :tamcode=>u.tam_code,
                               :tamname=>u.tam_name} }

    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def get_lacode
    ampcode = params[:ampcode]
    pcode = ampcode[0..1]
    acode = ampcode[2..3]
    @la = Ladmin.find(:all,:select=>'id,la_code,la_name',
      :conditions=>"la_pcode='#{pcode}' AND la_acode='#{acode}'" )
    totalCount = @la.size
    data = Hash.new
    data[:success] = 'true'
    data[:totalCount] = totalCount
    data[:rows] = @la.collect{|u| {:id=>u.id,
                               :lacode=>u.la_code,
                               :laname=>u.la_name} }
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def get_lacodemon
    ampcode = params[:ampcode]
    pcode = ampcode[0..1]
    acode = ampcode[2..3]
    @la = Ladmin.find(:all,:select=>'id,la_code,la_name',
      :conditions=>"la_pcode='#{pcode}' AND la_acode='#{acode}' AND the_geom IS NOT NULL" )
    totalCount = @la.size
    data = Hash.new
    data[:success] = 'true'
    data[:totalCount] = totalCount
    data[:rows] = @la.collect{|u| {:id=>u.id,
                               :lacode=>u.la_code,
                               :laname=>u.la_name} }
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def tamRowSelect
    id = params[:id]
    t = Tambon.find(id)
    geom = t.the_geom.as_wkt

    data = Hash.new
    data[:success] = 'true'
    data[:id] = id
    data[:geom] = geom
    render :text => data.to_json, :layout => false
  end

  def ladminRowSelect
    lacode = params[:lacode]
    sql = "SELECT astext(the_geom) AS geom, extent(the_geom) AS extent, center(the_geom) AS center "
    sql += "FROM ladmins "
    sql += "WHERE la_code='#{lacode}'"
    sql += "GROUP BY the_geom "
    e = Ladmin.find_by_sql(sql)
    geom = 'NA'
    extent = 'NA'
		center = 'NA'
    if (e.nil?)
      id = -1
    else
      if (e[0].geom)
        geom = e[0].geom
      end
      if (e[0].extent)
        extent = e[0].extent.to_s.split('(').last.split(')').first.tr(' ',',')
      end
      if (e[0].center)
        center = e[0].center.to_s.split('(').last.split(')').first.tr(' ',',')
      end
      id = lacode
    end

    data = Hash.new
    data[:success] = 'true'
    data[:id] = id
    data[:geom] = geom
    data[:extent] = extent
    data[:center] = center
		headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def save_geom
    lacode = params[:sgf_lacode]
    geometry = GeoRuby::SimpleFeatures::Geometry.from_ewkt(params[:sgf_geometry])
    geometry.srid = 4326
    description = params[:sgf_description]

    msg = nil
    
    la = Ladmin.find_by_la_code(lacode)
    la.the_geom = geometry
    if (la.save)
      msg = "LA Code: #{id} was updated!"
    else
      msg = "Cannot update geometry for LA Code: #{lacode}"
    end

    #Get extent and save in table extents
    e = Ladmin.find_by_sql("SELECT extent(the_geom) as extent FROM ladmins WHERE la_code='#{lacode}'")
    e = e[0].extent
    bound = e.slice(4,e.length-5).tr(' ',',') 
    ext = Extent.create(:code => lacode, :bound => bound) 

    if (msg =~ /Cannot/)
      data = { :success => false, :msg => msg }
    else
      data = { :success => true, :msg => msg }
    end
    
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def save_line
    lroad_id = params[:slf_roadid]
    lroad_name = params[:slf_roadname]
    geometry = GeoRuby::SimpleFeatures::Geometry.from_ewkt(params[:slf_geometry])
    geometry.srid = 4326

    lroad = Localroad.create(:lroad_name => lroad_name, :the_geom => geometry)
    lroad_id = lroad.id		  
    data = { :success => true, :lroad_id => lroad_id, :msg => "1 record added" }
    
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def delete_location
    id = params[:loc_id]
    loc = Location.find(id)
    loc.destroy
    data = { :success => true, :msg => "1 record deleted!" }
    render :text => data.to_json, :layout => false
  end

  def edit_location
    id = params[:loc_id]
    code = params[:loc_code]
    desc = params[:loc_desc]
    date = params[:loc_date]

    loc = Location.find(id)
    loc.update_attributes(:loc_code => code, :loc_desc => desc, :loc_date => date)

    data = Hash.new
    data[:success] = 'true'
    data[:msg] = '1 Record updated'
    data[:id] = id

    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def add_hotspot
    id = params[:hot_loc_id]
    code = params[:hotcode]
    desc = params[:hot_description]
    geometry = GeoRuby::SimpleFeatures::Geometry.from_ewkt(params[:hot_geometry])
    geometry.srid = 4326

    # Insert this new hotspot to table locations
    loc = Location.create(:loc_code => code, :loc_desc => desc, :the_geom => geometry)
    locid = loc.id
    
    data = Hash.new
    data[:success] = 'true'
    data[:msg] = '1 Record inserted'    
    data[:id] = id
    
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def add_risk
    lacode = params[:lacode]
    code = params[:risk_code]
    hotid = params[:risk_hot_id]
    hottype = params[:loc_code]
    population = params[:risk_population]
    rescode = params[:risk_rescode]

    # Insert this new risk to table risks
    risk = Risk.create(:risk_lacode => lacode,
                       :risk_code => code, 
                       :risk_hotid => hotid, 
                       :risk_hottype => hottype, 
                       :risk_population => population, 
                       :risk_rescode => rescode)
    riskid = risk.id
    
    data = Hash.new
    data[:success] = 'true'
    data[:msg] = '1 Record inserted'    
    data[:id] = riskid
    
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def add_progress
    lacode = params[:prog_lacode]
    probcode = params[:probcode]
    plevel = params[:p_level]
    rlevel = params[:r_level]
    msg = nil
    plevel = 0 if (plevel.nil?)
    rlevel = 0 if (rlevel.nil?)

    sql = "SELECT id FROM resprogs WHERE prog_lacode='#{lacode}' AND prog_probcode=#{probcode}"
    rp = Resprog.find_by_sql(sql)

    if (rp.size == 0) # This is a new resource/progress for this lacode
      # Insert this new progress/resource to table resprogs 
      rp = Resprog.create(:prog_lacode => lacode,
                          :prog_probcode => probcode, 
                          :prog_progress => plevel, 
                          :prog_resource => rlevel)
      msg = '1 record inserted!'
    else # Already in resprogs table
      rp = Resprog.find(rp[0].id)
      # Update progress / resource
      rp.update_attribute(:prog_progress,plevel)
      rp.update_attribute(:prog_resource,rlevel)
      msg = '1 record updated!'
    end
    data = Hash.new
    data[:success] = 'true'
    data[:msg] = msg
    data[:id] = rp.id
    
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def save
    id = params[:inp_id]
    geometry = GeoRuby::SimpleFeatures::Geometry.from_ewkt(params[:inp_geometry])
    geometry.srid = 4326
    locid = params[:inp_loc_id]
    description = params[:inp_description]
    date = params[:inp_date]
    problem = params[:probcode]
    icontype = params[:hotcode]
    population = params[:inp_population]
    lacode = params[:lacode]
    rescode = params[:rescode]

    msg = nil
    
    if (geometry.text_geometry_type == 'POINT') # This is a report data NOT ladmin geom
      if (locid == '0') # new POINT
        #Insert into locations and get ID
        loc = Location.create(:loc_desc => description, :the_geom => geometry)
        locid = loc.id
        #Insert into reports
        rep = Report.create(:rep_lacode => lacode,
                            :rep_problemcode => problem,
                            :rep_icontype => icontype,
                            :rep_population => population,
                            :rep_resourcecode => rescode,
                            :rep_loc_id => locid)
        msg = '1 report created'
      else # This is an UPDATE POINT
        #
      end
    else # POLYGON
      la = Ladmin.find(id)
      la.the_geom = geometry
      if (la.save)
        msg = "ID: #{id} was updated!"
      else
        msg = "Cannot update the_geom ID: #{id}"
      end
      #Get extent and save in table extents
      e = Ladmin.find_by_sql("SELECT extent(the_geom) as extent FROM ladmins WHERE la_code='#{lacode}'")
      e = e[0].extent
      bound = e.slice(4,e.length-5).tr(' ',',') 
      ext = Extent.create(:code => lacode, :bound => bound) 
    end

    if (msg =~ /Cannot/)
      data = { :success => false, :msg => msg }
    else
      data = { :success => true, :msg => msg }
    end
    
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def insert_problem
    p = Problem.create(:prob_code => 'New',:prob_desc => 'New Name')
    data = Hash.new
    data[:success] = 'true'
    data[:insert_id] = p.id
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def update_problem
    id = params[:id]
    field = params[:field]
    value = params[:value]

    data = Hash.new
    p = Problem.find(id)
    if (p.nil?)
      data[:success] = 'false'
      data[:msg] = "ID: #{id} not found"
    else
      p.update_attribute(field,value)
      data[:success] = 'true'
      data[:msg] = "ID: #{id} updated!"
    end

    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def update_ladmin
    id = params[:id]
    field = params[:field]
    value = params[:value]

    if (field == 'la_code')
      pcode = value.to_s[1..2]
      acode = value.to_s[3..4]
    end
    data = Hash.new
    la = Ladmin.find(id)
    if(la.nil?)
      data[:success] = 'false'
      data[:msg] = "ID: #{id} not found"
    else
      la.update_attribute(field,value)
      if (field == 'la_code')
        la.update_attribute('la_pcode',pcode)
        la.update_attribute('la_acode',acode)
      end
      data[:success] = 'true'
      data[:msg] = "ID: #{id} updated!"
    end

    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def insert_ladmin
    la = Ladmin.create(:la_code => 'New',:la_name => 'New Name')
    data = Hash.new
    data[:success] = 'true'
    data[:insert_id] = la.id
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def insert_hotspot
    p = Hotspot.create(:hot_code => 'New',:hot_desc => 'New Name')
    data = Hash.new
    data[:success] = 'true'
    data[:insert_id] = p.id
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def update_hotspot
    id = params[:id]
    field = params[:field]
    value = params[:value]

    data = Hash.new
    p = Hotspot.find(id)
    if (p.nil?)
      data[:success] = 'false'
      data[:msg] = "ID: #{id} not found"
    else
      p.update_attribute(field,value)
      data[:success] = 'true'
      data[:msg] = "ID: #{id} updated!"
    end

    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def search
    keyword = params[:keyword]
    item = params[:item]
    ampcode = params[:ampcode]

    if (item == 'ladmin')
      con = PGconn.connect("localhost",5432,nil,nil,"gfund","postgres","1234")
      sql = "SELECT id,la_code,la_name,astext(the_geom) "
      sql += "FROM ladmins "

      if (keyword =~ /POLYGON/)
        sql += "WHERE intersects(the_geom, GeometryFromText('#{keyword}',4326)) "
      else
        sql += "WHERE upper(id||la_code||la_name) LIKE '%#{keyword.upcase}%' "
      end
      sql += "AND the_geom IS NOT NULL "

      res = con.exec(sql)
      con.close

      a1 = Array.new
      a2 = Array.new
      a3 = Array.new
      a4 = Array.new

      msg = "Sorry, no record found"

      found = res.num_tuples
      if (found == 1)
        msg = "#{found} record found"
      elsif (found > 1)
        msg = "#{found} records found"
      end

      if (found > 0)
        res.each do |rec|
          id = rec[0]
          lacode = rec[1]
          laname = rec[2]
          geom = rec[3]
          a1.push(id)
          a2.push(lacode)
          a3.push(laname)
          a4.push(geom)
        end
      end

      data = Hash.new
      data[:success] = 'true'
      data[:totalCount] = found

      data[:id] = a1.join('|')
      data[:lacode] = a2.join('|')
      data[:laname] = a3.join('|')
      data[:geom] = a4.join('|')
      data[:msg] = msg
    elsif (item == 'location')
      con = PGconn.connect("localhost",5432,nil,nil,"gfund","postgres","1234")
      sql = "SELECT the_geom FROM amphoes "
      sql += "WHERE amp_pcode || amp_code = '#{ampcode}' "
      res = con.exec(sql)
      ampgeom = res[0][0]

      sql = "SELECT id,loc_code,loc_desc,astext(the_geom),loc_date "
      sql += "FROM locations "

      if (keyword =~ /POLYGON/)
        sql += "WHERE intersects(the_geom, GeometryFromText('#{keyword}',4326)) "
      else
        sql += "WHERE upper(to_char(id,'9999')||to_char(loc_code,'9999')||loc_desc) LIKE '%#{keyword.upcase}%' "
      end
      sql += "AND the_geom IS NOT NULL "
      sql += "AND intersects(the_geom, '#{ampgeom}') "

      res = con.exec(sql)
      con.close

      a1 = Array.new
      a2 = Array.new
      a3 = Array.new
      a4 = Array.new
      a5 = Array.new

      msg = "Sorry, no record found"

      found = res.num_tuples
      if (found == 1)
        msg = "#{found} record found"
      elsif (found > 1)
        msg = "#{found} records found"
      end

      if (found > 0)
        res.each do |rec|
          id = rec[0]
          loccode = rec[1]
          locdesc = rec[2]
          geom = rec[3]
          locdate = rec[4]
          a1.push(id)
          a2.push(loccode)
          a3.push(locdesc)
          a4.push(geom)
          a5.push(locdate)
        end
      end

      data = Hash.new
      data[:success] = 'true'
      data[:totalCount] = found

      data[:id] = a1.join('|')
      data[:loccode] = a2.join('|')
      data[:locdesc] = a3.join('|')
      data[:geom] = a4.join('|')
      data[:locdate] = a5.join('|')
      data[:msg] = msg
    end

    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def hot_delete
    id = params[:id]
    loc = Location.find(id)
    if (loc.delete)
      data = { :success => 'true', :msg => 'Hotspot ID: #{id} was deleted!' }
    else
      data = { :success => 'false', :msg => 'Delete failed!' }
    end

    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def loc_info
    id = params[:id]
    con = PGconn.connect("localhost",5432,nil,nil,"gfund","postgres","1234")
    sql = "SELECT loc_code,loc_desc,astext(the_geom),loc_date "
    sql += "FROM locations "
    sql += "WHERE id=#{id} "
    res = con.exec(sql)
    con.close
    loccode = locdesc = geom = locdate = nil
    res.each do |rec|
      loccode = rec[0]
      locdesc = rec[1]
      geom = rec[2]
      locdate = rec[3]
    end

    data = Hash.new
    data[:success] = true
    data[:totalCount] = 1
    data[:rows] = {:id=>id,:loccode=>loccode,:locdesc=>locdesc,:geom=>geom,:locdate=>locdate}

    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def getResource
    ampcode = params[:ampcode]
    problemcode = params[:problemcode]
    res = Resource.find(:all, :conditions=>{:res_ampcode => ampcode, :res_problemcode => problemcode})
    totalCount = res.size
    headers["Content-Type"] = "text/plain; charset=utf-8"
    data = Hash.new
    data[:success] = 'true'
    data[:totalCount] = totalCount
    data[:rows] = res.collect{|u| {:id=>u.id,
                                   :lon=>u.the_geom.x,
                                   :lat=>u.the_geom.y,
                                   :radius=>u.res_population,
                                   :color=>u.res_code,
                                   :icon=>u.res_icontype} }
    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

  def delete_lageom
    data = Hash.new
    xlacode = params[:xlacode]
    la = Ladmin.find_by_la_code(xlacode)
    if !(la.nil?) # Find this la_code in table ladmins
      la.the_geom = '' # Remove POLYGON from this la_code
      la.save
      data[:success] = 'true'
      data[:msg] = '1 Polygon removed!'
    else
      data[:success] = 'false'
      data[:msg] = 'Remove Polygon failed!'
    end

    headers["Content-Type"] = "text/plain; charset=utf-8"
    render :text => data.to_json, :layout => false
  end

end
