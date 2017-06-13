var responseDiv;

function getSearchResults(query, site, se, callback) {

    siteurl = site;
    var req = false;
    if (window.XMLHttpRequest) {
        req = new XMLHttpRequest();
    } else {
        return;
    }

    sites = siteurl.split(",");
    for ( var i = 0; i < sites.length; i++ ) {
        sites[i] = sites[i].trim();
    }
    done = new Array();

    req.onreadystatechange = function() {

        if (req.readyState == 4) {

            if (req.status == 200) {

                insertResultsInPage(req.responseText);
                var result = getSERP(query, se);

                localStorage.setItem("lastkeyword", query);
                localStorage.setItem("lastsite", site);
                localStorage.setItem("searchengine", se);

            } else {

                out = "<p>ERROR - Bad response (" + req.status + ")</p>";

            }

            callback( out );

        }

    };

    req.open('GET', 'https://' + se + '/search?q=' + query + '&num=100&as_qdr=all&safe=off&pws=0', true);
    req.send(null);

}

var temporaryContainer = document.createElement('div');

function insertResultsInPage(response) {

    temporaryContainer.innerHTML = response;
    var scripts = temporaryContainer.getElementsByTagName('script');
    var i = scripts.length;
    while (i--) {
        scripts[i].parentNode.removeChild(scripts[i]);
    }

    response = temporaryContainer.innerHTML;
    temporaryContainer.innerHTML = '';

    response = response.replace(/onclick=/gi, 'on-click');
    response = response.replace(/onmousemove=/gi, 'on-mousemove');
    response = response.replace(/onmousedown=/gi, 'on-mousedown');
    response = response.replace(/onmouseup=/gi, 'on-mouseup');
    response = response.replace(/onkeypress=/gi, 'on-keypress');
    response = response.replace(/onkeydown=/gi, 'on-keydown');
    response = response.replace(/onkeyup=/gi, 'on-keyup');
    response = response.replace(/onerror=/gi, 'on-error');
    response = response.replace(/onload=/gi, 'on-load');

    response = '<div>' + response + '</div>';
    responseDiv = $( response );

}

function getDomain(url) {

    if ( url.indexOf('https://') === 0 ) {

        url = url.replace(/https:\/\//, "");

    } else {

        url = url.replace(/http:\/\//, "");

    }

    return url.split("/")[0];
}

function getSERP(query, se) {

    r = responseDiv.find("li[id=''].g h3");
    r = responseDiv.find("div.g h3");

    out = "<b>SERP rankings</b> for keyword <b><a href='http://" + se + "/search?q=" + query + "&num=100&as_qdr=all&safe=off' target='_blank' title='view result page'>" + query + "</a></b></br>";
    out += "<table cellspacing=0 cellpadding=0 id='r'>";

    ct = 1;
    found = 0;
    nomatchlist = "";

    r.each(function() {

        url = $(this).children("a:eq(0)").attr("href");
        if ( url.indexOf('/url?q=') === 0 ) url = url.replace( '/url?q=', '' );

        if ( url != undefined && ( url.indexOf("http://") == 0 || url.indexOf("https://") == 0 ) ) {

            matched = false;

            for (var i in sites) {

                if (sites[i] != "") {

                    if (url.indexOf(sites[i]) != -1 && done[i] == undefined) {

                        urlico = getDomain(url);
                        out += "<tr><td class='n'># " + ct + "</td><td class='s'><img src='http://www.google.com/s2/favicons?domain=" + urlico + "' class='urlico' ><a href='" + url + "' target='_blank' title='" + url + "'>" + urlico + "</a></td></tr>";
                        done[i] = ct;
                        found ++;
                        matched = true;

                        lk.webdb.addItem(se, query, urlico, ct);

                        break;

                    }

                    if (url.indexOf(sites[i]) != -1) {

                        matched = true;

                    }

                }

            }

            if (!matched && ct <= 10) {

                urlico = getDomain(url);
                nomatchlist += "<tr><td class='n'># " + ct + " </td><td class='s'><img src='http://www.google.com/s2/favicons?domain=" + urlico + "' class='urlico' ><a href='" + url + "' target='_blank' title='" + url + "'>" + urlico + "</a></td></tr>";

            }

            ct ++;

        }

    });

    out += "</table>";

    out2 = "";
    for (var i in sites) {
        if (sites[i] != "") {
            if (done[i] == undefined) {
                out2 += sites[i] + (i < sites.length - 1 ? " , " : "");
            }
        }
    }

    if (out2 != "") out += "<br/><b>Not found</b> : " + out2;

    if (nomatchlist != "") out += "<br/><br/><b>Unmatched top results</b> : <small>(consider adding them to your websites list)</small><br/><table cellspacing=0 cellpadding=0 id='r'>" + nomatchlist + "</table>";

    out += "<br/><b>Adwords</b><br/>";
    r_ads = responseDiv.find(".ads-ad");
    if (r_ads.length == 0) {
        out += "none";
    } else {
        out += r_ads.length + " right side ads found. ";

        out3 = "";

        r_ads.each(function() {

            url = $(this).children("h3:eq(0)").children("a:eq(1)").attr("href");
            //TODO
            urlp = url.split("http://");
//            console.log(urlp[0]);
//            urlp = urlp[1].split("/");

            try {
                if ( urlp[1] === undefined ) {
                    urlp = urlp[0].split("/");
                } else {
                    urlp = urlp[1].split("/");
                }
            } catch (err) {
                $("#resultDiv").html("Sorry! There are no available values!");
            }

            if (url != undefined) {
                for (var i in sites) {
                    if (sites[i] != "") {
                        if (urlp[0].indexOf(sites[i]) != -1) {
                            out3 += "&bull; " + sites[i] + "<br/>";
                        }
                    }
                }
            }

        });

        if (out3 != "") {
            out += "Matching site(s):<br/>" + out3;
        } else {
            out += "No match.";
        }

    }


    return null;
}

function init() {
    initdb(null);
    // add contextMenu

    // cleanup old format dates

    lk.webdb.query("select ID,day from items where length(day) > 10", cleanup);

    function cleanup(tx, rs) {
        if (rs.rows.length > 0) {
            for (var i = 0; i < rs.rows.length; i++) {
                row = rs.rows.item(i);
               //console.log(row.ID + "," + row.day);
                var date = new Date(Date.parse(row.day));
                lk.webdb.query("update items set day='" + date.getFullYear() + "-" + pad((date.getMonth() + 1), 2) + "-" + pad(date.getDate(), 2) + "' where id=" + row.ID, null);
            }
        } else {
            //consoleconsole.log("empty");
        }
    }

}

var out;
var siteurl;
var sites;
var done;
window.addEventListener('load', init());
