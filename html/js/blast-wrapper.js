'use strict';


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
    const status = target.find('.status').text();
    if(seq && settings.status.ready === status) {
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
  for(var i = 0; i <  targets.length; i++) {
    const target = $(targets[i]);
    const status = target.find('.status');
    const key = Object.keys(settings.status).filter(function(k) { return settings.status[k] == status.text() })[0];
    update(target, key);
    const seq = target.find('.seq textarea').val();
    if(seq && settings.status.processing === status.text() && (settings.launch < (Date.now() - restricter.requested))) {
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
      const paramstr = Object.keys(params).filter(function (v) {return params[v]}).map(function(v){return v+'='+params[v]}).join('&');
      post($('#targetUrl').val(), paramstr, target);
    } else if(settings.status.searching === status.text() && ($('#polling').val() < (Date.now() - restricter.polled))) {
      hasPolled = true;
      const params = {
        CMD: 'Get',
        RID: target.find('.rid input').val()
      };
      const paramstr = Object.keys(params).filter(function (v) {return params[v]}).map(function(v){return v+'='+params[v]}).join('&');
      get($('#targetUrl').val() + '?' + paramstr, target)
    }
  }
  if(hasPolled) {
    restricter.polled = Date.now();
  }
  
}, settings.listen);

$('#targetUrl').val(settings.targetUrl);
$('#polling').val(settings.polling);
$('#database').val(settings.database);
$('#program').val(settings.program);
$('#excludeUncultured').prop('checked', settings.excludeUncultured);


});
