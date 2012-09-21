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
    if(num < 10) {
    return "00" + num;
    } else if(num < 100) {
    return "0" + num;
    } else {
      return String(num);
    }
    }

    function resizeSmoothly(element) {
      var units = "px";
      var winwidth = window.innerWidth * 0.90;
      var was = element.css('font-size');
      var pxsize = Number(was.substr(0,was.length-2));
      //$('#marker').css('top',winheight);

     
      element.css('font-size',String(pxsize) + units);

      var min = 10;
      var max = 300;
      while(max - min > 0.001) {
        var totry = (max + min) / 2.0;
        element.css('font-size',String(totry) + units);

        var diff = element.width() - winwidth;
        if(diff == 0) {
          break;
        } else if(diff < 0) {
          min = totry;
        } else {
          max = totry;
        }
      }
      element.css('font-size',was);

      //animate(1,pxsize);
      var size = String((max + min) / 2.0) + units;
      element.animate({fontSize:size},resizetime());
      //n.css('font-size',size);
    }

    var count = 300;
    var columns = 10;
    var numbers = new Array;
    var items_per_column;
    function createTickets() {
      if(sparam('count').substring(0,4) == 'http') {
        $.get(sparam('count'),{}, function(data) {
          var res = CSVToArray(data,",");
          function empty(a) { return a == null || a == ""; }
          res = _.reject(res,function(row) { return empty(row[0]) && empty(row[1]); })
          var names = _.map(res,function(row) {
            return (row[0] + " " + row[1]).replace('/^ +/','').replace(/ +$/,'');
          })
          createTicketsFromData(names);
        })
        return;
      }

      var first = iparam('firstticket');
      count = iparam('count');
      var data = [];
      for(var i=first;i<count + first;++i) {
        data.push(zeroFill(i));
      }
      createTicketsFromData(data);
    }
    function createTicketsFromData(data) {
      $('#start').attr('disabled',false);
      columns = iparam('columns');

      var html = "<h1>Tickets In Play</h1><table id='inplay'><tr>";
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
    }

    var doresize = function() {
      resizeSmoothly($('#inplay'));
    }
    doresize = _.throttle(doresize,1000);

    function removeIfChildrenEmpty(el) {
      if(el) {
        if(el.children().length == 0) {
          el.remove();
        }
      }
    }

    function removeEmptyColumns() {
      for(var i=0;i<columns;i++) {
        removeIfChildrenEmpty($('#from' + i));
        removeIfChildrenEmpty($('#fromtd' + i));
      }
    }

    function removeOne(resize) {
      if(numbers.length <= 1) {
        return;
      }
      var rand = Math.random();
      var index = Math.floor(rand * (numbers.length));

      var el = $(numbers[index]);
      numbers.splice(index,1);

      try {

        //el.html("remove");
        var divid = 'reject' + el.attr('id');
        var newel = "<li id='" + divid + "'>" + el.html() + "</li>";
        $('#numbers').append(newel);
        newel = $("#" + divid);
        var pos = el.offset();
        var rejectcolumn = Math.floor((count - numbers.length) / items_per_column);
        var rejectel = $('#to' + rejectcolumn);
        var rejectpos = rejectel.offset();
        newel.css({position: 'absolute',
            fontSize: el.css('font-size'),
            marginLeft: 0, marginTop: 0,
            top: pos.top, left: pos.left });
        var cursize = el.css('font-size');
        cursize = cursize.substr(0,cursize.length-2);
      } catch(e) {
        console.log("Caught exception for index " + index + " with length " + numbers.length + " random is " + rand);
        console.log("count is " + count);
      }

      el.css('color','black');

      var sizemultiplier = 4;
      var enlargedsize = cursize * sizemultiplier;

      newel.animate({fontSize:String(enlargedsize) + "px"},resizetime() * 2).animate({fontSize:rejectel.css('font-size'), left: rejectpos.left, top: rejectpos.top + rejectel.height()},{duration: resizetime, complete: function() { 
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
    }

    function stopAt() {
      return iparam('stop');
    }

    function doremove() {
      var ms = iparam('speed');
      setTimeout(function() {
          if(numbers.length <= stopAt()) {
          return;
          }
          removeOne(true);
          doremove();
          },ms);
    }

     // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function CSVToArray( strData, strDelimiter ){
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
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[ 1 ];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                        strMatchedDelimiter.length &&
                        (strMatchedDelimiter != strDelimiter)
                        ){

                        // Since we have reached a new row of data,
                        // add an empty row to our data array.
                        arrData.push( [] );

                }


                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[ 2 ]){

                        // We found a quoted value. When we capture
                        // this value, unescape any double quotes.
                        var strMatchedValue = arrMatches[ 2 ].replace(
                                new RegExp( "\"\"", "g" ),
                                "\""
                                );

                } else {

                        // We found a non-quoted value.
                        var strMatchedValue = arrMatches[ 3 ];

                }


                // Now that we have our value string, let's add
                // it to the data array.
                arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    }

    $('#create').click(createTickets);
    $('#start').attr('disabled',true);

    $('#start').click(function() {
        $('#controls').fadeTo(500,0.75);
        $('.tohide').hide();
        $('#start').attr('disabled',true);
        doremove();
        });
    $('#reload').click(function() {
        location.reload();
        });

    $('#next').click(function() {
        var count = iparam('elcount');
        for(var i=0;i<count-1;++i) {
        removeOne(false)
        }
        removeOne(true)
        });
})
