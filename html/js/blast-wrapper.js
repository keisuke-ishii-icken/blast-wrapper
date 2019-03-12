"use strict";


$(function(){



$(document).on({
  'scroll': function(event) {
    $('header').css('left', -window.scrollX + "px");
  },
  'dragenter': function(event) {
    $('#draggable').css('display', 'block');
  },
  'dragover': function(event) {
    event.stopPropagation();
    event.preventDefault();
  },
  'drop': function(event) {
    event.stopPropagation();
    event.preventDefault();
  }
});

$('#draggable').on({
  'dragleave': function(event) {
    $('#draggable').css('display', 'none');
  },
  'drop': function(event) {
    $('#draggable').css('display', 'none');
    event.stopPropagation();
    event.preventDefault();
    
    const files = event.originalEvent.dataTransfer.files;
    for(var i = 0; i < files.length; i++) {
      if(files[i].name.match('.*\.csv$')) {
        loadSeq(files[i]);
      } else if(files[i].name.match('.*\.json$')){
        loadResult(files[i]);
      } else {
        console.log('unsupported file.');
      }
    }
  }
});

$('.enterzParams').on({
  'load': function(event) {
    let query = $('#excludeUncultured').prop('checked') ? 'all [filter] NOT(environmental samples[organism] OR metagenomes[orgn] OR txid32644[orgn])' : '';
    $('#enterzQuery').val(query);
  },
  'change': function(event) {
    let query = $('#excludeUncultured').prop('checked') ? 'all [filter] NOT(environmental samples[organism] OR metagenomes[orgn] OR txid32644[orgn])' : '';
    $('#enterzQuery').val(query);
  }
});

$('#search').on('click', function(event){
  const targets = $('.target');
  for(var i = 0; i <  targets.length; i++) {
    const target = $(targets[i]);
    const seq = target.find('.seq textarea').val();
    if(seq && target.is('.ready')) {
      update(target, 'processing');
      target.find('input, textarea').prop("disabled", true);
    }
  }
});

$('.seq').on('change', function(event) {
  const row = $(event.target).closest('.row');
  calcurate(row);

});

$('#add').on('click', function(event){
  const row = $('#template').clone(true);
  // for IE
  row.find('textarea').val('');
  row.removeAttr('id');
  const i = newIndex();
  row.find('.index').html(i);
  row.addClass('show');
  $('#launcher').append(row);
  row.find('.seq textarea').focus();
});

$('.remove').on('click', function(event){
  const row = $(event.target).closest('.row');
  const cells = row.children('div');
  cells.remove();
  row.removeClass('show');
  row.addClass('unshow');
  const rows = $('.target.show');
  for (var i = 0; i <  rows.length; i++) {
    $(rows[i]).find('.index').html(i + 1);
  }
});

$('#clear').on('click', function(event) {
  alert('All datas are cleared. Are you sure?');
  $('.show .remove').click();
  $('#add').click();
});


let restricter = {requested: 0, polled: 0};

setInterval(function(){
  const targets = $('.target.show');
  let hasPolled = false;
  clean();
  disableSearch();
  for(var i = 0; i <  targets.length; i++) {
    const target = $(targets[i]);
    const key = Object.keys(settings.status).filter(function(k) { return target.is('.' + k) })[0];
    update(target, key);
    const seq = target.find('.seq textarea').val();
    if(seq && target.is('.processing') && (settings.launch < (Date.now() - restricter.requested))) {
      restricter.requested = Date.now();
      const database = $('#database').val();
      const params = {
        CMD: 'Put',
        ENTREZ_QUERY: $('#enterzQuery').val().replace(/ /g, '+'),
        PROGRAM: JSON.parse($('#program').val()).program,
        MEGABLAST: JSON.parse($('#program').val()).megablast ? 'on' : undefined,
        DATABASE: $('#database').val(),
        QUERY: seq
      };
      const successed = function (response, textStatus, jqXHR) {
        const rid = $($.parseHTML(response)).find('#rid').val();
        target.find('.rid input').val(rid);
        update(target, 'searching')
      };
      const failed = function (jqXHR, textStatus, errorThrown) {
        update(target, 'error');
        target.find('input, textarea').prop("disabled", false);
      };
      
      const paramstr = Object.keys(params).filter(function (v) {return params[v]}).map(function(v){return v+'='+params[v]}).join('&');
      post($('#targetUrl').val(), paramstr, successed, failed);

    } else if(target.is('.searching') && ($('#polling').val() < (Date.now() - restricter.polled))) {
      hasPolled = true;
      const getHtml = {
        CMD: 'Get',
        RID: target.find('.rid input').val()
      };
      const getJson = {
        CMD: 'Get',
        RESULTS_FILE: 'on',
        RID: target.find('.rid input').val(),
        FORMAT_TYPE: 'JSON2_S',
        FORMAT_OBJECT: 'Alignment'
      };
      const failed = function (jqXHR, textStatus, errorThrown) {
        update(target, 'error');
        target.find('input, textarea').prop("disabled", false);
      };
      
      const afterJson = function (response, textStatus, jqXHR) {
      target.find('.results').html('');
        const result = JSON.parse(response);
        const hits = result.BlastOutput2[0].report.results.search.hits;
        for (var j = 0; (j <  hits.length) && (j < 8); j++) {
          const title = hits[j].description[0].title;
          const display = title.length > 65 ? title.substr(0, 65) + '...' : title;
          const ident = (hits[j].hsps[0].identity / hits[j].hsps[0].align_len * 100).toFixed(2);
          target.find('.results').append('<div class="result">' + (j + 1) + '. ' + display + ' >> ' + ident + '%</div>');
        }
        const htmlUrl = $('#targetUrl').val() + '?' + requestParameter(getHtml);
        const jsonUrl = $('#targetUrl').val() + '?' + requestParameter(getJson);
        target.find('.results').append('<a href="' + htmlUrl + '" target="_blank">&gt;&gt;to blast</a><br /><a href="' + jsonUrl + '" target="_blank">&gt;&gt;download</a>');
      }
      const afterHtml = function (response, textStatus, jqXHR) {
        const result = $($.parseHTML(response)).find('#statInfo').attr('class');
        if(!result) {
          target.find('input, textarea').prop("disabled", false);
          update(target, 'success');
          get($('#targetUrl').val(), getJson, afterJson, failed);
        } else if(result === 'UNKNOWN') {
          target.find('input, textarea').prop("disabled", false);
          update(target, 'error');
        }
      };
      get($('#targetUrl').val(), getHtml, afterHtml, failed);
    } else if(target.is('.ready')) {
      enableSearch();
    }
  }
  if(hasPolled) {
    restricter.polled = Date.now();
  }
  
}, settings.listen);

function disableSearch() {
  $('#search').attr('disabled', true);
  $('#search').html('input seq');
}

function enableSearch() {
  $('#search').attr('disabled', false);
  $('#search').html('search');
}

$('#targetUrl').val(settings.targetUrl);
$('#polling').val(settings.polling);
$('#database').val(settings.database);
$('#program').val(settings.program);
$('#excludeUncultured').prop('checked', settings.excludeUncultured);


});
