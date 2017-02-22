 var ver = "0.14.4"
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
