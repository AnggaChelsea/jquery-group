$(function() {
  var participants = _(["a", "b", "c", "d", "e"])
  var pairs = participants.map(function(it, i) {
    return participants.filter(function(_, j) { return j < i }).map(function(it2) {
      return { home: it, homeScore: ~~(Math.random()*10)%10, away: it2, awayScore: ~~(Math.random()*10)%10 }
    }).value()
  }).flatten(true)
  var $container = $('<div class="jqgroup"></div>').appendTo('#container')
  var templates = (function() {
    var standingsMarkup = Handlebars.compile(
      '<div class="standings">Standings'
      +'{{#each this}}'
      +'<div class="participant">{{this}}</div>'
      +'{{/each}}'
      +'</div>')
    var roundsMarkup = Handlebars.compile(
      '<div class="rounds"></div>')
    var unassignedMarkup = Handlebars.compile(
      '<div class="unassigned"></div>')
    var matchMarkup = Handlebars.compile(
      '<div data-id="{{id}}" class="match" draggable="true">{{home}} : {{homeScore}} - {{awayScore}} : {{away}}</div>')
    var roundMarkup = Handlebars.compile(
      '<div class="round"><header>Round {{this}}</header></div>')
    var id=0
    return {
      standings: function(participants) { return $(standingsMarkup(participants)) },
      rounds: $(roundsMarkup()),
      unassigned: $(unassignedMarkup()),
      match: function(match) {
        match.id = ++id
        var m = $(matchMarkup(match))
        m.asEventStream('dragstart').map(function(ev) { return ev.originalEvent }).onValue(function(ev) {
          ev.dataTransfer.setData('Text', match.id)
          m.css('opacity', 0.5)
          $('.round').addClass('droppable')
        })
        m.asEventStream('dragend').map(function(ev) { return ev.originalEvent }).onValue(function(ev) {
          m.css('opacity', 1.0)
          $('.round').removeClass('droppable')
        })
        return m
      },
      round: function(round) {
        var r = $(roundMarkup(round))
        r.asEventStream('dragover').map(function(ev) { ev.preventDefault(); return ev }).onValue(function(ev) { })
        r.asEventStream('dragenter').map(function(ev) { ev.preventDefault(); return ev }).onValue(function(ev) {
          r.addClass('over')
        })
        r.asEventStream('dragleave').map(function(ev) { ev.preventDefault(); return ev }).onValue(function(ev) {
          r.removeClass('over')
        })
        r.asEventStream('drop').map(function(ev) { ev.preventDefault(); return ev }).onValue(function(ev) {
          var id = ev.originalEvent.dataTransfer.getData('Text')
          var obj = $('[data-id="'+id+'"]')
          $(ev.target).append(obj)
          r.removeClass('over')
        })
        return r
      }
    }
  })()
  templates.standings(participants.value()).appendTo($container)
  var rounds = templates.rounds.appendTo($container)
  _([1, 2, 3, 4]).each(function(it) {
    rounds.append(templates.round(it))
  })
  var unassigned = templates.unassigned.appendTo($container)
  pairs.each(function(it) {
    unassigned.append(templates.match(it))
  })
})