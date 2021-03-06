$(function() {
  function sparam(id) {
    return $('#' + id).attr('value');
  }

  function iparam(id) {
    return parseInt(sparam(id));
  }
  $('#seed').val("For Jamey " + Date.now())
  Math.seedrandom(sparam('seed'));
  $('#seed').change(function() {
    Math.seedrandom(sparam('seed'));
  });

  function resizetime() {
    return 1000;
  }

  function zeroFill(num) {
    if (num < 10) {
      return "00" + num;
    } else if (num < 100) {
      return "0" + num;
    } else {
      return String(num);
    }
  }

  function availableNames() {
    return $('.inplay .name.available');
  }

  function resizeSmoothly(element) {
    var units = "px";
    var winheight = window.innerHeigth * 0.90;
    var was = element.css('font-size');
    var pxsize = Number(was.substr(0, was.length - 2));
    //$('#marker').css('top',winheight);


    element.css('font-size', String(pxsize) + units);

    var min = 10;
    var max = 300;
    while (max - min > 0.001) {
      var totry = (max + min) / 2.0;
      element.css('font-size', String(totry) + units);

      var diff = element.width() - winwidth;
      if (diff == 0) {
        break;
      } else if (diff < 0) {
        min = totry;
      } else {
        max = totry;
      }
    }
    element.css('font-size', was);

    //animate(1,pxsize);
    var size = String((max + min) / 2.0) + units;
    element.animate({
      fontSize: size
    }, resizetime());
    //n.css('font-size',size);
  }

  var count = 300;
  var columns = 10;
  var numbers = new Array;
  var items_per_column;

  function createTickets() {
    if (sparam('count').substring(0, 4) == 'http') {
      $.get(sparam('count'), {}, function(data) {
        var res = CSVToArray(data, ",");

        function empty(a) {
          return a == null || a == "";
        }
        var firstname = 2;
        var lastname = 3;
        var count = 4;
        res = _.reject(res, function(row) {
          return row[firstname] == 'First' || (empty(row[firstname]) && empty(row[lastname]));
        })
        extra = [];
        _.each(res,function(row) {
           if(row[count] > 1) {
             _.times(row[count]-1,function() {
                extra.push(row);
             });
           }
        });
        res = res.concat(extra);
        res = _.sortBy(res,function(n) { return n[lastname]; });
        var names = _.map(res, function(row) {
          return (row[firstname] + " " + row[lastname]).replace('/^ +/', '').replace(/ +$/, '');
        })
        createTicketsFromData(names);
        updateTitles();
      })
      return;
    }

    var first = iparam('firstticket');
    count = iparam('count');
    var data = [];
    for (var i = first; i < count + first; ++i) {
      data.push(zeroFill(i));
    }
    createTicketsFromData(data);
    updateTitles();
  }

  function createTicketsFromData(data) {
    $('#start').attr('disabled', false);
    columns = iparam('columns');
    console.log(data);
    $.get("tickets.html").then(function(t) {
      $('#numbers').html(_.template(t)({
        names: data
      }));
      updateTitles();
    })

    /*
      var html = "<h1>Tickets In Play</h1><div id='inplay'><% _.each(data, function(name) {

      }) <table id='inplay'><tr>";
      var rhtml = "<h1>Eliminated Tickets</h1><table id='eliminated'><tr>";
      for(var i=0;i<columns;++i) {
        html += "<td id='fromtd" + i + "'><ul id='from" + i + "'></ul>" + "</td>"
          rhtml += "<td><ul id='to" + i + "'></ul>" + "</td>"
      }
      html += "</tr></table>";
      rhtml += "</tr></table>";
      $('#numbers').html(html);
      $('#rejects').html(rhtml);

      count = data.length;
      items_per_column = count / columns;
      if(items_per_column > Math.floor(items_per_column)) {
        items_per_column = Math.floor(items_per_column) + 1;
      }
      numbers = [];
      var i=0;
      _.each(data,function(number) {
        html = "<li id='n" + i + "' class='n'>" + number + "</li>"
          var column = Math.floor((i) / items_per_column);
        $('#from' + column).append(html)
          numbers.push("#n" + i);
          i += 1;
      });

      doresize();
      */
  }

  var doresize = function() {
    resizeSmoothly($('#inplay'));
  }
  doresize = _.throttle(doresize, 1000);

  function removeIfChildrenEmpty(el) {
    if (el) {
      if (el.children().length == 0) {
        el.remove();
      }
    }
  }

  function removeEmptyColumns() {
    for (var i = 0; i < columns; i++) {
      removeIfChildrenEmpty($('#from' + i));
      removeIfChildrenEmpty($('#fromtd' + i));
    }
  }

  function namesAvailable() {
    return $('.inplay .name.available');
  }

  function rejectedNames() {
    return $('.rejected .name');
  }

  function updateTitles() {
     console.log("updatetitles");
     $('#niptitle').html("Names in play (" + namesAvailable().length + ")");
     $('#rntitle').html("Rejected Names (" + rejectedNames().length + ")");
  }

  function removeOne(resize) {
    var names = namesAvailable();
    var rand = Math.random();
    var index = Math.floor(rand * (names.length));

    var el = $(names[index]);
    el.removeClass('available');

    var newel = el.clone();
    var rejel = el.clone();
    $('.inplay').append(newel);
    $('.rejected').append(rejel);
    rejel.hide();
    newel.addClass('rejecting')
    var pos = el.offset();
    newel.css({
      position: 'absolute',
      fontSize: el.css('font-size'),
      marginLeft: 0,
      marginTop: 0,
      top: pos.top,
      left: pos.left
    });
    var cursize = el.css('font-size');
    cursize = cursize.substr(0, cursize.length - 2);

    el.css('color', 'black');

    var sizemultiplier = 4;
    var enlargedsize = cursize * sizemultiplier;

    var remaining = $('.name.available');
    remaining.stop(true);

    newel.stop(true);
    newel.css('opacity', 1); // the opacity might be in transition
    rejel.css('opacity', 1); // the opacity might be in transition
    rejel.css('font-size', rejectedsize + 'px'); // the opacity might be in transition
    newel.animate({
      fontSize: "400%", // String(enlargedsize) + "px"
      top: 200,
      left: $(window).width() / 2 - newel.width() * 2
    }, resizetime() * 2).animate({
      opacity: 0
    }, resizetime() * 2, function() {
      rejel.show('slow');
      el.hide('slow');
      updateTitles();
    });

    remaining.animate({
      opacity: 0.25
    }, resizetime()).animate({
      opacity: 0.25
    }, resizetime() * 2).animate({
      opacity: 1.0
    }, resizetime() * 2);

    updateTitles();

    /*
      .animate({fontSize:rejectel.css('font-size'), left: rejectpos.left, top: rejectpos.top + rejectel.height()},{duration: resizetime, complete: function() { 
          el.remove(); 
          if(resize) {
          removeEmptyColumns();
          doresize(); 
          }
          newel.appendTo(rejectel);
          newel.css({position: 'relative', top: 0, left: 0, fontSize: ""}); 
          }
          });
      el.animate({fontSize:String(enlargedsize) + "px"},resizetime() * 2).animate({fontSize:"0"},resizetime());
      //resizeSmoothly(count);
      */
  }

  function stopAt() {
    return iparam('stop');
  }

  function doremove() {
    var ms = iparam('speed');
    setTimeout(function() {
      if (availableNames().length <= stopAt()) {
        return;
      }
      removeOne(true);
      doremove();
    }, ms);
  }

  // This will parse a delimited string into an array of
  // arrays. The default delimiter is the comma, but this
  // can be overriden in the second argument.

  function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
      (
        // Delimiters.
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

        // Standard fields.
        "([^\"\\" + strDelimiter + "\\r\\n]*))"
      ),
      "gi"
    );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [
      []
    ];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

      // Get the delimiter that was found.
      var strMatchedDelimiter = arrMatches[1];

      // Check to see if the given delimiter has a length
      // (is not the start of string) and if it matches
      // field delimiter. If id does not, then we know
      // that this delimiter is a row delimiter.
      if (
        strMatchedDelimiter.length &&
        (strMatchedDelimiter != strDelimiter)
      ) {

        // Since we have reached a new row of data,
        // add an empty row to our data array.
        arrData.push([]);

      }


      // Now that we have our delimiter out of the way,
      // let's check to see which kind of value we
      // captured (quoted or unquoted).
      if (arrMatches[2]) {

        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        var strMatchedValue = arrMatches[2].replace(
          new RegExp("\"\"", "g"),
          "\""
        );

      } else {

        // We found a non-quoted value.
        var strMatchedValue = arrMatches[3];

      }


      // Now that we have our value string, let's add
      // it to the data array.
      arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return (arrData);
  }

  createTickets();

  $('#create').click(createTickets);
  $('#start').attr('disabled', true);

  $('#start').click(function() {
    $('#controls').fadeTo(500, 0.75);
    $('.tohide').hide();
    $('#start').attr('disabled', true);
    doremove();
  });
  $('#reload').click(function() {
    location.reload();
  });

  var inplaysize = 16;
  var rejectedsize = 16;
  function inplay() { return $('.inplay .name') }
  function rejected() { return $('.rejected .name') }
  $('#fontup').click(function() {
    inplaysize++;
    inplay().css('font-size',inplaysize + 'px');
  });
  $('#fontdown').click(function() {
    inplaysize--;
    inplay().css('font-size',inplaysize + 'px');
  });
  $('#fontupr').click(function() {
    rejectedsize++;
    rejected().css('font-size',rejectedsize + 'px');
  });
  $('#fontdownr').click(function() {
    rejectedsize--;
    rejected().css('font-size',rejectedsize + 'px');
  });

  $('#next').click(function() {
    var count = iparam('elcount');
    for (var i = 0; i < count - 1; ++i) {
      removeOne(false)
    }
    removeOne(true)
  });
})
