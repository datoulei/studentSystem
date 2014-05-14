chrome.app.runtime.onLaunched.addListener(function() {
    console.log('launched');
    chrome.app.window.create('index.html',{
        id: 'mainWindow',
        minWidth: 800,
        minHeight: 600,
        state: 'fullscreen'
    });
});

chrome.app.runtime.onRestarted.addListener(function(){
    console.log('restarted');
//    chrome.storage.local.clear();
});

var Alert = (function(){
    var option = {
        type: "basic",
        title: "主要标题",
        message: "要显示的主要消息",
        iconUrl: "images/chat.png"
    };
    function show(id,title,msg) {
        id = (id != null) ? id : '';
        option.title = (title != null) ? title : option.title;
        option.message = (msg != null) ? msg : option.message;
        chrome.notifications.create(id,option,function(){
            console.log('ok');
        });
    }
    return{
        show: show
    }
})();