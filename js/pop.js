var bg = chrome.extension.getBackgroundPage();

function init() {

    $("#query").focus();

    lastkeyword = chrome.extension.getBackgroundPage().localStorage.getItem("lastkeyword");
    lastsite = chrome.extension.getBackgroundPage().localStorage.getItem("lastsite");
    searchengine = chrome.extension.getBackgroundPage().localStorage.getItem("searchengine");

    if (lastkeyword == undefined || lastsite == undefined) {
        $("#query").val("lcd");
        $("#site").val("sony,sharp,lg,amazon,wikipedia,bestbuy,engadget,facebook");
    } else {
        if (lastkeyword != undefined) $("#query").val(lastkeyword);
        if (lastsite != undefined) $("#site").val(lastsite);
    }

    if (searchengine != undefined) $("#se option[value='" + searchengine + "']").attr("selected", "selected");

    $("#info").click(function() {
        chrome.tabs.create({
            url: "http://www.wpsearchconsole.com/seo-serp-instant-rank-checker/"
        });
    });

    $("#export_csv b:eq(0)").click(function() {
        var q = $("#keywordfilter_pageslist").val();
        if (q != "") q = "%" + q + "%";
        var s = $("#sitefilter_pageslist").val();
        if (s != "") s = "%" + s + "%";

        $("#copyExport ").show();
        $("#export_csv").html("loading...");
        chrome.extension.getBackgroundPage().lk.webdb.getItemsList(q, s, loadItemsExport, true);

        //var txt="";
        //txt="test";
        //BuiltBlob = new BlobBuilder("");
        //BuiltBlob.append( txt );
        //BlobToSave = BuiltBlob.getBlob();
        //chrome.tabs.create({'url': createObjectURL(BlobToSave), 'selected': false});
    });

    $("#close").click(function() {
        window.close();
    });

    $("#show_tips").click(function() {

        $(".panel").slideUp("normal");
        $("#tips_panel").stop().slideDown("normal");

        $(".bar span").removeClass("on");
        $("#show_tips").addClass("on");

    });

    $("#new_search").click(function() {

        $(".panel").slideUp("normal");
        $("#search_panel").stop().slideDown("normal");

        $(".bar span").removeClass("on");
        $("#new_search").addClass("on");

    });

    $("#list_queries").click(function() {

        $(".panel").slideUp("normal");

        $(".bar span").removeClass("on");
        $("#list_queries").addClass("on");
        filter_queries();
    });

    $("#list_results").click(function() {

        $(".panel").slideUp("normal");

        $(".bar span").removeClass("on");
        $("#list_results").addClass("on");
        filter_pageslist();
    });

    //

    addHandlers();

}

function addHandlers() {

    $('#search_panel #query').keypress( process );
    $('#search_panel #site').keypress( process );
    $('#search_panel #popup_process').click( function () { process(0); } );

    $('#stats_panel #keywordfilter_pageslist').keyup( filter_pageslist );
    $('#stats_panel #sitefilter_pageslist').keyup( filter_pageslist );

    $('#queries_panel #filter_queries').keyup( filter_queries );

}

// ???
function queryDetails(query) {

    chrome.extension.getBackgroundPage().lk.webdb.getItemsList(query, "", loadItemsList);

}

function setSearch(query) {

    $(".panel").slideUp("normal");
    $("#search_panel").stop().slideDown("normal");

    $(".bar span").removeClass("on");
    $("#new_search").addClass("on");

    $("#query").val(query);
    $("#resultDiv").html("");

}

function showQueries(tx, rs) {

    var queriesList = document.getElementById("queriesList");

    if ( rs.rows.length > 0 ) {

        var rowOutput = "<table class='list'>";
        rowOutput += "<tr><th></th><th>queries</th><th>results</th></tr>";
        var pagesList = document.getElementById("pagesList");

        for ( var i = 0; i < rs.rows.length; i ++ ) {

            rowOutput += "<tr><td><img src='gfx/mini_search14.png' title='search' class='icon' query=\"" + rs.rows.item(i).query + "\"></td><td><span>" + rs.rows.item(i).query + "</span></td><td><span>" + rs.rows.item(i).tot + "</span></td></tr>";

        }

        rowOutput += "</table>";

    } else {

        rowOutput = "<br><br>Please search some keywords, then return here.<br><br><br>";

    }

    queriesList.innerHTML = rowOutput;
    $('.list .icon').click( function () {
        setSearch( $( this ).attr('query') );
    });
    $("#queries_panel").stop().slideDown("normal");

}

function loadItemsList(tx, rs) {

    var pagesList = document.getElementById("pagesList");

    if (rs.rows.length > 0) {

        var engine = "";
        var rowOutput = "<table class='list'>";

        for (var i = 0; i < rs.rows.length; i++) {
            if (engine != rs.rows.item(i).engine) {
                engine = rs.rows.item(i).engine;
                rowOutput += "<tr><th colspan=6>" + engine + "</th></tr>";
                rowOutput += "<tr><th></th><th>query</th><th>site</th><th>position</th><th>date</th><th></th></tr>";
            }
            rowOutput += renderItems(rs.rows.item(i));
        }
        rowOutput += "</table>";

    } else {

        rowOutput = "<br><br>Please search some keywords, then return here.<br><br><br>";

    }

    pagesList.innerHTML = rowOutput;
    $('.list .icon').click( function () {
        setSearch( $( this ).attr('query') );
    });
    $('.list .delete').click( function () {
        deleteItem( $( this ).attr('rowid'), loadItemsList );
    });
    $("#stats_panel").stop().slideDown("normal");

}

function renderItems(row) {

    //var date = new Date( Date.parse( row.day ) );
    //return "<tr><td><img src='gfx/mini_search14.png' title='search' class='icon' onclick=\"setSearch('" + row.query +"');\"></td><td>" + row.query  + "</td><td>" + row.url + "</td><td>" + row.position +  "</td><td class='date'>" + date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + "<td><span class='active' title='delete entry' onclick='deleteItem(" + row.ID +",loadItemsList);'>X</span></td></tr>";
    return "<tr><td><img src='gfx/mini_search14.png' title='search' class='icon' query=\"" + row.query + "\"></td><td>" + row.query + "</td><td>" + row.url + "</td><td>" + row.position + "</td><td class='date'>" + row.day + "<td><span class='delete active' title='delete entry' rowid='" + row.ID + "'>X</span></td></tr>";

}

function loadItemsExport(tx, rs) {

    if (rs.rows.length > 0) {

        var engine = "";
        var rowOutput = "";

        for (var i = 0; i < rs.rows.length; i++) {
            if (engine != rs.rows.item(i).engine) {
                engine = rs.rows.item(i).engine;
                rowOutput += engine + "\n" + bg.localStorage.getItem("lastsite") + "\n\n";
            }
            rowOutput += renderItemsExport(rs.rows.item(i));
        }

    } else {

        rowOutput = "No data";

    }

    $("#copyExport textarea").html(rowOutput).show().focus().select();

    document.execCommand("Copy");
    $("#export_csv").html("<b>The data was copied to your clipboard</b>.<br><br>You can try to open a text editor and paste it there, then save the new file for example as <b>data.csv</b> and import it in Excel or Google Docs to have a spread sheet to work on.<br>The next SEO SERP version will let you import this data too, so you can share it with another pc or with other people.");

    //CopiedTxt = document.selection.createRange();
    //CopiedTxt.execCommand("Copy");

    //bg.console.log(rowOutput);

}

function renderItemsExport(row) {

    var date = new Date(Date.parse(row.day));
    return row.query + "," + row.url + "," + row.position + "," + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "\n";

}

function deleteItem(id, callback) {

    var q = $("#keywordfilter_pageslist").val();
    if (q != "") q = "%" + q + "%";
    var s = $("#sitefilter_pageslist").val();
    if (s != "") s = "%" + s + "%";
    chrome.extension.getBackgroundPage().lk.webdb.deleteItem(id, q, s, callback);

}

function doSearch(query, site, se) {

    if (chrome.extension.getBackgroundPage().getSearchResults) {

        $("#resultDiv").html("processing...");
        chrome.extension.getBackgroundPage().getSearchResults(query, site, se,
            function(html) {
                $("#resultDiv").html(html);
            });

    }

}

function process(evt) {

    var q = $("#query").val();
    var s = $("#site").val();
    var se = $("#se").val();

    if (evt.keyCode == 13 || evt == 0) {
        if (q != "" && s != "") {
            doSearch(q, s, se);
        } else {
            $("#resultDiv").html("empty values");
        }
    }

}

function filter_pageslist(evt) {

    var q = $("#keywordfilter_pageslist").val();
    if (q != "") q = "%" + q + "%";
    var s = $("#sitefilter_pageslist").val();
    if (s != "") s = "%" + s + "%";
    chrome.extension.getBackgroundPage().lk.webdb.getItemsList(q, s, loadItemsList);

}

function filter_queries(evt) {

    var q = $("#filter_queries").val();
    if (q != "") q = "%" + q + "%";
    chrome.extension.getBackgroundPage().lk.webdb.listQueries(q, showQueries);

}

$( document ).ready( init );
