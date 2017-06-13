 var ver = "0.15.2";

 chrome.contextMenus.create({title:"Search in SEO SERP: '%s'",contexts: ["selection"], "onclick": onSEORequest});

 if (localStorage["installed"] == null) {
     localStorage["installed"] = ver;
     // installed
 }
 if (localStorage["installed"] != ver) {
     // updated
 }

 function pad(str, len, pad) {
     str = String(str);
     if (typeof(len) == "undefined") {
         var len = 0;
     }
     if (typeof(pad) == "undefined") {
         var pad = '0';
     }
     if (len + 1 >= str.length) str = Array(len + 1 - str.length).join(pad) + str;
     return str;
 }

 function isoDate(d) {
     return d.getFullYear() + "-" + pad((d.getMonth() + 1), 2) + "-" + pad(d.getDate(), 2);
 }

//copy selected text as default keywords request
function onSEORequest(info, tab) {
     $("#query").val(info.selectionText);
     chrome.extension.getURL("popup.html");
    chrome.extension.getBackgroundPage().myURL;
     chrome.tabs.query({
        active: true,
        currentWindow: true
        }, function(tabs) {
            var tab = tabs[0];
            var url = tab.url;
    });
};