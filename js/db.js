    var lk = {};
    lk.webdb = {};
    lk.webdb.db = null;

    lk.webdb.open = function() {
        //chrome.extension.getBackgroundPage().console.log("open");
        var dbSize = 10 * 1024 * 1024; // 10MB
        lk.webdb.db = openDatabase("Pages1", "1.0", "Pages list", dbSize);
    }

    lk.webdb.createTable = function() {
        var db = lk.webdb.db;
        db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS items(ID INTEGER PRIMARY KEY ASC, setid INTEGER , day DATETIME , engine TEXT, query TEXT , url TEXT , position INTEGER )", []);
            tx.executeSql("CREATE UNIQUE INDEX idx1 ON items (setid , day, engine, query, url )", []);
        });
    }

    lk.webdb.onError = function(tx, e) {
        chrome.extension.getBackgroundPage().console.log("There has been an error: " + e.message);
        //chrome.extension.getBackgroundPage().console.log(tx);
    }

    lk.webdb.onSuccess = function(tx, r) {
        // ?
        console.log("success");
    }

    lk.webdb.addItem = function(engine, query, url, position) {
        var db = lk.webdb.db;
        db.transaction(function(tx) {
            var day = new Date();
            //var d = day.getFullYear() + "-" + pad((day.getMonth()+1),2) + "-" + pad(day.getDate(),2);
            var d = isoDate(day);
            tx.executeSql("INSERT or REPLACE INTO items(setid,day,engine,query,url,position) VALUES (?,?,?,?,?,?)", [1, d, engine, query, url, position],
                function() {
                    //lk.webdb.getAllItemsList();
                },
                lk.webdb.onError);
        });
    }

    lk.webdb.getAllItemsList = function(callback) {
        var db = lk.webdb.db;
        db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM items ORDER BY engine,ID DESC LIMIT 500", [], callback, lk.webdb.onError);
        });
    }

    lk.webdb.deleteItem = function(id, q, s, callback) {
        var db = lk.webdb.db;
        db.transaction(function(tx) {
            tx.executeSql("DELETE FROM items WHERE ID=?", [id],
                function() {
                    //lk.webdb.getAllItemsList(callback);
                    lk.webdb.getItemsList(q, s, callback);
                },
                lk.webdb.onError);
        });
    }

    function initdb(callback) {
        lk.webdb.open();
        lk.webdb.createTable();
    }

    lk.webdb.listQueries = function(query, callback) {
        var db = lk.webdb.db;
        var q;
        db.transaction(function(tx) {
            if (query == "")
                q = "SELECT query, count(query) as tot FROM items GROUP BY query ORDER BY query";
            else
                q = "SELECT query, count(query) as tot FROM items WHERE query LIKE '" + query + "' GROUP BY query ORDER BY query"
            tx.executeSql(q, [], callback, lk.webdb.onError);
        });
    }

    lk.webdb.getItemsList = function(query, site, callback, nolimit) {
        var db = lk.webdb.db;
        var q;
        var where = "";
        db.transaction(function(tx) {
            if (query != "") where += " AND query LIKE '" + query + "'";
            if (site != "") where += " AND url LIKE '" + site + "'";
            q = "SELECT * FROM items WHERE 1=1 " + where + " ORDER BY engine,ID DESC";
            if (nolimit != true) q += " LIMIT 500";
            //chrome.extension.getBackgroundPage().console.log(q);
            tx.executeSql(q, [], callback, lk.webdb.onError);
        });
    }

    lk.webdb.getGrid = function(w, callback) {
        var db = lk.webdb.db;
        var q;
        var where = "";
        db.transaction(function(tx) {
            if (w != "") where += " " + w;
            q = "SELECT day,query,url,position FROM items WHERE 1=1 " + where + " ORDER BY ID";
            //chrome.extension.getBackgroundPage().console.log(q);
            tx.executeSql(q, [], callback, lk.webdb.onError);
        });
    }

    lk.webdb.query = function(q, callback) {
        var db = lk.webdb.db;
        db.transaction(function(tx) {
            tx.executeSql(q, [], callback, lk.webdb.onError);
        });
    }
