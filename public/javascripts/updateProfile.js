Ext.BLANK_IMAGE_URL = '/gfund/javascripts/mfbase/ext/resources/images/default/s.gif';
Ext.onReady(function(){
  Ext.QuickTips.init();
  var win;
  var profile = new Ext.FormPanel({
    labelWidth: 100
    ,url: '/user/update'
    ,frame:true
    ,title:'Change User Profile'
    ,defaultType: 'textfield'
    ,anchor: '90%'
    ,items:[{
      fieldLabel: 'Username'
      ,name: 'user'
      ,allowBlank: false
    },{
      fieldLabel: 'Old Password'
      ,name: 'oldpass'
      ,inputType: 'password'
      ,allowBlank: false
    },{
      fieldLabel: 'New Password'
      ,name: 'newpass'
      ,allowBlank: false
    },{
      fieldLabel: 'First Name'
      ,name: 'firstname'
      ,allowBlank: false
    },{
      fieldLabel: 'Last Name'
      ,name: 'lastname'
      ,allowBlank: false
    },{
      fieldLabel: 'Telephone'
      ,name: 'telno'
      ,allowBlank: false
    }]
    ,buttonAlign: 'center'
    ,buttons:[{
      text: 'Update'
      ,id: 'updateButton'
      ,formBind: true
      ,listeners: {
        click: function(){
          profile.getForm().submit({
            method: 'POST'
            ,waitTitle: 'Connecting'
            ,waitMsg: 'Sending data...'
            ,success: function(form, action){
              win.hide();
              json= Ext.util.JSON.decode(action.response.responseText);
              Ext.Msg.alert('Response', json.msg);
              window.location="/user";
            } //eo success
            ,failure: function(form, action){
              json = Ext.util.JSON.decode(action.response.responseText);
              Ext.Msg.alert('Response', json.msg);
              profile.getForm().reset();
            } //eo failure
          }); //eo submit
        } //eo click
      } //eo listeners
    },{
      text: 'Login'
      ,id: 'loginButton'
      ,formBind: false
      ,listeners: {
        click: function(){
          window.location="/user";
        }
      }
    }]
  });

  win = new Ext.Window({
    layout: 'fit'
    ,width: 300
    ,height: 250
    ,closable: false
    ,resizable: true
    ,plain: true
    ,border: false
    ,items: [ profile ]
  });
  win.show();
});

