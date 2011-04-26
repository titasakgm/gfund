Ext.onReady(function() {
  Ext.BLANK_IMAGE_URL = '/gfund/javascripts/mfbase/ext/resources/images/default/s.gif';

  var hotspotgrid;
  var problemgrid;
  var ladmingrid;

  var chartURL = '';
  var cur_laname = '';

  function logout()
  {
    window.location.href = '/gfund/user';
  }

  function ladminSearch()
  {
    var filter = Ext.get('kw').getValue();
    ladminStore.baseParams.filter = filter;
    ladmingrid.getStore().load({params: {start: 0, limit: 15}});
  }

  function showChart()
  {
    var chart = Ext.getCmp('id-chart');
    if (cur_laname)
    {
      var a1 = Math.floor(Math.random()*6);
      var a2 = Math.floor(Math.random()*6);
      var a3 = Math.floor(Math.random()*6);
      var b1 = Math.floor(Math.random()*6);
      var b2 = Math.floor(Math.random()*6);
      var b3 = Math.floor(Math.random()*6);
      var progress = a1 + ',' + a2 + ',' + a3;
      var resource = b1 + ',' + b2 + ',' + b3;

      chartURL = "<center>" + cur_laname + '<hr size=2/>';
      chartURL += "<img src='http://chart.apis.google.com/chart?cht=bvs";
      chartURL += "&chs=150x150&chco=4D89F9&chds=0,5&chxt=x,y&chbh=a";
      chartURL += "&chxl=0:|I|II|III|1:|0|1|2|3|4|5&chtt=Progress";
      chartURL += "&chd=t:" + progress;
      chartURL += "' /><hr/>";
      chartURL += "<img src='http://chart.apis.google.com/chart?cht=bvs";
      chartURL += "&chs=150x150&chco=C6D9FD&chds=0,5&chxt=x,y&chbh=a";
      chartURL += "&chxl=0:|I|II|III|1:|0|1|2|3|4|5&chtt=Resource";
      chartURL += "&chd=t:" + resource;
      chartURL += "' />";
      chartURL += "</center>";
      chartURL += "<br>I  Item 1<br>II Item 2<br>III Item 3";
      Ext.get('id-chart').dom.innerHTML = chartURL;
      chart.expand();
    }
    else
      chart.collapse();
  }

  var admMenuStore = new Ext.data.SimpleStore({
    fields: ['id','menu']
    ,data: [
      ['1','Manage Hotspot']
      ,['2','Manage พฤติกรรมเสี่ยง']
      ,['3','Manage รหัสอปท.']
    ]
  });

  var adminmenugrid = new Ext.grid.GridPanel({
    autoWidth: true
    ,height: 400
    ,frame: true
    ,store: admMenuStore
    ,columns: [{ 
      id: 'id'
      ,width: 30
      ,dataIndex: 'id'
    },{
      id: 'menu'
      ,dataIndex: 'menu'
    }]
    ,autoExpandColumn: 'menu'
    ,enableHdMenu: false
    ,sm: new Ext.grid.RowSelectionModel({
      singleSelect: true
      ,listeners: {
        rowselect: {
          fn: function(sm, index, record){
            var chart = Ext.getCmp('id-chart');
            var menu_id = record.data.id;
            if (menu_id == '1')
            {
              hotspotgrid.show();
              problemgrid.hide();
              ladmingrid.hide();
              chart.collapse();
              cur_laname = '';
            }
            else if (menu_id == '2')
            {
              hotspotgrid.hide();
              problemgrid.show();
              ladmingrid.hide();
              chart.collapse();
              cur_laname = '';
            }
             else
            {
              hotspotgrid.hide();
              problemgrid.hide();
              ladmingrid.show();
              if (cur_laname)
                chart.expand();
            }
          }  //eo fn
        } //eo rowselect
      } //eo listeners
    }) //eo sm
  });

  var hotcode_edit = new Ext.form.TextField();
  var hotdesc_edit = new Ext.form.TextField();

  var ds_model_hotspot = new Ext.data.Record.create([
    'id'
    ,'hot_code'
    ,'hot_desc'
  ]); //eo ds_model_hotspot

  hotspotStore = new Ext.data.Store({
    url: '/gfund/map/get_hotspot'
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
  hotspotStore.load({params:{start:0, limit: 15} });

  var hotspotgrid = new Ext.grid.EditorGridPanel({
    frame: false
    ,id: 'id-hotspotgrid'
    ,autoWidth: true
    ,autoHeight: true
    ,autoScroll: true
    ,store: hotspotStore
    ,columns: [
      {id: 'hot_code', header: 'Code', dataIndex: 'hotcode', width: 20, editor: hotcode_edit}
      ,{id: 'hot_desc', header: 'Name', dataIndex: 'hotdesc', width: 300, editor: hotdesc_edit}
    ]
    ,sm: new Ext.grid.RowSelectionModel({
      singleSelect: true
    })
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
          url: '/gfund/map/update_hotspot'
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
    ,tbar: [{
      xtype: 'button'
      ,id: 'btn-add'
      ,text: 'Add'
      ,icon: '/images/table_add.png'
      ,cls: 'x-btn-text-icon'
      ,handler: function() {
        var con = new Ext.data.Connection();
        con.request({
          url: '/gfund/map/insert_hotspot'
          ,success: function(resp, opt) {
            var insert_id = Ext.util.JSON.decode(resp.responseText).insert_id;
            hotspotgrid.getStore().insert(
              hotspotgrid.getStore().getCount()
              ,new ds_model_hotspot({
                id: insert_id
                ,hotcode: 'New'
                ,hotdesc: 'New Name'
              })
            );
            hotspotgrid.startEditing(hotspotgrid.getStore().getCount()-1,0);
          }
          ,failure: function(resp, opt) {
            Ext.Msg.show({
              title: 'Server Response'
              ,width: 200
              ,msg: 'Unable to add Hotspots'
              ,icon: Ext.Msg.ALERT
              ,buttons: Ext.Msg.OK
            }); //eo show
          } //eo failure
        }); //eo request
      } //eo handler
    }, '-', {
      xtype: 'button'
      ,id: 'btn-delete'
      ,text: 'Delete'
      ,icon: '/images/table_delete.png'
      ,cls: 'x-btn-text-icon'
      ,handler: function() {
        var sm = hotspotgrid.getSelectionModel();
        var sel = sm.getSelected();
        if (sm.hasSelection()){
          Ext.Msg.show({
            title: 'Remove Hotspot'
            ,buttons: Ext.MessageBox.YESNOCANCEL
            ,msg: 'Remove ' + sel.data.hotdesc + ' (CODE: ' + sel.data.hotcode + ') ?'
            ,fn: function(btn){
              if (btn == 'yes')
              {
                var con = new Ext.data.Connection();
                con.request({
                  url: '/gfund/admin/del_hotspot'
                  ,params: { id: sel.data.id }
                  ,success: function(resp, opt){
                    hotspotgrid.getStore().remove(sel);
                    Ext.Msg.alert('Info', '1 record deleted!');
                  }
                  ,failure: function(resp, opt){
                    Ext.Msg.alert('Server Response', 'Unable to delete Hotspot!');
                  }
                }) //eo con.request
              } //eo if
            } //eo fn
          }); //eo show
        } //eo if   
      } //eo handler
      ,disabled: false
    }, '-', {
      xtype: 'button'
      ,text: 'Help'
      ,icon: '/images/help.png'
      ,cls: 'x-btn-text-icon'
      ,handler: function() {
         Ext.Msg.alert('Help', '1 Double Click ที่ cell เพื่อทำการแก้ไข<p>2 Click เลือกรายการที่ต้องการลบ แล้วกดปุ่ม [Delete] เพื่อลบรายการ');
       }
    }, '->',{
      xtype: 'button'
      ,text: 'Logout'
      ,icon: '/images/cancel.png'
      ,cls: 'x-btn-text-icon'
      ,handler: logout
    }]
    ,bbar: new Ext.PagingToolbar({
        pageSize: 15
        ,store: hotspotStore
        ,displayInfo: true
        ,displayMsg: 'Displaying records {0} - {1} of {2}'
        ,emptyMsg: 'No record to display'
    })
  }); //eo hotspotgrid
  hotspotgrid.hide();

  var probcode_edit = new Ext.form.TextField();
  var probdesc_edit = new Ext.form.TextField();

  var ds_model_problem = new Ext.data.Record.create([
    'id'
    ,'prob_code'
    ,'prob_desc'
  ]); //eo ds_model_problem

  problemStore = new Ext.data.Store({
    url: '/gfund/map/get_problem'
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

  problemStore.load({params:{start:0, limit: 15}});

  problemgrid = new Ext.grid.EditorGridPanel({
    frame: false
    ,id: 'id-problemgrid'
    ,autoWidth: true
    ,autoHeight: true
    ,autoScroll: true
    ,store: problemStore
    ,columns: [
      {id: 'prob_code', header: 'Code', dataIndex: 'probcode', width: 20, editor: probcode_edit}
      ,{id: 'prob_desc', header: 'Name', dataIndex: 'probdesc', width: 300, editor: probdesc_edit}
    ]
    ,sm: new Ext.grid.RowSelectionModel({
      singleSelect: true
    }) //eo sm
    ,autoExpandColumn: 'probdesc'
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
          url: '/gfund/map/update_problem'
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
    ,tbar: [{
      xtype: 'button'
      ,text: 'Add'
      ,icon: '/images/table_add.png'
      ,cls: 'x-btn-text-icon'
       ,handler: function() {
        var con = new Ext.data.Connection();
        con.request({
          url: '/gfund/map/insert_problem'
          ,success: function(resp, opt) {
            var insert_id = Ext.util.JSON.decode(resp.responseText).insert_id;
            problemgrid.getStore().insert(
              problemgrid.getStore().getCount()
              ,new ds_model_problem({
                id: insert_id
                ,prob_code: 'New'
                ,prob_desc: 'New Name'
              })
            );
            problemgrid.startEditing(problemgrid.getStore().getCount()-1,0);
          }
          ,failure: function(resp, opt) {
            Ext.Msg.show({
              title: 'Server Response'
              ,width: 200
              ,msg: 'Unable to add Problem/Risk'
              ,icon: Ext.Msg.ALERT
              ,buttons: Ext.Msg.OK
            }); //eo show
          } //eo failure
        }); //eo request
      } //eo handler
    }, '-', {
      xtype: 'button'
      ,text: 'Delete'
      ,icon: '/images/table_delete.png'
      ,cls: 'x-btn-text-icon'
       ,handler: function() {
        var sm = problemgrid.getSelectionModel();
        var sel = sm.getSelected();
        if (sm.hasSelection()){
          Ext.Msg.show({
            title: 'Remove Problem/Risk'
            ,buttons: Ext.MessageBox.YESNOCANCEL
            ,msg: 'Remove ' + sel.data.probdesc + ' (CODE: ' + sel.data.probcode + ') ?'
            ,fn: function(btn){
              if (btn == 'yes')
              {
                var con = new Ext.data.Connection();
                con.request({
                  url: '/gfund/admin/del_problem'
                  ,params: { id: sel.data.id }
                  ,success: function(resp, opt){
                    problemgrid.getStore().remove(sel);
                    Ext.Msg.alert('Info', '1 record deleted!');
                  }
                  ,failure: function(resp, opt){
                    Ext.Msg.alert('Server Response', 'Unable to delete Problem/Risk!');
                  }
                }) //eo con.request
              } //eo if
            } //eo fn
          }); //eo show
        } //eo if   
      } //eo handler
      ,disabled: false
    }, '-', {
      xtype: 'button'
      ,text: 'Help'
      ,icon: '/images/help.png'
      ,cls: 'x-btn-text-icon'
       ,handler: function() {
         Ext.Msg.alert('Help', '1 Double Click ที่ cell เพื่อทำการแก้ไข<p>2 Click เลือกรายการที่ต้องการลบ แล้วกดปุ่ม [Delete] เพื่อลบรายการ');
       }
    }, '->', {
      xtype: 'button'
      ,text: 'Logout'
      ,icon: '/images/cancel.png'
      ,cls: 'x-btn-text-icon'
      ,handler: logout
    }]
    ,bbar: new Ext.PagingToolbar({
        pageSize: 15
        ,store: problemStore
        ,displayInfo: true
        ,displayMsg: 'Displaying records {0} - {1} of {2}'
        ,emptyMsg: 'No record to display'
    })
  }); //eo problemgrid
  problemgrid.hide();

  var lacode_edit = new Ext.form.TextField();
  var laname_edit = new Ext.form.TextField();
  var filter = '';

  var ds_model_ladmin = new Ext.data.Record.create([
    'id'
    ,'la_code'
    ,'la_name'
  ]); //eo ds_model_ladmin

  ladminStore = new Ext.data.Store({
    url: '/gfund/map/get_ladmin'
    ,baseParams: { filter: filter } 
    ,method: 'POST'
    ,reader: new Ext.data.JsonReader({
      root: 'rows'
      ,totalProperty: 'totalCount'
      ,id: 'id'
    },[
      'id'
      ,'lacode'
      ,'laname'
    ])
  }); //eo ladminStore

  ladminStore.load({params:{start:0, limit: 15} });

  ladmingrid = new Ext.grid.EditorGridPanel({
    frame: false
    ,id: 'id-ladmingrid'
    ,autoWidth: true
    ,autoHeight: true
    ,autoScroll: true
    ,store: ladminStore
    ,columns: [
      {id: 'la_code', header: 'Code', dataIndex: 'lacode', width: 50, editor: lacode_edit}
      ,{id: 'la_name', header: 'Name', dataIndex: 'laname', width: 300, editor: laname_edit}
    ]
    ,sm: new Ext.grid.RowSelectionModel({
      singleSelect: true
      ,listeners: {
        rowselect: {
          fn: function(sm, index, record){
            cur_laname = record.data.laname;
            showChart();
          } //eo fn
        } //eo rowselect
      } //eo listeners
    }) //eo sm
    ,stripeRows: true
    ,autoExpandColumn: 'laname'
    ,viewConfig: {forceFit: true}
    ,clicksToEdit: 2
    ,listeners: {
      afteredit: function(e) {
        var con = new Ext.data.Connection();
        if (e.field == 'lacode')
          e.field = 'la_code';
        else
          e.field = 'la_name';
        con.request({
          url: '/gfund/map/update_ladmin'
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
    ,tbar: [{
      xtype: 'button'
      ,text: 'Add'
      ,icon: '/images/table_add.png'
      ,cls: 'x-btn-text-icon'
       ,handler: function() {
        var con = new Ext.data.Connection();
        con.request({
          url: '/gfund/map/insert_ladmin'
          ,success: function(resp, opt) {
            var insert_id = Ext.util.JSON.decode(resp.responseText).insert_id;
            ladmingrid.getStore().insert(
              0
              ,new ds_model_ladmin({
                id: insert_id
                ,lacode: 'New'
                ,laname: 'New Name'
              })
            );
            ladmingrid.startEditing(0,0);
          }
          ,failure: function(resp, opt) {
            Ext.Msg.show({
              title: 'Server Response'
              ,width: 200
              ,msg: 'Unable to add LA Code/Name'
              ,icon: Ext.Msg.ALERT
              ,buttons: Ext.Msg.OK
            }); //eo show
          } //eo failure
        }); //eo request
      } //eo handler
    }, '-', {
      xtype: 'button'
      ,text: 'Delete'
      ,icon: '/images/table_delete.png'
      ,cls: 'x-btn-text-icon'
       ,handler: function() {
        var sm = ladmingrid.getSelectionModel();
        var sel = sm.getSelected();
        if (sm.hasSelection()){
          Ext.Msg.show({
            title: 'Remove LA Code/Name'
            ,buttons: Ext.MessageBox.YESNOCANCEL
            ,msg: 'Remove ' + sel.data.laname + ' (CODE: ' + sel.data.lacode + ') ?'
            ,fn: function(btn){
              if (btn == 'yes')
              {
                var con = new Ext.data.Connection();
                con.request({
                  url: '/gfund/admin/del_ladmin'
                  ,params: { id: sel.data.id }
                  ,success: function(resp, opt){
                    ladmingrid.getStore().remove(sel);
                    Ext.Msg.alert('Info', '1 record deleted!');
                  }
                  ,failure: function(resp, opt){
                    Ext.Msg.alert('Server Response', 'Unable to delete Problem/Risk!');
                  }
                }) //eo con.request
              } //eo if
            } //eo fn
          }); //eo show
        } //eo if   
      } //eo handler
      ,disabled: false
    }, '-', {
      xtype: 'button'
      ,text: 'Help'
      ,icon: '/images/help.png'
      ,cls: 'x-btn-text-icon'
       ,handler: function() {
         Ext.Msg.alert('Help', '1 Double Click ที่ cell เพื่อทำการแก้ไข<p>2 Click เลือกรายการที่ต้องการลบ แล้วกดปุ่ม [Delete] เพื่อลบรายการ');
       }
    }, '-', {
      text: 'Search'
      ,listeners: {
        click: function(){
          Ext.get('kw').dom.value = '';
          Ext.get('kw').focus();
        }
      }
    }, {
      xtype: 'textfield'
      ,name: 'kw'
      ,id: 'kw'
      ,enableKeyEvents: true
      ,listeners: {
        specialkey: function(field, el){
          if (el.getKey() == Ext.EventObject.ENTER)
            ladminSearch();
        }
      }
    },{
      xtype: 'button'
      ,icon: '/images/find.png'
      ,cls: 'x-btn-icon'
      ,tooltip: 'Search for info'
      ,handler: ladminSearch
    }, '->', {
      xtype: 'button'
      ,text: 'Logout'
      ,icon: '/images/cancel.png'
      ,cls: 'x-btn-text-icon'
      ,handler: logout
    }]
    ,bbar: new Ext.PagingToolbar({
        pageSize: 15
        ,store: ladminStore
        ,displayInfo: true
        ,displayMsg: 'Displaying records {0} - {1} of {2}'
        ,emptyMsg: 'No record to display'
    })
  }); //eo ladmingrid
  ladmingrid.hide();

  var viewport = new Ext.Viewport({
    layout: 'border'
    ,items: [
        new Ext.BoxComponent({
          region: 'north'
          ,el: 'north'
          ,height: 60
          ,margins: '0 5 0 5'
          ,style:'background-image:url(/images/logo.png);background-repeat:no-repeat;border:solid 1px #1D6241;'
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
        ,layout: 'fit'
        ,collapsible: true
        ,items: [ adminmenugrid ]
      },{
        region: 'center'
        ,title: 'Admin Workspace'
        ,layout: 'fit'
        ,frame: false
        ,border: true
        ,margins: '5 5 0 0'
        ,items: [ hotspotgrid, problemgrid, ladmingrid ]
      },{
        region: 'east'
        ,id: 'id-chart'
        ,border: true
        ,width: 160
        ,bodyStyle: 'text-align:center;padding:0;'
        ,layout: 'fit'
        ,margins: '5 5 0 0'
        ,cmargins: '5 5 0 0'
        ,frame: false
        ,collapsible: true
        ,collapsed: true
        ,hideBorders: true
        ,hideCollapseTool: true
        ,floatable: false
        ,split: true
        ,minSize: 5
        ,maxSize: 160
        ,html: chartURL
      },{
        region: 'south'
        ,id: 'statusBar'
        ,border: false
        ,bodyStyle: 'text-align:left;padding:0px;'
        ,height: 25
        ,margins: '5 0 0 0'
        ,frame: true
        ,html: 'a status bar'
      }
    ] //eo item
  });
});

