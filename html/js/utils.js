"use strict";

function post(url, data, row) {
    $.ajax({
        url: url,
        type: 'POST',
        timeout: settings.timeout,
        cache: false,
        data: data,
        dataType: 'text'
    }).done(function (response, textStatus, jqXHR) {
      const rid = $($.parseHTML(response)).find('#rid').val();
      row.find('.rid input').val(rid);
      update(row, 'searching')
      console.log(jqXHR);
    }).fail(function (jqXHR, textStatus, errorThrown) {
      update(row, 'error');
      row.find('input, textarea').prop("disabled", false);
      console.log(jqXHR);
    });
};


function get(url, row) {
    $.ajax({
        url: url,
        type: 'GET',
        timeout: settings.timeout,
        cache: false,
        dataType: 'text'
    }).done(function (response, textStatus, jqXHR) {
      const result = $($.parseHTML(response)).find('#statInfo').attr('class');
      if(!result) {
        update(row, 'success');
        const rid = row.find('.rid input').val();
        const params = {
          CMD: 'Get',
          RESULTS_FILE: 'on',
          RID: rid,
          FORMAT_TYPE: 'JSON2_S',
          FORMAT_OBJECT: 'Alignment'
        };
        const paramstr = Object.keys(params).filter(function (v) {return params[v]}).map(function(v){return v+'='+params[v]}).join('&');
        const download = $('#targetUrl').val() + '?' + paramstr;
        row.find('.result').html('<a href="' + url + '" target="_blank">&gt;&gt;to blast</a><br /><a href="' + download + '" target="_blank">&gt;&gt;download</a>');
        row.find('input, textarea').prop("disabled", false);
      } else if(result === 'UNKNOWN') {
        update(row, 'error');
        row.find('input, textarea').prop("disabled", false);
      }
      console.log(jqXHR);
    }).fail(function (jqXHR, textStatus, errorThrown) {
      update(row, 'error');
      console.log(jqXHR);
    });
};

function loadSeq(file) {
  const reader = new FileReader();
  reader.onload = function(e){
    const lines = reader.result.split(/\r\n|\r|\n/);
    
    function indexes(lines) {
      if(0 < lines.length) {
        const datas = lines[0].split(/,\s*/);
        if(datas[0] === 'sequence' && datas[1] === 'description') {
          return {seqIndex: 0, descIndex: 1, containsHeader: true};
        } else if(datas[1] === 'sequence' && datas[0] === 'description') {
          return {seqIndex: 1, descIndex: 0, containsHeader: true};
        }
      }
      return {seqIndex: 0, descIndex: 1, containsHeader: false};
    }

    const meta = indexes(lines);
    let targets = [];
    for (var i = 0; i < lines.length; i++) {
      if(i === 0 && meta.containsHeader) {
        continue;
      }
      const datas = lines[i].split(/,\s*/);
      const target = {
        sequence: datas[meta.seqIndex],
        description: datas[meta.descIndex]
      };
      targets.push(target);
    }
    drawSeq(targets);
  }
  reader.readAsText(file);
};

function drawSeq(targets) {
  const reserved = $('.target.show').filter(function(index, element, array) {
    return ($(element).find('.seq textarea').val() !== '');
  }).length;
  const vacant = $('.target.show').length - reserved;
  for (var i = 0; i < targets.length - vacant; i++) {
    $('#add').click();
  }
  const afters = $('.target.show');
  for(var i = 0; i <  targets.length; i++) {
    const row = afters[i + reserved];
    $(row).find('.seq textarea').val(targets[i].sequence);
    $(row).find('.description textarea').val(targets[i].description);
    calcurate($(row));
  }
};

function loadResult(file) {
  const reader = new FileReader();
  const rid = file.name.substr(0, file.name.indexOf('-'));
  reader.onload = function(e) {
    const result = JSON.parse(reader.result);
    drawResult(rid, null, result);
  }
  reader.readAsText(file);
};

function drawResult(rid, discription, result) {
  $('.rid');
  console.log(result);
  console.log(result.BlastOutput2[0].report);
  console.log(result.BlastOutput2[0].report.results.search.hits[0]);

  const reserved = $('.target.show').filter(function(index, element, array) {
    return ($(element).find('.rid input').val() !== '');
  }).length;
  const vacant = $('.target.show').length - reserved;
  for (var i = 0; i < 1 - vacant; i++) {
    $('#add').click();
  }
  const afters = $('.target.show');
  const row = afters[reserved];
  $(row).find('.rid input').val(rid);
  $(row).find('.discription textarea').val(discription);
  //$(row).find('.seq textarea').val(targets[i].sequence);
  //$(row).find('.description textarea').val(targets[i].description);
  //calcurate($(row));
}



function calcurate(row) {
  const seq = row.find('.seq textarea').val().toLowerCase();
  const counter = {
    a: seq.split(/a/gm).length - 1,
    t: seq.split(/t/gm).length - 1,
    g: seq.split(/g/gm).length - 1,
    c: seq.split(/c/gm).length - 1,
    n: seq.split(/n/gm).length - 1
  };
  row.find('.info').html('length:' + seq.length + '<br />A:' +counter.a + '<br />T:' +counter.t + '<br />G:' +counter.g + '<br />C:' +counter.c + '<br />N:' +counter.n);
  if(seq) {
    update(row, 'ready');
  } else {
    update(row, 'empty');
  }
}


function clean() {
  $('.unshow').remove();
}

function update(row, status) {
  for(var i in settings.status) {
    row.removeClass(i);
  }
  row.addClass(status);
  if('finished' !== status) {
    //row.html(settings.status[status]);
  }
}

function newIndex() {
  const indexes = $('.row.show');
  return indexes.length + 1;
}