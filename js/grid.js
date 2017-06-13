function process(evt) {
    var time = $("#time").val();
    var rank = $("#rank").val();

    if (evt == 0) {
        filter_pageslist(time, rank);
    }
}

function filter_pageslist(time, rank) {
    var q = "";
    if (time == "today") {
        var date = new Date();
        q += "AND DAY ='" + isoDate(date) + "'";
    }
    if (rank == "1-10") {
        q += "AND position <= 10";
    }
    chrome.extension.getBackgroundPage().console.log(q);

    chrome.extension.getBackgroundPage().lk.webdb.getGrid(q, loadItemsList);
}

var grid = {};
var sites = {};

function loadItemsList(tx, rs) {
    grid = {};
    sites = {};

    $("#div_grid").html("<p>please wait ...</p>");

    if (rs.rows.length > 0) {
        for (var i = 0; i < rs.rows.length; i++) {
            row = rs.rows.item(i);
            if (!grid[row.query]) grid[row.query] = {};
            grid[row.query][row.url] = row.position;
            sites[row.url] = true;
        }
    } else {
        //console.log("Please search some keywords");
    }

    function sortObject(o) {
        var sorted = {},
            key, a = [];
        for (key in o) {
            if (o.hasOwnProperty(key)) {
                a.push(key);
            }
        }
        a.sort();
        for (key = 0; key < a.length; key++) {
            sorted[a[key]] = o[a[key]];
        }
        return sorted;
    }

    sites = sortObject(sites);

    out = "<table id='grid' cellpadding=0 cellspacing=0><tr><td class='corner'>&nbsp;</td>";

    for (var s in sites) {
        out += "<th>" + s + "</th>";
    }
    out += "</tr>";

    for (var v in grid) { // query
        out += "<tr><th>" + v + "</th>";
        for (var s in sites) { // sites
            found = false;
            for (var c in grid[v]) { // results
                if (s == c) {
                    found = true;
                    out += "<td>" + grid[v][c] + "</td>";
                }
            }
            if (!found) out += "<td>&nbsp;</td>";
        }
        out += "</tr>";
    }

    out += "</table>";

    $("#div_grid").html(out);

    $("#grid td").each(function() {
        var v = $(this).html();
        if (v < 11)
            $(this).addClass("good");
        else if (v < 51)
            $(this).addClass("fair");
        else if (v < 101)
            $(this).addClass("bad");
    });


}

function init() {
    
    $('#grid_process').click( function () { process(0); });

}

$( document ).ready( init );