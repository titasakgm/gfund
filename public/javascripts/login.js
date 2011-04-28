Ext.onReady(function(){
  Ext.QuickTips.init();
  var win;

  Ext.form.VTypes['userVal'] = /[0-9][0-9][0-9][0-9]/;
  Ext.form.VTypes['userMask'] = /[0-9]/;
  Ext.form.VTypes['userText'] = 'Username ต้องเป็นตัวเลข 4 หลัก รหัสจังหวัด 2 หลัก รหัสอำเภอ 2 หลัก';
  Ext.form.VTypes['user'] = function(v){
    return Ext.form.VTypes['userVal'].test(v);
  }

  var login = new Ext.FormPanel({
    labelWidth: 80
    ,url: '/gfund/map/login'
    ,frame:true
    ,title:'GFUND LOGIN'
    ,defaultType: 'textfield'
    ,items:[{
      fieldLabel: 'Username'
      ,name: 'user'
      ,allowBlank: false
      ,vtype: 'user'
    },{
      fieldLabel: 'Password'
      ,name: 'pass'
      ,inputType: 'password'
      ,allowBlank: false
      ,enableKeyEvents: true
      ,listeners: {
        specialkey: function(field, el){
          if (el.getKey() == Ext.EventObject.ENTER)
            Ext.getCmp('loginButton').fireEvent('click');
        }
      }
    }]
    ,buttonAlign: 'center'
    ,buttons:[{
      text:'Login'
      ,id: 'loginButton'
      ,formBind: true
      ,listeners: {
        click: function(){
          login.getForm().submit({
            method: 'POST'
            ,waitTitle: 'Connecting'
            ,waitMsg: 'Sending data...'
            ,success: function(form, action){
              json = Ext.util.JSON.decode(action.response.responseText);
              var amphoe = json.user;
              var url = "/gfund/map/show/" + amphoe;
              if (json.user == 'admin')
                url = "/gfund/admin/"
              if (amphoe == 'Invalid')
              {
                Ext.Msg.alert('Warning', json.msg);
                return false;
              }
              win.hide();
              window.location = url;
            } //eo success
            ,failure: function(form, action){
              json = Ext.util.JSON.decode(action.response.responseText);
              Ext.Msg.alert('Login Failed!', json.msg);
              login.getForm().reset();
            } //eo failure
          }); //eo submit
        } //eo click
      } //eo listeners
    },{ 
      text:'Update Profile'
      ,id: 'profileButton'
      ,formBind: false
      ,listeners: {
        click: function(){
          window.location="/gfund/user/profile/";
        } //eo click
      } //eo listeners
    }]
  });
  win = new Ext.Window({
    layout: 'fit'
    ,width: 300
    ,height: 150
    ,closable: false
    ,resizable: false
    ,plain: true
    ,border: false
    ,items: [ login ]
  });
  win.show();
});

