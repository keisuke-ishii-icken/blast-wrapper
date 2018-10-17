


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


let restricter = {request: 0, polling: 0};

setInterval(function(){
  const targets = $('.target.show');
  let polled = false;
  clean();
  for(var i = 0; i <  targets.length; i++) {
    const target = $(targets[i]);
    const status = target.find('.status');
    const key = Object.keys(settings.status).filter(function(k) { return settings.status[k] == status.text() })[0];
    update(target, key);
    const seq = target.find('.seq textarea').val();
    if(seq && settings.status.processing === status.text() && (settings.launch < (Date.now() - restricter.request))) {
      restricter.request = Date.now();
      const database = $('#database').val();
      post(settings.postUrl, settings.sample.replace('${seq}', seq), target);
    } else if(settings.status.searching === status.text() && (settings.polling < (Date.now() - restricter.polling))) {
      polled = true;
      const rid = target.find('.rid input').val();
      get(settings.getUrl.replace('${rid}', rid), target)
    }
  }
  if(polled) {
    restricter.polling = Date.now();
  }
  
}, settings.listen);

});


