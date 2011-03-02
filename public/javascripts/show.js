Ext.BLANK_IMAGE_URL = '/mfbase/ext/resources/images/default/s.gif';

Ext.override(Ext.Button, {
    setIcon: function(url){
      if (this.rendered){
        var btnEl = this.getEl().child(this.buttonSelector);
        btnEl.setStyle('background-image', 'url(' +url+')');
      }
    }
  });

  // create namespace
  Ext.namespace('toolbarExample');
     
  // create application
  toolbarExample.app = function() {
    // private vars:
    var map, toolbar, viewport;
    var vectorLayer, resourceLayer, hotspotLayer, hotspotShadow;
    var tree, selectControl, selectedFeature;
    var saveGeomControl, saveLineControl;
    var selectHotspotControl, selectedHotspot;
    var formPanel, doSearch, selectPopup, popup;
    var cur_id, cur_lacode, cur_laname, cur_report, cur_geometry, cur_loc_id, cur_geom_id;
    var cur_problemcode, cur_desc, cur_hotcode, cur_hotdesc;
    var cur_query, cur_icontype, cur_extent;
    var cur_hot_id, cur_risk_code, cur_risk_name, risk_hot_id, risk_hot_code, risk_hot_desc;
	var cur_roadid, cur_roadname;
    var style_hilite, hilite, style_point, style_resource;
    var myData, store, searchResultGrid;
    var amphoe;
    var contentForPopup = new Array();
    var pointFeature = new Array();
    var probFeature = new Array();
    var popup, cur_popup;

    cur_id = 0;
    cur_hot_id = 0;
    cur_risk_code = 0;
    cur_geom_id = '';
    cur_lacode = '';
    cur_laname = '';
    cur_report = '';
    cur_geometry = '';
    cur_loc_id = 0;
    cur_problemcode = 0;
    cur_hotcode = 0;
    var cur_desc = '';
    var cur_query = '';

    var ampcode = <%= @ampcode %>;

    // private functions
    /*
    * Layer style
    */
    // we want opaque external graphics and non-opaque internal graphics
    var layer_style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
    layer_style.fillOpacity = 0.2;
    layer_style.graphicOpacity = 1;

    /*
    * measure style
    */
    style_measure = OpenLayers.Util.extend({}, layer_style);
    style_measure.strokeColor = "red";
    style_measure.fillColor = "red";
    //strokeLinecap: [butt | round | square]
    //strokeDashstyle: [dot | dash | dashdot | longdash | longdashdot | solid]
    style_measure.strokeLinecap = "round";
    style_measure.strokeDashstyle = "dot";
    style_measure.pointRadius = 4;
    style_measure.strokeWidth = 3;

    /*
    * point style
    */
    style_point = OpenLayers.Util.extend({}, layer_style);
    style_point.strokeColor = "green";
    style_point.fillColor = "green";
    //strokeLinecap: [butt | round | square]
    //strokeDashstyle: [dot | dash | dashdot | longdash | longdashdot | solid]
    style_point.strokeLinecap = "round";
    style_point.strokeDashstyle = "solid";
    style_point.pointRadius = 8;
    style_point.strokeWidth = 3;

    /*
    * resource style
    */
    style_resource = OpenLayers.Util.extend({}, layer_style);
    style_resource.strokeColor = "white";
    style_resource.fillColor = "white";
    //strokeLinecap: [butt | round | square]
    //strokeDashstyle: [dot | dash | dashdot | longdash | longdashdot | solid]
    style_resource.strokeDashstyle = "dot";
    style_resource.strokeLinecap = "round";
    style_resource.pointRadius = 0;
    style_resource.strokeWidth = 1;

    /*
    * hotspot style
    */
    style_hotspot = OpenLayers.Util.extend({}, layer_style);
    style_hotspot.pointRadius = 15;
    style_hotspot.strokeWidth = 0;
    style_hotspot.fillOpacity = 0;

    /*
    * hilite style
    */
    style_hilite = OpenLayers.Util.extend({}, layer_style);
    style_hilite.strokeColor = "red";
    style_hilite.fillColor = "red";
    style_hilite.pointRadius = 16;
    style_hilite.strokeWidth = 4;

    var createMap = function() {
      map = new OpenLayers.Map('mymap', {
        projection: "EPSG:4326"
        ,controls: []
        ,maxExtent: new OpenLayers.Bounds(<%= @ampbound %>)
        ,resolutions: [1.406250, 0.703125, 0.3515625, 0.17578125,
          0.087890625, 0.0439453125, 0.02197265625, 0.010986328125,
          0.0054931640625, 0.00274658203125, 0.001373291015625,
          0.0006866455078125, 0.00034332275390625, 0.000171661376953125,
          8.58306884765625e-05, 4.291534423828125e-05, 2.1457672119140625e-05,
          1.0728836059570312e-05, 5.3644180297851562e-06, 2.6822090148925781e-06,
          1.3411045074462891e-06 ]
        //,maxResolution: 1.406250
      });

      map.events.register("mouseover", map, function(){
        this.div.style.cursor = "default";
      });

      map.events.register("moveend", map, function(){
        cur_extent = map.getExtent().toBBOX();
        toolbarExample.app.setStatus(cur_extent);
        //Clear old features in resourceLayer ::: unselect feature BEFORE remove features
        if (cur_risk_code > 0)
          showRiskMap();
      });
    };

    var createTileAmphoeLayer = function() {
      amphoe = new OpenLayers.Layer.MapServer("AMPHOE",
         "http://202.176.91.194/cgi-bin/mapserv",
         {
           map: '/ms520/map/wms-thai.map'
	       ,layers: 'amphoe'
	       ,style: ''
           ,format: 'image/png'
         },
         { isBaseLayer: true, buffer: 0, transparent: true  }
      );
      map.addLayer(amphoe);
    };

    var createTileTambonLayer = function() {
      tambon = new OpenLayers.Layer.MapServer("TAMBON",
         "http://202.176.91.194/cgi-bin/mapserv",
         {
           map: '/ms520/map/wms-thai.map'
	       ,layers: 'tambon'
	       ,style: ''
           ,format: 'image/png'
           ,transparent: true
         },
         { isBaseLayer: false, buffer: 0, transparent: true }
      );
      //tambon.setOpacity(.4);
      map.addLayer(tambon);
    };

    var createTileRoadLayer = function() {
      road = new OpenLayers.Layer.MapServer("ROAD",
         "http://202.176.91.194/cgi-bin/mapserv"
         ,{
           map: '/ms520/map/wms-thai.map'
	       ,layers: 'localroad'
	       ,style: ''
           ,format: 'image/png'
         }
         ,{ isBaseLayer: false, buffer: 0, transparent: true }
	  );
      //road.setOpacity(0.5);
      map.addLayer(road);
    };

    var createEducationLayer = function() {
      education = new OpenLayers.Layer.MapServer("EDUCATION",
         "http://202.176.91.194/cgi-bin/mapserv"
         ,{
           map: '/ms520/map/wms-thai.map'
	      ,layers: 'education'
	       ,style: ''
           ,format: 'image/png'
         }
         ,{ isBaseLayer: false, buffer: 0, transparent: true }
	  );
      //education.setOpacity(0.6);
      map.addLayer(education);
    };

    var createHealthLayer = function() {
      health = new OpenLayers.Layer.MapServer("HEALTH",
         "http://202.176.91.194/cgi-bin/mapserv"
         ,{
           map: '/ms520/map/wms-thai.map'
	       ,layers: 'health'
	       ,style: ''
           ,format: 'image/png'
         }
         ,{ isBaseLayer: false, buffer: 0, transparent: true }
      );
      //health.setOpacity(0.5);
      map.addLayer(health);
    };

    var createReligionLayer = function() {
      religion = new OpenLayers.Layer.MapServer("RELIGION",
         "http://202.176.91.194/cgi-bin/mapserv"
         ,{
           map: '/ms520/map/wms-thai.map'
	       ,layers: 'religion'
	       ,style: ''
           ,format: 'image/png'
         }
         ,{ isBaseLayer: false, buffer: 0, transparent: true }
      );
      //religion.setOpacity(0.6);
      map.addLayer(religion);
    };

    var createBankLayer = function() {
      bank = new OpenLayers.Layer.MapServer("BANK",
         "http://202.176.91.194/cgi-bin/mapserv"
         ,{
           map: '/ms520/map/wms-thai.map'
	       ,layers: 'bank'
	       ,style: ''
           ,format: 'image/png'
         }
         ,{ isBaseLayer: false, buffer: 0, transparent: true }
      );
      //bank.setOpacity(0.6);
      map.addLayer(bank);
    };

    var createWmsLayer = function(name, url, params, options) {
      map.addLayer(new OpenLayers.Layer.WMS(name, url, params, options));
    };

    var createResourceLayer = function() {
      resourceLayer = new OpenLayers.Layer.Vector("Resource");
      map.addLayer(resourceLayer);
    };

    var createVectorLayer = function() {
      vectorLayer = new OpenLayers.Layer.Vector("Vector");
      map.addLayer(vectorLayer);
            
      vectorLayer.events.register('featureadded', vectorLayer, function(){
        var l = this.features.length;
        var msg = (l==1) ? 'There is one feature on map' : 'There are now ' + l + ' features on map';
          toolbarExample.app.setStatus(msg);
      });

      vectorLayer.events.register('featuremodified', vectorLayer, function(){
        //this.setVisibility(false);
        //this.setVisibility(true);
      });

      vectorLayer.events.register("mouseover", vectorLayer, function(){
        this.div.style.cursor = "default";
      });

      return vectorLayer;
    };
        
    var createHiliteLayer = function() {
      hilite = new OpenLayers.Layer.Vector("Hilite", {
        displayInLayerSwitcher: false
      });
      map.addLayer(hilite);
    };

    var createHotspotShadow = function() {
      hotspotShadow = new OpenLayers.Layer.Vector("Shadow");
      map.addLayer(hotspotShadow);
    }

    var createHotspotLayer = function() {
      hotspotLayer = new OpenLayers.Layer.Markers("Hotspot");
      map.addLayer(hotspotLayer);
    }

    var addMapControls = function() {
      // navigation control
      var navControl = new OpenLayers.Control.Navigation({
        type: OpenLayers.Control.TYPE_TOGGLE
        ,zoomWheelEnabled: true
      });
      map.addControl(navControl);
      navControl.activate();

      map.addControl(new OpenLayers.Control.MousePosition());
      map.addControl(new OpenLayers.Control.LayerSwitcher());
    };
        
    var createToolbar = function() {
      toolbar = new mapfish.widgets.toolbar.Toolbar({
        map: map
        ,configurable: false
      });
                
      // this is a quick fix for http://trac.mapfish.org/trac/mapfish/ticket/126
      toolbar.autoHeight = false;
      toolbar.height = 25;
    };

    var addSeparator = function() {
      toolbar.add(new Ext.Toolbar.Spacer());
      toolbar.add(new Ext.Toolbar.Separator());
      toolbar.add(new Ext.Toolbar.Spacer());
    };

    var createTree = function() {
      var model = [{
        text: "Base Layers"
        ,leaf: false
        ,expanded: true
        ,children: [{
          text: "Amphoe"
          ,leaf: true
          ,layerName: "AMPHOE"
          ,checked: false
        }]
      },{
        text: "Overlay"
        ,leaf: false
        ,expanded: true
        ,children: [{
          text: "Tambon"
          ,leaf: true
          ,layerName: "TAMBON"
          ,checked: true
        },{
          text: "Roads"
          ,leaf: true
          ,layerName: "ROAD"
          ,checked: false
        },{
          text: "Educations"
          ,leaf: true
          ,layerName: "EDUCATION"
          ,checked: false
        },{
          text: "Health"
          ,leaf: true
          ,layerName: "HEALTH"
          ,checked: false
        },{
          text: "Religion"
          ,leaf: true
          ,layerName: "RELIGION"
          ,checked: false
        },{
          text: "Bank"
          ,leaf: true
          ,layerName: "BANK"
          ,checked: false
	}]
      }];
     
      //check space to here XXXXX

      tree = new mapfish.widgets.LayerTree({
        map: map
        ,model: model
        ,showWmsLegend: true
        ,height: 200
        ,plugins: [
          mapfish.widgets.LayerTree.createContextualMenuPlugin([
            'opacitySlide'
          ])
        ]
      });
    };

    var createSaveGeomControl = function() {
      saveGeomControl = new OpenLayers.Control.SelectFeature(vectorLayer, {
        title: 'บันทึก Polygon อปท.'
        ,onSelect: saveGeomSelect
      });

      function saveGeomSelect(feature) {
        // to be added in GEOMETRY textbox
        cur_geometry = feature.geometry;

        if (cur_geometry.toString().search(/POINT/) == 0)
        {
          Ext.Msg.alert('Warning','ปุ่มนี้ใช้สำหรับบันทึกขอบเขตเท่านั้น หากต้องการบันทึก Hotspot ให้ใช้ปุ่มด้านขวามือ');
          return false;
        }

        var cbLacodeStore = new Ext.data.Store({
          url: '/map/get_lacode'
          ,baseParams: { ampcode: ampcode }
          ,reader: new Ext.data.JsonReader({
            root: 'rows'
            ,totalProperty: 'totalCount'
            ,id: 'id'
          },[
            'id'
            ,'lacode'
            ,'laname'
          ])
        }); //eo cbLacodeStore

        cbLacodeStore.load();

        var saveGeomForm = new Ext.form.FormPanel({
          width: 400
          ,id: 'saveGeomForm'
          ,buttonAlign: 'center'
          ,autoHeight: true
          ,labelWidth: 75
          ,url: '/map/save_geom'
          ,frame: false
          ,border: false
          ,bodyStyle: 'padding: 5px 5px 0 5px;'
	  ,title: 'Geometry Description'
          ,defaults: {
            anchor: '90%'
            ,msgTarget: 'side'
          }
          ,defaultType: 'textfield'
          ,items: [{
            id: 'sgf_lacode'
            ,name: 'sgf_lacode'
            ,fieldLabel: 'LA Code'
            ,disabled: false
            ,value: cur_lacode
          },{
            xtype: 'combo'
            ,id: 'sgf_laname'
            ,name: 'sgf_laname'
            ,hiddenName: 'lacode'
            ,store: cbLacodeStore
            ,fieldLabel: 'LA Name'
            ,valueField: 'lacode'
            ,displayField: 'laname'
            ,typeAhead: true
            ,mode: 'local'
            ,triggerAction: 'all'
            ,emptyText: 'Select...'
            ,selectOnFocus: true
            ,listeners: {
              select: function(f,r,i){
                Ext.getCmp('sgf_lacode').setValue(r.data.lacode);
              }
            } // eo listeners
          },{
            xtype: 'textarea'
            ,id: 'sgf_geometry'
            ,fieldLabel: 'Geometry'
            ,name: 'sgf_geometry'
            ,value: cur_geometry
          },{
            xtype: 'textarea'
            ,id: 'sgf_description'
            ,fieldLabel: 'Description'
            ,name: 'sgf_description'
          }] // eof items
          ,buttons: [{
            text:'Save'
            ,handler: function() {
              saveGeomForm.getForm().submit({
                success: function(f, a) {
                  Ext.Msg.show({
                    title: 'Success'
                    ,width: 250
                    ,msg: '1 record added to Database'
                    ,icon: Ext.MessageBox.INFO
                    ,buttons: Ext.MessageBox.OK
                  });
                  win.close();
                } // eo success
                ,failure: function(f, a) {
                  Ext.Msg.show({
                    title: 'Warning'
                    ,width: 250
                    ,msg: 'Fail to add to Database'
                    ,icon: Ext.MessageBox.WARNING
                    ,buttons: Ext.MessageBox.OK
                  })
                } // eo failure
              }) // eo save Geom Form
            } // eo handler
          },{
            text: 'Reset'
            ,handler: function(){
              saveGeomForm.getForm().reset();
            } // eo handler
          },{
            text: 'DELETE'
            ,handler: function(){
              var xlacode = Ext.get('sgf_lacode').dom.value;
              if (xlacode == '')
              {
                Ext.Msg.alert('Warning', 'กรุณาเลือก อปท.ที่ท่านต้องการจะลบ Polygon');
                return false;
              }
              Ext.Msg.show({
                title: 'Warning'
                ,msg: 'ท่านแน่ใจว่าต้องการจะลบ Polygon ของรหัสอปท.' + xlacode + '?'
                ,buttons: Ext.Msg.YESNOCANCEL
                ,fn: function(btn){
                  if (btn == 'yes')
                  {
                    var con = new Ext.data.Connection();
                    con.request({
                      url: '/map/delete_lageom'
                      ,params: {
                        xlacode: xlacode
                      }
                      ,method: 'POST'
                      ,success: function(resp,opt) {
                        var info = Ext.util.JSON.decode(resp.responseText);
                        Ext.Msg.alert('Server Response', info.msg);
                      }
                      ,failure: function(resp,opt) {
                        Ext.Msg.alert('Server Response', 'Fail to delete Polygon!');
                      }
                    }); //eo con.request
                  } //eo if
                } //eo fn
              });
            } // eo handler
          }] // eo buttons
        }); // eo saveGeomForm

        var win = new Ext.Window({
          title: 'Save/Delete Geometry Form'
          ,id: 'sgf-win'
          ,width: 400
          ,autoHeight: true
          ,items: [ saveGeomForm ]
        });
        if (cur_lacode && cur_lacode.length > 0)
          Ext.getCmp('sgf_lacode').setValue(cur_lacode);
        win.show();
      }
    };

    var createSaveLineControl = function() {
      saveLineControl = new OpenLayers.Control.SelectFeature(vectorLayer, {
        title: 'บันทึกถนน'
        ,onSelect: saveLineSelect
      });

      function saveLineSelect(feature) {
        // to be added in GEOMETRY textbox
        cur_geometry = feature.geometry;

        if (cur_geometry.toString().search(/LINE/) == 0)
        {
          Ext.Msg.alert('Warning','ปุ่มนี้ใช้สำหรับบันทึกถนนเท่านั้น');
          return false;
        }

        var saveLineForm = new Ext.form.FormPanel({
          width: 400
          ,id: 'saveLineForm'
          ,buttonAlign: 'center'
          ,autoHeight: true
          ,labelWidth: 75
          ,url: '/map/save_line'
          ,frame: false
          ,border: false
          ,bodyStyle: 'padding: 5px 5px 0 5px;'
	        ,title: 'ชื่อถนน'
          ,defaults: {
            anchor: '90%'
            ,msgTarget: 'side'
          }
          ,defaultType: 'textfield'
          ,items: [{
            id: 'slf_roadid'
            ,name: 'slf_roadid'
            ,fieldLabel: 'Road ID'
            ,readOnly: true
            ,value: cur_roadid
          },{
            id: 'slf_roadname'
            ,name: 'slf_roadname'
            ,fieldLabel: 'Road Name'
            ,disabled: false
            ,value: cur_roadname
          },{
            xtype: 'textarea'
            ,id: 'slf_geometry'
            ,fieldLabel: 'Geometry'
            ,name: 'slf_geometry'
            ,value: cur_geometry
          }] // eof items
          ,buttons: [{
            text:'Save'
            ,handler: function() {
              saveLineForm.getForm().submit({
                success: function(f, a) {
                  Ext.Msg.show({
                    title: 'Success'
                    ,width: 250
                    ,msg: '1 record added to Database'
                    ,icon: Ext.MessageBox.INFO
                    ,buttons: Ext.MessageBox.OK
                  });
                  win.close();
                } // eo success
                ,failure: function(f, a) {
                  Ext.Msg.show({
                    title: 'Warning'
                    ,width: 250
                    ,msg: 'Fail to add to Database'
                    ,icon: Ext.MessageBox.WARNING
                    ,buttons: Ext.MessageBox.OK
                  })
                } // eo failure
              }) // eo save Line Form
            } // eo handler
          },{
            text: 'Reset'
            ,handler: function(){
              saveLineForm.getForm().reset();
            } // eo handler
          },{
            text: 'DELETE'
            ,handler: function(){
              var xroadid = Ext.get('slf_roadid').dom.value;
              if (xroadid == '')
              {
                Ext.Msg.alert('Warning', 'กรุณาเลือก ถนน ที่ท่านต้องการลบ');
                return false;
              }
              Ext.Msg.show({
                title: 'Warning'
                ,msg: 'ท่านแน่ใจว่าต้องการจะลบ ถนน นี้หรือไม่ ?'
                ,buttons: Ext.Msg.YESNOCANCEL
                ,fn: function(btn){
                  if (btn == 'yes')
                  {
                    var con = new Ext.data.Connection();
                    con.request({
                      url: '/map/delete_road'
                      ,params: {
                        xroadid: xroadid
                      }
                      ,method: 'POST'
                      ,success: function(resp,opt) {
                        var info = Ext.util.JSON.decode(resp.responseText);
                        Ext.Msg.alert('Server Response', info.msg);
                      }
                      ,failure: function(resp,opt) {
                        Ext.Msg.alert('Server Response', 'Fail to delete Polygon!');
                      }
                    }); //eo con.request
                  } //eo if
                } //eo fn
              });
            } // eo handler
          }] // eo buttons
        }); // eo saveLineForm

        var win = new Ext.Window({
          title: 'Save/Delete Geometry Form'
          ,id: 'slf-win'
          ,width: 400
          ,autoHeight: true
          ,items: [ saveLineForm ]
        });
        if (cur_roadid && cur_roadid.length > 0)
          Ext.getCmp('slf_roadid').setValue(cur_roadid);
        win.show();
      }
    };

    var createSelectControl = function() {
      selectControl = new OpenLayers.Control.SelectFeature(vectorLayer, {
        title: 'บันทึกตำแหน่ง Hotspot'
        ,onSelect: hotspotSelect
      });

      function hotspotSelect(feature) {
        cur_geometry = feature.geometry;
        cur_id = feature.id;
        cur_lacode = feature.lacode;
        cur_laname = feature.laname;

        if (cur_geometry.toString().search(/POLYGON/) == 0)
        {
          Ext.Msg.alert('Warning','ปุ่มนี้ใช้สำหรับบันทึก Hotspot เท่านั้น หากต้องการบันทึกขอบเขต ให้ใช้ปุ่มด้านซ้ายมือ');
          return false;
        }

        var cbLacodeStore = new Ext.data.Store({
          url: '/map/get_lacode'
          ,baseParams: { ampcode: ampcode }
          ,reader: new Ext.data.JsonReader({
            root: 'rows'
            ,totalProperty: 'totalCount'
            ,id: 'id'
          },[
            'id'
            ,'lacode'
            ,'laname'
          ])
        }); //eo cbLacodeStore

        cbLacodeStore.load();
 
        cbResourceStore = new Ext.data.SimpleStore({
            fields: ['rescode','resdesc']
            ,data: [['1','หน่วยงานภายในท้องถิ่นทำเองทั้งหมด'],['2','หน่วยงานภายในและภายนอกท้องถิ่นร่วมกันทำ'],['3','หน่วยงานภายนอกมาทำทั้งหมด'],['4','ไม่มีหน่วยงานใดมาทำเลย']]
        });

        var radioFlag;
 
        if (cur_geometry.CLASS_NAME == "OpenLayers.Geometry.Point")
        {
          radioFlag = false;
          // Expand accordion acc-5
          Ext.getCmp('acc-5').expand();
        }
        else
        {
          radioFlag = true;
          // Expand accordion acc-3
          Ext.getCmp('acc-3').expand();
        }

        var hotspotForm = new Ext.form.FormPanel({
          width: 400
          ,id: 'hotspotForm'
          ,buttonAlign: 'center'
          ,autoHeight: true
          ,labelWidth: 75
          ,url: '/map/add_hotspot'
          ,baseParams: {
            hot_loc_id: cur_loc_id
          }
          ,frame: false
          ,border: false
          ,bodyStyle: 'padding: 5px 5px 0 5px;'
	  ,title: 'รายละเอียด Hotspot'
          ,defaults: {
            anchor: '90%'
            ,msgTarget: 'side'
          }
          ,defaultType: 'textfield'
          ,items: [{
            id: 'hot_id'
            ,name: 'hot_id'
            ,fieldLabel: 'ID'
            ,disabled: true
            ,value: cur_id
          },{
            xtype: 'textarea'
            ,id: 'hot_geometry'
            ,fieldLabel: 'Geometry'
            ,name: 'hot_geometry'
            ,value: cur_geometry
          },{
            xtype:'combo'
            ,id: 'hot_code'
            ,name: 'hot_code'
            ,hiddenName: 'hotcode'
            ,store: hotspotStore
            ,fieldLabel: 'Hotspot '
            ,valueField: 'hotcode'
            ,displayField: 'hotdesc'
            ,typeAhead: true
            ,mode: 'local'
            ,triggerAction: 'all'
            ,emptyText: 'Select...'
            ,selectOnFocus: true
          },{
            xtype: 'textarea'
            ,id: 'hot_description'
            ,fieldLabel: 'Description'
            ,name: 'hot_description'
          },{
            id: 'hot_date'
            ,name: 'hot_date'
            ,xtype: 'datefield'
            ,fieldLabel: 'Date'
            ,format: 'Y-m-d'
          }] // eof items
          ,buttons: [{
            text:'Save'
            ,handler: function() {
              hotspotForm.getForm().submit({
                success: function(f, a) {
                  Ext.Msg.show({
                    title: 'Success'
                    ,width: 250
                    ,msg: '1 record added to Database'
                    ,icon: Ext.MessageBox.INFO
                    ,buttons: Ext.MessageBox.OK
                  });
                  win.close();
                } // eo success
                ,failure: function(f, a) {
                  Ext.Msg.show({
                    title: 'Warning'
                    ,width: 250
                    ,msg: 'Fail to add Hotspot to Database'
                    ,icon: Ext.MessageBox.WARNING
                    ,buttons: Ext.MessageBox.OK
                  })
                } // eo failure
              }) // eo hotspotForm
            } // eo handler
          },{
            text: 'Reset'
            ,handler: function(){
              hotspotForm.getForm().reset();
            } // eo handler
          }] // eo buttons
        }); // eo hotspotForm

        var win = new Ext.Window({
          title: 'แบบฟอร์มบันทึก Hotspot'
          ,id: 'inp-win'
          ,width: 400
          ,autoHeight: true
          ,items: [ hotspotForm ]
        });
        cbid = Ext.getCmp('hot_id');
        if (cbid.value.search(/OpenLayers/) == 0)
          cbid.setValue('');
        win.show();
      };
    };

    var createSelectPopup = function() {
      selectPopup = new OpenLayers.Control.SelectFeature(vectorLayer, {
        title: 'Detail'
        ,onSelect: onFeatureSelect
        ,onUnselect: onFeatureUnselect
      });

      function onPopupClose(evt) {
        selectPopup.unselect(selectedFeature);
      }

      function onFeatureSelect(feature) {
        selectedFeature = feature;
        var selected = 0;
	if (contentForPopup.length == 0)
	{
	  contentForPopup[0] = "Not a valid feature, please enter info. first";
	}
        for (selected=0; selected<vectorLayer.features.length; selected++ )
        {
          if (feature.id == vectorLayer.features[selected].id)
          {
            content = contentForPopup[selected];
            break;
          }
        }
        popup = new OpenLayers.Popup.FramedCloud("chicken"
          ,feature.geometry.getBounds().getCenterLonLat()
          ,new OpenLayers.Size(400, 400)
          ,content
          ,null
          ,true
          ,onPopupClose
        );
        feature.popup = popup;
        map.addPopup(popup);
      }

      function onFeatureUnselect(feature) {
        if (feature.popup)
        {
          map.removePopup(feature.popup);
          feature.popup.destroy();
          feature.popup = null;
        }
      }
    };

    myData = [];

    var createSearchResultGrid = function() {
      store = new Ext.data.SimpleStore({
        fields: [
        { name: 'id' }
        ,{ name: 'lacode' }
      ]
    });
    store.loadData(myData);

    searchResultGrid = new Ext.grid.GridPanel({
      store: store
      ,id: 'search-result-grid'
      ,columns: [
        new Ext.grid.RowNumberer()
        ,{ id:'srch_id', header: 'ID', dataIndex: 'id', width: 50 }
        ,{ id:'srch_lacode', header: 'LA Code', dataIndex: 'lacode', width: 150 }
      ]
      ,sm: new Ext.grid.RowSelectionModel({
        singleSelect: true
        ,listeners: {
          rowselect: function(sm, row, rec) {
            var id = rec.data.id;
            var lacode = rec.data.lacode;
            var v = vectorLayer.features;
            //circleFeature(v,id);
            zoomToLadmin(v,id,lacode);
          }
        }
      })
      ,stripeRows: true
      ,autoHeight: true
      ,autoHide: true
    });
  };

  var problemStore = new Ext.data.Store({
    url: '/map/get_problem'
    ,method: 'POST'
    ,reader: new Ext.data.JsonReader({
      root: 'rows'
      ,totalProperty: 'totalCount'
      ,id: 'id'
    },[
      'id'
      ,'probcode'
      ,'probdesc'
    ])
  }); //eo problemStore

  problemStore.load();
 
  var smProb = new Ext.grid.RowSelectionModel({
    singleSelect: true
    ,listeners: {
      rowselect: {
        fn: function(sm,index,record){
          cur_problemcode = record.data.probcode;
          cur_desc = record.data.probdesc;
        }
      }
    }
  });

  var hotspotStore = new Ext.data.Store({
    url: '/map/get_hotspot'
    ,method: 'POST'
    ,reader: new Ext.data.JsonReader({
      root: 'rows'
      ,totalProperty: 'totalCount'
      ,id: 'id'
    },[
      'id'
      ,'hotcode'
      ,'hotdesc'
    ])
  }); //eo hotspotStore

  hotspotStore.load();

  var smHotspot = new Ext.grid.RowSelectionModel({
    singleSelect: true
    ,listeners: {
      rowselect: {
        fn: function(sm,index,record){
          cur_hotcode = record.data.hotcode;
          cur_hotdesc = record.data.hotdesc;
          var box = map.getExtent().toBBOX();

          //clear all features on hotspotShadow
          if (hotspotShadow.features)
            hotspotShadow.removeFeatures(hotspotShadow.features);

          //clear all markers on hotspotLayer
          hotspotLayer.clearMarkers();

          //remove all popups
          while (map.popups.length) {
            map.removePopup(map.popups[0]);
          }

          var con = new Ext.data.Connection();
          con.request({
            url: '/map/get_location'
            ,params: {
               hotcode: cur_hotcode
               ,extent: box
            }
            ,method: 'POST'
            ,success: function(resp,opt) {
              var info = Ext.util.JSON.decode(resp.responseText);
              var wkt = new OpenLayers.Format.WKT();
              //Get total features
              totalCount = parseInt(info.totalCount);
                 
              if (totalCount == 0)
              {
                Ext.Msg.alert("Warning", "ไม่พบ Hotspot ในขอบเขตปัจจุบัน");
                return false;
              }

              //get all features
              for (var i=0; i<totalCount; i++)
              {
                //Add hotspotLayer with icon accoring to loc_code
                var size = new OpenLayers.Size(30,30);
                var offset = new OpenLayers.Pixel(-(size.w/2), -(size.h/2));
                var imgurl = "http://202.176.91.194/ms520/symbols/icon" + info.rows[i].loc_code + ".png";
                var icon = new OpenLayers.Icon(imgurl,size,offset);

                var lon = info.rows[i].lon;
                var lat = info.rows[i].lat;

                var feat = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lon,lat),null,style_hotspot);
                feat.attributes.id = info.rows[i].id;
                hotspotShadow.addFeatures(feat);

                var marker = createFeatureWithMarker(lon,lat,info.rows[i].loc_desc,icon.clone());
                hotspotLayer.addMarker(marker);
              }
            }
            ,failure: function(f,a) {
              Ext.Msg.alert('Warning', 'Server Error');
            }
          })
        }
      }
    }
  });

  function showRiskForm (){
    var riskHotStore = new Ext.data.Store({
      url: '/map/get_location'
      ,baseParams: {
        ampcode: ampcode
        ,hotcode: 0 // show all hotspots
        ,extent: cur_extent
      }
      ,method: 'POST'
      ,reader: new Ext.data.JsonReader({
        root: 'rows'
        ,totalProperty: 'totalCount'
        ,id: 'id'
      },[
        'id'
        ,'loc_code'
        ,'loc_desc'
        ,'lon'
        ,'lat'
      ])
    }); //eo riskHotStore

    riskHotStore.load();

    var cbLacodeStore = new Ext.data.Store({
      url: '/map/get_lacode'
      ,baseParams: { ampcode: ampcode }
      ,reader: new Ext.data.JsonReader({
        root: 'rows'
        ,totalProperty: 'totalCount'
        ,id: 'id'
      },[
        'id'
        ,'lacode'
        ,'laname'
      ])
    }); //eo cbLacodeStore

    cbLacodeStore.load();

    var cbResourceStore = new Ext.data.SimpleStore({
        fields: ['rescode','resdesc']
        ,data: [['1','หน่วยงานภายในท้องถิ่นทำเองทั้งหมด'],['2','หน่วยงานภายในและภายนอกท้องถิ่นร่วมกันทำ'],['3','หน่วยงานภายนอกมาทำทั้งหมด'],['4','ไม่มีหน่วยงานใดมาทำเลย']]
    });

    var riskForm = new Ext.form.FormPanel({
      width: 400
      ,id: 'riskForm'
      ,buttonAlign: 'center'
      ,autoHeight: true
      ,labelWidth: 75
      ,url: '/map/add_risk'
      ,baseParams: {
        risk_code: cur_risk_code 
      }
      ,frame: false
      ,border: false
      ,bodyStyle: 'padding: 5px 5px 0 5px;'
      ,title: 'รายละเอียด'
      ,defaults: {
        anchor: '90%'
        ,msgTarget: 'side'
      }
      ,defaultType: 'textfield'
      ,items: [{
        id: 'risk_hot_id'
        ,name: 'risk_hot_id'
        ,fieldLabel: 'Hotspot ID'
        ,disabled: false
        ,value: cur_hot_id
      },{
        xtype:'combo'
        ,id: 'risk_hot_code'
        ,name: 'risk_hot_code'
        ,hiddenName: 'loc_code'
        ,store: riskHotStore
        ,fieldLabel: 'Hotspot'
        ,valueField: 'loc_code'
        ,displayField: 'loc_desc'
        ,typeAhead: true
        ,mode: 'local'
        ,triggerAction: 'all'
        ,emptyText: 'Select...'
        ,selectOnFocus: true
        ,listeners: {
          select: function(f,r,i){
            Ext.getCmp('risk_hot_id').setValue(r.data.id);
          }
        } // eo listeners
      },{
        xtype: 'combo'
        ,id: 'risk_lacode'
        ,name: 'risk_lacode'
        ,hiddenName: 'lacode'
        ,store: cbLacodeStore
        ,fieldLabel: 'อปท.' 
        ,valueField: 'lacode'
        ,displayField: 'laname'
        ,typeAhead: true
        ,mode: 'local'
        ,triggerAction: 'all'
        ,emptyText: 'Select...'
        ,selectOnFocus: true
      },{
        id: 'risk_name'
        ,name: 'risk_name'
        ,fieldLabel: 'พฤติกรรมเสี่ยง' 
        ,value: cur_risk_name
      },{
        id: 'risk_population'
        ,fieldLabel: 'จำนวนประชากร'
        ,name: 'risk_population'
      },{
        xtype: 'combo'
        ,id: 'risk_resource'
        ,name: 'risk_resource'
        ,hiddenName: 'risk_rescode'
        ,store: cbResourceStore
        ,fieldLabel: 'ทรัพยากรที่มีอยู่'
        ,valueField: 'rescode'
        ,displayField: 'resdesc'
        ,typeAhead: true
        ,mode: 'local'
        ,triggerAction: 'all'
        ,emptyText: 'Select...'
        ,selectOnFocus: true
      }] // eof items
      ,buttons: [{
        text:'Save'
        ,handler: function() {
          riskForm.getForm().submit({
            success: function(f, a) {
              Ext.Msg.show({
                title: 'Success'
                ,width: 250
                ,msg: '1 record added to Database'
                ,icon: Ext.MessageBox.INFO
                ,buttons: Ext.MessageBox.OK
              });
              win.close();
            } // eo success
            ,failure: function(f, a) {
              Ext.Msg.show({
                title: 'Warning'
                ,width: 250
                ,msg: 'Fail to add to Database'
                ,icon: Ext.MessageBox.WARNING
                ,buttons: Ext.MessageBox.OK
              })
            } // eo failure
          }) // eo riskForm
        } // eo handler 
      },{
        text: 'Reset'
        ,handler: function(){
          riskForm.getForm().reset();
        } // eo handler
      }] // eo buttons
    }); // eo riskForm

    var win = new Ext.Window({
      title: 'แบบบันทึกพฤติกรรมเสี่ยง'
      ,id: 'risk-win'
      ,width: 400
      ,autoHeight: true
      ,items: [ riskForm ]
    });
    win.show();
  }

  function createFeatureWithMarker(lon,lat,info,icon){  
    var lonlat = new OpenLayers.LonLat(lon,lat);  
    var contentHTML = "<" + "div>" + info.split(",").join('<' + 'br/>') + "</" + "div>";  
    var config = {
      popupContentHTML: contentHTML,
      icon: icon,
      popupSize: new OpenLayers.Size(200, 40)
    };  
    var feature = new OpenLayers.Feature(hotspotLayer,lonlat,config);  
    feature.popupClass = OpenLayers.Popup.FramedCloud;

    var marker = feature.createMarker();  
    marker.events.register('click', feature, function(){displayPopup(feature);});  
    return marker;
  }  

  function displayPopup(feature){  
    feature.destroyPopup();  
    map.addPopup(feature.createPopup(true),true);  
  }  

  var showRiskMap = function(){
    // Clear old POINT + pointRadius in resourceLayer
    if (resourceLayer.features)
      resourceLayer.removeFeatures(resourceLayer.features);

    // Clear all Markers in hotspotLayer
    hotspotLayer.clearMarkers();

    //Next draw a circle around each point
    //radius compile with criteria
    //color according to resourcecode

    if (cur_risk_code > 0)
    {
      var con = new Ext.data.Connection();
      con.request({
        url: '/map/get_riskmap'
        ,params: { ampcode: ampcode, riskcode: cur_risk_code, extent: cur_extent }
        ,method: 'POST'
        ,success: function(resp,opt) {
          var info = Ext.util.JSON.decode(resp.responseText);
          var wkt = new OpenLayers.Format.WKT();
          
          for (i=0;i<info.totalCount;i++)
          {
            id = info.rows[i].id;
            lon = info.rows[i].lon;
            lat = info.rows[i].lat;
            radius = info.rows[i].radius;
            color = info.rows[i].color;
            cur_icontype = info.rows[i].icon;

            if (radius < 100)
              style_resource.pointRadius = 25;
            else if (radius < 10000)
              style_resource.pointRadius = 50;
            else
              style_resource.pointRadius = 100;

            if (color == 1)
            {
              style_resource.fillColor = "#FF3333";
              style_resource.strokeColor = "#CC0000";
            }
            else if (color == 2)
            {
              style_resource.fillColor = "#00CC33";
              style_resource.strokeColor = "#006600";
            }
            else if (color == 3)
            {
              style_resource.fillColor = "#FFFF00";
              style_resource.strokeColor = "#996600";
            }
            else
            {
              style_resource.fillColor = "#66CCFF";
              style_resource.strokeColor = "#0000CC";
            }

            //Create a circle to draw on problem point to show SIZE of the problem
            //And resource code related to that location
            //style_point was configured with pointRadius and fillColor
            //according to data from gfund

            pt = new OpenLayers.Geometry.Point(lon,lat);
            pointFeature[i] = new OpenLayers.Feature.Vector(pt.clone(),null,style_resource);
            resourceLayer.addFeatures(pointFeature[i]);

            //probFeature[i] = new OpenLayers.Feature.Vector(pt.clone(),null,style_problem);
            //probFeature[i].attributes.name = "name " + i;
            //probFeature[i].attributes.description = "description " + i;

            //Add problemLayer with icon accoring to res-icontype

            var size = new OpenLayers.Size(45,45);
            var offset = new OpenLayers.Pixel(-(size.w/2), -(size.h/2));
            var imgurl = "http://202.176.91.194/ms520/symbols/icon" + cur_icontype + ".png";

            var icon = new OpenLayers.Icon(imgurl,size,offset);
            marker = new OpenLayers.Marker( new OpenLayers.LonLat(lon,lat),icon.clone());
            hotspotLayer.addMarker(marker);
          } //eof for loop
        } //eo success
        ,failure: function(f,a) {
          Ext.Msg.alert('Warning', 'Server Error');
        }
      })
    } //eo if
  }; //eo function

  var probcode_edit = new Ext.form.TextField();
  var probdesc_edit = new Ext.form.TextField();

  var ds_model_prob = new Ext.data.Record.create([
    'id'
    ,'prob_code'
    ,'prob_desc'
  ]); //eo ds_model_prob

  var addImage = function(){
    return '<img alt="Add Problem Detail" src="/images/add.png"/>';
  };

  var problemgrid = new Ext.grid.EditorGridPanel({
    frame: false
    ,id: 'problemGrid'
    ,width: 250
    ,height: 200
    ,autoScroll: true
    ,store: problemStore
    ,columns: [
      //{id: 'id', header: 'ID', dataIndex: 'id', width: 40}
      {id: 'prob_code', header: 'Code', dataIndex: 'probcode', width: 50, editor: probcode_edit}
      ,{id: 'prob_desc', header: 'Name', dataIndex: 'probdesc', width: 150, editor: probdesc_edit}
      ,{id: 'prob_add', header: '', width: 30, dataIndex: '', 
         renderer: addImage}
    ]
    ,sm: smProb
    ,autoExpandColumn: 'prob_desc'
    ,viewConfig: {forceFit: true}
    ,clicksToEdit: 2
    ,listeners: {
      afteredit: function(e) {
        var con = new Ext.data.Connection();
        if (e.field == 'probcode')
          e.field = 'prob_code';
        else
          e.field = 'prob_desc';
        con.request({
          url: '/map/update_problem'
          ,params: {
            id: e.record.data.id
            ,field: e.field
            ,value: e.value
          } //eo params
          ,success: function(resp, opt) {
            var info = Ext.util.JSON.decode(resp.responseText);
            e.record.commit();
          } //eo success
          ,failure: function(resp, opt) {
            Ext.Msg.show({
              title: 'Server Response'
              ,width: 200
              ,msg: 'Unable to update record'
              ,icon: Ext.Msg.ALERT
              ,buttons: Ext.Msg.OK
            }); //eo show
            e.record.reject();
          } //eo failure
        }); //eo request
      } //eo afteredit

      ,cellclick: function(grid, rowIndex, columnIndex, e){
        var data = grid.getStore().data.items[rowIndex].data;
        var code = data.probcode;
        var desc = data.probdesc;

        cur_risk_code = code
        cur_risk_name = desc

        if (columnIndex == 0)
        {
          Ext.Msg.alert('Info','CODE: ' + code);
        }
        else if (columnIndex == 1)
        {
          showRiskMap();
        }
        else if (columnIndex == 2)
        { 
          cur_risk_code = code;
          cur_risk_name = desc;
          showRiskForm();
        }
      } //eo cellclick
    } //eo listeners
  }); //eo problemgrid

  var hotcode_edit = new Ext.form.TextField();
  var hotdesc_edit = new Ext.form.TextField();

  var ds_model_hotspot = new Ext.data.Record.create([
    'id'
    ,'hot_code'
    ,'hot_desc'
  ]); //eo ds_model_hotspot

  var hotspotgrid = new Ext.grid.EditorGridPanel({
    frame: false
    ,id: 'hotspotGrid'
    ,width: 250
    ,height: 300
    ,autoScroll: true
    ,store: hotspotStore
    ,columns: [
      //{id: 'id', header: 'ID', dataIndex: 'id', width: 40}
      {id: 'hot_code', header: 'Code', dataIndex: 'hotcode', width: 50, editor: hotcode_edit}
      ,{id: 'hot_desc', header: 'Name', dataIndex: 'hotdesc', width: 150, editor: hotdesc_edit}
    ]
    ,sm: smHotspot
    ,autoExpandColumn: 'hotdesc'
    ,viewConfig: {forceFit: true}
    ,clicksToEdit: 2
    ,listeners: {
      afteredit: function(e) {
        var con = new Ext.data.Connection();
        if (e.field == 'hotcode')
          e.field = 'hot_code';
        else
          e.field = 'hot_desc';
        con.request({
          url: '/map/update_hotspot'
          ,params: {
            id: e.record.data.id
            ,field: e.field
            ,value: e.value
          } //eo params
          ,success: function(resp, opt) {
            var info = Ext.util.JSON.decode(resp.responseText);
            e.record.commit();
          } //eo success
          ,failure: function(resp, opt) {
            Ext.Msg.show({
              title: 'Server Response'
              ,width: 200
              ,msg: 'Unable to update record'
              ,icon: Ext.Msg.ALERT
              ,buttons: Ext.Msg.OK
            }); //eo show
            e.record.reject();
          } //eo failure
        }); //eo request
      } //eo afteredit
    } //eo listeners
  }); //eo hotspotgrid

  var zoomToLadmin = function(v, id, lacode) {
    for (var i=0; i<v.length; i++)
    {
      if (v[i].id == id) // select this id via rowselect
      {
        var lonlat = v[i].geometry.getBounds().getCenterLonLat();
        var xlon = lonlat.lon;
        var xlat = lonlat.lat;
        map.setCenter( new OpenLayers.LonLat(xlon, xlat), 10);
        selectPopup.activate();
      }
    }
  };

  var tamcodeStore = new Ext.data.Store({
    url: '/map/get_tamcode'
    ,baseParams: { ampcode: ampcode }
    ,reader: new Ext.data.JsonReader({
      root: 'rows'
      ,totalProperty: 'totalCount'
      ,id: 'id'
    },[
      'id'
      ,'tamcode'
      ,'tamname'
    ])
  }); //eo tamcodeStore

  tamcodeStore.load();

  var sm = new Ext.grid.RowSelectionModel({
    singleSelect: true
    ,listeners: {
      rowselect: {
        fn: function(sm,index,record){
          var con = new Ext.data.Connection();
          con.request({
            url: '/map/tamRowSelect'
            ,params: { id: record.data.id }
            ,method: 'POST'
            ,success: function(resp,opt) {
              var info = Ext.util.JSON.decode(resp.responseText);
              var wkt = new OpenLayers.Format.WKT();
              var feature = wkt.read(info.geom);
              //Add Tambon polygon here after remove the old one
              if (vectorLayer.features)
                vectorLayer.removeFeatures(vectorLayer.features);
              vectorLayer.addFeatures(feature);
            }
            ,failure: function(f,a) {
              Ext.Msg.alert('Warning', 'Server Error');
            }
          })
        }
      }
    }
  });

  var tamcodegrid = new Ext.grid.GridPanel({
    frame: false
    ,width: 250
    ,height: 300
    ,autoScroll: true
    ,store: tamcodeStore
    ,columns: [
      //new Ext.grid.RowNumberer()
       {id: 'id', header: 'ID', dataIndex: 'id', width: 50}
      ,{id: 'tamcode', header: 'Code', dataIndex: 'tamcode', width: 80}
      ,{id: 'tamname', header: 'Name', dataIndex: 'tamname', width: 120}
    ]
    ,sm: sm
    ,autoExpandColumn: 'tamname'
    ,viewConfig: {forceFit: true}
  }); //eo tamcodegrid

  var panel_tamcode = new Ext.Panel({
    id: 'panel_tamcode'
    ,layout: 'fit'
    ,items: [ tamcodegrid ]
  });

  var lacodeStore = new Ext.data.Store({
    url: '/map/get_lacode'
    ,baseParams: { ampcode: ampcode }
    ,reader: new Ext.data.JsonReader({
      root: 'rows'
      ,totalProperty: 'totalCount'
      ,id: 'id'
    },[
      'id'
      ,'lacode'
      ,'laname'
    ])
  }); //eo lacodeStore

  lacodeStore.load();

  var ds_model = new Ext.data.Record.create([
    'id'
    ,'lacode'
    ,'laname'
  ]); //eo ds_model

  var smLadmin = new Ext.grid.RowSelectionModel({
    singleSelect: true
    ,listeners: {
      rowselect: {
        fn: function(sm,index,record){
          var con = new Ext.data.Connection();
          con.request({
            url: '/map/ladminRowSelect'
            ,params: { lacode: record.data.lacode }
            ,method: 'POST'
            ,success: function(resp,opt) {
			  alert("debug 20100504");
			  debugger;
              var info = Ext.util.JSON.decode(resp.responseText);
              if (info.id == -1)
              {
                var msg = 'Geometry not set, please create geometry first';
                toolbarExample.app.setStatus(msg);
                return false;
              }
              else
              {
                var center = info.center.split(',');
                map.setCenter( new OpenLayers.LonLat(center[0], center[1]), 13);
              }
            }
            ,failure: function(f,a) {
              Ext.Msg.alert('Warning', 'Server Error');
            }
          })
        }
      }
    }
  });

  var lacodegrid = new Ext.grid.GridPanel({
    frame: false
    ,width: 250
    ,height: 300
    ,autoScroll: true
    ,store: lacodeStore
    ,columns: [
      //new Ext.grid.RowNumberer()
      {id: 'id', header: 'ID', dataIndex: 'id', width: 50}
      ,{id: 'lacode', header: 'LA Code', dataIndex: 'lacode', width: 80}
      ,{id: 'laname', header: 'LA Name', dataIndex: 'laname', width: 120}
    ]
    ,sm: smLadmin
    ,autoExpandColumn: 'laname'
    ,viewConfig: {forceFit: true}
  }); //eo lacodegrid

  var panel_lacode = new Ext.Panel({
    id: 'panel_lacode'
    ,layout: 'fit'
    ,items: [ lacodegrid ]
  });

  var createViewport = function() {
    viewport = new Ext.Viewport({
      layout: 'border'
      ,items: [
        new Ext.BoxComponent({
          region: 'north'
          ,el: 'north'
          ,height: 60
          ,margins: '0 5 0 5'
          ,style:'background-image:url(/images/header.gif);background-repeat:no-repeat;border:solid 1px #1D6241;'
        }),{
          region: 'west'
          ,title: 'Main Menu'
          ,width: 250
          ,height: 400
          ,border: false
          ,margins: '5 5 0 5'
          ,cmargins: '5 5 0 5'
          ,frame: false
          ,split: true
          ,layout: 'accordion'
          ,collapsible: true
          ,items: [{
            id: 'acc-1'
            ,title: 'Layer Tree'
            ,items: [tree]
          },{
            id: 'acc-2'
            ,title: 'รหัสตำบล'
            ,items: panel_tamcode
          },{
            id: 'acc-3'
            ,title: 'รหัสอปท.'
            ,items: panel_lacode
          },{
            id: 'acc-4'
            ,title: 'Search Result'
            ,items: [ searchResultGrid ]
          },{
            id: 'acc-5'
            ,title: 'พฤติกรรมเสี่ยง'
            ,items: [ problemgrid ]
          },{
            id: 'acc-6'
            ,title: 'Hotspot List'
            ,items: [ hotspotgrid ]
          }]
        },{
          region: 'center'
          //,title: 'map'
          ,layout: 'fit'
          ,frame: false
          ,border: true
          ,margins: '5 5 0 0'
          ,items: [{
            xtype: 'mapcomponent'
            ,map: map
            ,tbar: toolbar
            ,border: false
          }]
        },{
          region: 'south'
          ,id: 'statusBar'
          ,border: false
          ,bodyStyle: 'text-align:left;padding:0px;'
          ,height: 30
          ,margins: '5 0 0 0'
          ,frame: true
          ,html: 'a status bar'
        }]
      });
    };
        
  doSearch = function(){
    //First clear all features in vectorLayer and hilite Layer
    if (vectorLayer.features)
    {
      vectorLayer.removeFeatures(vectorLayer.features);
    }
    if (hilite.features)
    {
      hilite.removeFeatures(hilite.features);
    }
    if (selectedFeature && selectedFeature.popup)
    {
      map.removePopup(selectedFeature.popup);
    }

    //clear all features on hotspotShadow
    if (hotspotShadow.features)
      hotspotShadow.removeFeatures(hotspotShadow.features);

    hotspotLayer.clearMarkers();

    if (resourceLayer.features)
      resourceLayer.removeFeatures(resourceLayer.features);

    // prevent showRiskMap function to draw when ZOOMIN ZOOMOUT (moveend)
    cur_risk_code = 0;

    var keyword = Ext.get('kw').getValue();

    if (cur_query.length > 0)
    {
      keyword = cur_query;
      cur_query = '';
    }

    var con = new Ext.data.Connection();
    con.request({
      url: '/map/search'
      ,method: 'POST'
      ,params: { keyword: keyword }
      ,success: function(resp,opt) {
        var info = Ext.util.JSON.decode(resp.responseText);
        var s_id = info.id.split('|');
        var s_lacode = info.lacode.split('|');
        var s_laname = info.laname.split('|');
        var s_geom = info.geom.split('|');
        var s_msg = info.msg;
        var s_totalCount = info.totalCount;
        var lonlat = '';

        var rec = new Array();
	if (s_totalCount == 0)
        {
          Ext.Msg.show({
            title: 'Server Message'
            ,width: 250
            ,msg: s_msg
            ,icon: Ext.MessageBox.WARNING
            ,buttons: Ext.MessageBox.OK
          });
        }
        if (s_totalCount > 0)
        {
          //Show searchResultGrid
          Ext.getCmp('acc-4').expand();
          Ext.get('search-result-grid').enableDisplayMode().show();
       }

        for(var i=0; i<s_totalCount; i++)
        {
          var wkt = new OpenLayers.Format.WKT();
          var feature = wkt.read(s_geom[i]);
          contentForPopup[i] = '<h2>ID: ' + s_id[i] + '</h2>' + s_laname[i] + '<p>&nbsp;';
          feature.id = s_id[i];
          feature.lacode = s_lacode[i];
          feature.laname = s_laname[i];
          vectorLayer.addFeatures(feature);
          lonlat = feature.geometry.getBounds().getCenterLonLat();
          rec[i] = [feature.id,feature.lacode];
        }

        myData = rec;
        store.loadData(myData);

        // Set Center of Map to last feature LonLat
        var xlon = lonlat.lon;
        var xlat = lonlat.lat;
        map.setCenter( new OpenLayers.LonLat(xlon, xlat), 10);

        selectPopup.activate();

        /*
          Ext.Msg.show({
            title: 'Search Status'
            ,msg: msg
            ,width: 200
            ,icon: Ext.MessageBox.INFO
            ,buttons: Ext.MessageBox.OK
          });
        */
      }
      ,failure: function(f,a) {
        Ext.Msg.alert('Warning', 'Server Error');
      }
    });
  };

  var setToolbarContent = function() {
    var info = "ปรับแก้โปรแกรมหลังการประชุมวันเสาร์ 22 สิงหาคม 2552 ";
    info += "<br>เพิ่มปุ่ม เขียนขอบเขตชุมชน (วงรี) สำหรับ กทม.";
    info += "<br>เปลี่ยนปุ่มวาด Polygon เป็น เขียนขอบเขตอปท.";
    info += "<br>เพิ่มปุ่ม บันทึก Hotspot เพื่อนำ Hotspot ไปใช้ร่วมกันในหลายๆพฤติกรรมเสี่ยงได้";
    info += "<br>เพิ่มปุ่ม บันทึก Polygon อปท.";
    info += "<br>เพิ่มปุ่ม บันทึกตำแหน่ง Hotspot";
    info += "<br>เพิ่มปุ่ม ลบ Hotspot ออกจาก Database";
    info += "<br>เมื่อ Click ที่ Hotspot จะสามารถแสดง Popup ระบุ description ของ Hotspot นั้นๆได้<p>";
    info += "<p>กำลังออกแบบการบันทึกข้อมูลพฤติกรรมเสี่ยง ในจุด Hotspot ต่างๆ";

    var buttonHelp = new Ext.Toolbar.Button({
        iconCls: 'help'
        ,tooltip: 'Update ความคืบหน้าโปรแกรม'
        ,disabled: false
        ,handler: function(){
           Ext.Msg.alert('สถานะล่าสุด', info);
        }
    });

    toolbar.add(buttonHelp);

    addSeparator();
                
    toolbar.addControl(
      new OpenLayers.Control.ZoomBox({
        title: 'Zoom in: click in the map or use the left mouse button and drag to create a rectangle'
      }), {
        iconCls: 'zoomin'
        ,toggleGroup: 'map'
      }
    );
            
    toolbar.addControl(
                new OpenLayers.Control.ZoomBox({
                    out: true,
                    title: 'Zoom out: click in the map or use the left mouse button and drag to create a rectangle'
                }), {
                    iconCls: 'zoomout',
                    toggleGroup: 'map'
                }
    );
                
    toolbar.addControl(
               new OpenLayers.Control.DragPan({
                    isDefault: true,
                    title: 'Pan map: keep the left mouse button pressed and drag the map'
                }), {
                    iconCls: 'pan',
                    toggleGroup: 'map'
                }
            );
                
    addSeparator();
                
    var controlPoint = new OpenLayers.Control.DrawFeature(vectorLayer,
        OpenLayers.Handler.Point, {
          title: 'ระบุตำแหน่ง Hotspot'
          ,drawFeature: myPointDrawFeature
        });

    function myPointDrawFeature(geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry,null,style_point);
        // do something with feature before it is added to the layer
        // at this point you know which control did the drawing
        vectorLayer.addFeatures([feature]);
        controlPoint.featureAdded(feature);
        //vectorLayer.setVisibility(false);
        //vectorLayer.setVisibility(true);
    };

    var lineOptions = {freehand: false};
    var controlLine = new OpenLayers.Control.DrawFeature(vectorLayer,
        OpenLayers.Handler.Path, {
          title: 'ลากเส้นถนน'
          ,handlerOptions: lineOptions
          ,callbacks: {"done": myLineDrawFeature }
        });

    function myLineDrawFeature(geometry) {
		var linegeom = geometry.getComponentsString();
		alert ("linegeom:" + linegeom);
        var feature = new OpenLayers.Feature.Vector(geometry,null);
        // do something with feature before it is added to the layer
        // at this point you know which control did the drawing
        vectorLayer.addFeatures([feature]);
        controlLine.featureAdded(feature);
        //vectorLayer.setVisibility(false);
        //vectorLayer.setVisibility(true);
    };

    var circleOptions = {sides:40, irregular:true};
    var controlCircle = new OpenLayers.Control.DrawFeature(vectorLayer,
        OpenLayers.Handler.RegularPolygon, {
          title: 'เขียนขอบเขตชุมชน กทม.'
          ,handlerOptions: circleOptions
          ,drawFeature: myCircleDrawFeature
        });

    function myCircleDrawFeature(geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry,null,style_point);
        // do something with feature before it is added to the layer
        // at this point you know which control did the drawing
        vectorLayer.addFeatures([feature]);
        controlCircle.featureAdded(feature);
        //vectorLayer.setVisibility(false);
        //vectorLayer.setVisibility(true);
    };

    var controlPolygon = new OpenLayers.Control.DrawFeature(vectorLayer,
        OpenLayers.Handler.Polygon, {
          title: 'เขียนขอบเขตอปท.'
          ,drawFeature: myPolyDrawFeature
            });

      function myPolyDrawFeature(geometry) {
       var feature = new OpenLayers.Feature.Vector(geometry);
        // do something with feature before it is added to the layer
        // at this point you know which control did the drawing
        vectorLayer.addFeatures([feature]);
        controlPolygon.featureAdded(feature);
        //vectorLayer.setVisibility(false);
        //vectorLayer.setVisibility(true);
      };
    
    toolbar.addControl(
                controlPoint, {
                    iconCls: 'drawpoint'
                    ,toggleGroup: 'map'
                }
            );

    toolbar.addControl(
                controlLine, {
                    iconCls: 'drawline'
                    ,toggleGroup: 'map'
                }
            );

	toolbar.addControl(
                controlCircle, {
                    iconCls: 'drawcircle'
                    ,toggleGroup: 'map'
                }
            );

    toolbar.addControl(
                controlPolygon, {
                    iconCls: 'drawpolygon'
                    ,toggleGroup: 'map'
                }
            );

    addSeparator();
    
    var featureErase = function(feature) {
        vectorLayer.removeFeatures(feature);
        var l = vectorLayer.features.length;
        var msg = (l==1) ? 'There is one feature on map' : 'There are now ' + l + ' features on map';
        toolbarExample.app.setStatus(msg);
      };

    var eraseOptions = {
                clickout: true
        	,title: 'Erase a feature from Map'
                ,onSelect: featureErase
                ,toggle: false
                ,multiple: false
                ,hover: false
            };

    toolbar.addControl(
        new OpenLayers.Control.SelectFeature(vectorLayer,eraseOptions), {
                    iconCls: 'erasefeature'
                    ,toggleGroup: 'map'
                }
            );

    toolbar.addControl(
      new OpenLayers.Control.ModifyFeature(vectorLayer,{title: 'Modify feature'})
      ,{
        iconCls: 'modifyfeature'
        ,toggleGroup: 'map'
       }
    );

    addSeparator();

    toolbar.addControl(saveGeomControl, {
      iconCls: 'savegeom'
      ,id: 'tb-savegeom'
      ,toggleGroup: 'map'
    });

    toolbar.addControl(selectControl, {
      iconCls: 'savehotspot'
      ,toggleGroup: 'map'
    });

    toolbar.addControl(saveLineControl, {
      iconCls: 'saveline'
      ,id: 'tb-saveline'
      ,toggleGroup: 'map'
    });

	toolbar.addControl(selectPopup, {
      iconCls: 'popupfeature'
      ,toggleGroup: 'map'
    });

    addSeparator();

    var deleteFromDatabase = function(id){
      Ext.Ajax.request({
        url: '/map/hot_delete'
        ,params: { id: id }
        ,success: function(resp,opt) {
          Ext.Msg.alert('Status', '1 feature deleted from Database!');
        }
        ,failure: function(resp, opt) {
          Ext.Msg.alert('Warning', 'Fail to delete feature from Database');
        }
      });
    };

    var featureRemove = function(feature) {
      var x = confirm("Delete Hotspot ID:" + feature.attributes.id + " from Database?");
      if (x==true) {
        hotspotShadow.removeFeatures(feature);
        var l = hotspotShadow.features.length;
        var msg = (l==1) ? 'There is one feature on map' : 'There are now ' + l + ' features on map';
        //delete this feature from database
        deleteFromDatabase(feature.attributes.id);
        toolbarExample.app.setStatus(msg);
      }
    };

    var removeOptions = {
      clickout: true
      ,title: 'ลบ Hotspot ออกจาก Database โดยลาก mouse ไปวางเหนือ Hotspot ที่ต้องการลบ'
      ,onSelect: featureRemove
      ,toggle: false
      ,multiple: false
      ,hover: true
    };

    toolbar.addControl(
      new OpenLayers.Control.SelectFeature(hotspotShadow,removeOptions), {
        iconCls: 'removefeature'
        ,toggleGroup: 'map'
      }
    );
        
    var options = {
      displayUnits: 'km'
      ,eventListeners: {
        'measure': handleMeasurements
      }
      ,handlerOptions: {
        persist: true
        ,style: style_measure
      }
    };

    var measureControl = new OpenLayers.Control.Measure(
      OpenLayers.Handler.Path, options
    );

    function handleMeasurements(feature) {
      // var element = document.getElementById('output');
      var msg = '';
      if(feature.geometry.CLASS_NAME == "OpenLayers.Geometry.LineString") {
        msg += 'ระยะทางรวม: ' + feature.measure.toFixed(4) + ' เมตร';
      }
      // element.innerHTML = out;
      Ext.Msg.show({
        title: 'Measure Distance'
        ,msg: msg
        ,width: 250
        ,buttons: Ext.MessageBox.OK
      });
    };

    toolbar.addControl(
      measureControl, {
        iconCls: 'measurefeature'
        ,tooltip: 'Measure length'
        ,toggleGroup: 'map'
      }
    );

    var queryControl = new OpenLayers.Control();
    OpenLayers.Util.extend(queryControl, {
      draw: function () {
        // this Handler.Box will intercept the shift-mousedown
        // before Control.MouseDefault gets to see it
        this.box = new OpenLayers.Handler.Box( queryControl,
          {"done": this.notice},
          {keyMask: OpenLayers.Handler.MOD_SHIFT});
        this.box.activate();
      },

      notice: function (bounds) {
        var ll = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.bottom));
        var ur = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.top));
        var geom = 'POLYGON((' + ll.lon.toFixed(4) + ' ' + ll.lat.toFixed(4) + ',' +
          ll.lon.toFixed(4) + ' ' + ur.lat.toFixed(4) + ',' +
          ur.lon.toFixed(4) + ' ' + ur.lat.toFixed(4) + ',' +
          ur.lon.toFixed(4) + ' ' + ll.lat.toFixed(4) + ',' +
          ll.lon.toFixed(4) + ' ' + ll.lat.toFixed(4) + '))';
        cur_query = geom;
        doSearch();
      }
    });

    toolbar.addControl(
      queryControl, {
        iconCls: 'queryfeature'
        ,tooltip: 'Press SHIFT KEY and Drag area of interest'
        ,toggleGroup: 'map'
      }
    );

    var buttonClear = new Ext.Toolbar.Button({
      id: 'btn-clear'
      ,iconCls: 'clearfeats'
      ,tooltip: 'Clear all features'
      ,disabled: false
      ,handler: function(){
        if (vectorLayer.features)
        {
          vectorLayer.removeFeatures(vectorLayer.features);
        }
        if (hilite.features)
        {
          hilite.removeFeatures(hilite.features);
        }
        if (selectedFeature && selectedFeature.popup)
        {
          map.removePopup(selectedFeature.popup);
        }

        //clear all features on hotspotShadow
        if (hotspotShadow.features)
          hotspotShadow.removeFeatures(hotspotShadow.features);

        //Clear Markers in hotspotLayer, resourceLayer
        hotspotLayer.clearMarkers();

        if (resourceLayer.features)
          resourceLayer.removeFeatures(resourceLayer.features);

        //Clear selections in Problem Grid
        cur_problemcode = 0;
        Ext.getCmp('problemGrid').getSelectionModel().clearSelections();

        //Clear selections in Hotspot Grid
        cur_hotcode = 0;
        Ext.getCmp('hotspotGrid').getSelectionModel().clearSelections();

        msg = 'There are now 0 features on map';
        toolbarExample.app.setStatus(msg);
        //Then clear search result grid
        myData = [];
        store.loadData(myData);
        //Hide searchResultGrid ??
        Ext.get('search-result-grid').enableDisplayMode().hide();
      }
    });

    toolbar.add(buttonClear);

    addSeparator();

    var nav = new OpenLayers.Control.NavigationHistory();
      map.addControl(nav);
      nav.activate();
                
      var buttonPrevious = new Ext.Toolbar.Button({
        iconCls: 'back'
        ,tooltip: 'Previous view'
        ,disabled: true
        ,handler: nav.previous.trigger
      });
                
      var buttonNext = new Ext.Toolbar.Button({
                iconCls: 'next',
                tooltip: 'Next view',
                disabled: true,
                handler: nav.next.trigger
            });

            toolbar.add(buttonPrevious);
            toolbar.add(buttonNext);
                
            nav.previous.events.register(
                "activate",
                buttonPrevious,
                function() {
                    this.setDisabled(false);
                }
            );
                
            nav.previous.events.register(
                "deactivate",
                buttonPrevious,
                function() {
                    this.setDisabled(true);
                }
            );
                
            nav.next.events.register(
                "activate",
                buttonNext,
                function(){
                    this.setDisabled(false);
                }
            );
                
            nav.next.events.register(
                "deactivate",
                buttonNext,
                function() {
                    this.setDisabled(true);
                }
            );
            
            addSeparator();
            toolbar.add(new Ext.Toolbar.Fill());
      
            var buttonCls = new Ext.Toolbar.Button({
              text: 'Search:'
              ,tooltip: 'Clear search box'
              ,handler: function() {
                Ext.get('kw').dom.value = '';
                Ext.get('kw').focus();
              }
            });

            toolbar.addButton(buttonCls);

      var kw= new Ext.form.TextField({
        name: 'kw'
        ,id: 'kw'
        ,enableKeyEvents: true
        ,listeners: {
          specialkey: function(field, el){
            if (el.getKey() == Ext.EventObject.ENTER)
              doSearch();
          }
        }
      });

      toolbar.addField(kw);

      var buttonSearch = new Ext.Toolbar.Button({
        iconCls: 'search'
        ,tooltip: 'Search for info'
        ,disabled: false
        ,handler: doSearch
      });
      toolbar.add(buttonSearch);
        
      var buttonLogout = new Ext.Toolbar.Button({
        text: 'Logout'
        ,tooltip: 'Logout from application'
        ,disabled: false
        ,listeners:{
          click: {
            fn: function(node, e){
              var con = new Ext.data.Connection();
              con.request({
                url: '/map/logout'
                ,method: 'POST'
                ,success: function(resp,opt) {
                  href = '/user';
                  window.location.href=href;
                } //eo success
              }); //eo request
            } //eo fn
            ,stopEvent: true
          } //eo click
        } //eo listeners
      });

      addSeparator();
      toolbar.add(buttonLogout);
    }
        
    // public space:
    return {
      // for debug, we make this property public:
      vector: null
            
      ,setStatus: function(text) {
        Ext.getCmp('statusBar').body.dom.innerHTML = text;
      }
            
      ,init: function() {
        createMap();

	    createTileAmphoeLayer();

	    createTileTambonLayer();

	    createTileRoadLayer();

        createEducationLayer();

        createHealthLayer();

        createReligionLayer();

        createBankLayer();

        createTree();

        this.vector = createVectorLayer();
        // vector layer is now accessible via toolbarExample.app.vector

        createHiliteLayer();

        createResourceLayer();

        createHotspotShadow();
        createHotspotLayer();

        createSearchResultGrid();
                
        addMapControls();
        createToolbar();

		createSaveGeomControl();
        createSaveLineControl();

        createSelectControl();
        createSelectPopup();
        createViewport();

        //map.setCenter(new OpenLayers.LonLat(<%= @ampcenter %>), 10);
        map.zoomToMaxExtent();
        
        setToolbarContent();
        toolbar.activate();
                
        //Hide searchResultGrid
        Ext.get('search-result-grid').enableDisplayMode().hide();

        //Expand accordion acc-2 Tambon Code to highlight on select
        Ext.getCmp('acc-2').expand();

        //Display some text in the status bar:
        this.setStatus('Status: Map application ready');
      }
    };
  }(); // end of app
    
    Ext.onReady(toolbarExample.app.init, toolbarExample.app);
