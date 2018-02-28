/* global google */
import $ from 'jquery'

// Opciones disponibles. Quejas ninguna!
const chartOptions = ['Tarta', 'Barras', 'Columnas', 'Donut']
let type = 'Tarta'

let heroVotes
let comicVotes
let totalHeroVotes
let totalComicVotes

/**
 * Píllame quiénes han sido votados
 */
function getVoted(mode) {
  const voted = []
  const votes = (mode === 'superheroes') ? heroVotes : comicVotes
  Object.values(votes.votos).map((vote) => {
    const newVote = vote.voto
    let found = false
    for (let i = 0; i < voted.length; i += 1) {
      if (newVote === voted[i]) {
        found = true
      }
    }

    if (!found) {
      voted.push(newVote)
    }
  })
  return voted
}

/**
 * Refactorizado! Aún así feo como pegarle a un padre.
 */
function drawChart(mode) {
  const data = new google.visualization.DataTable()
  let votes
  let totalVotes
  if (mode === 'superheroes') {
    data.addColumn('string', 'Personaje')
    votes = heroVotes
    totalVotes = totalHeroVotes
  } else {
    data.addColumn('string', 'Comic')
    votes = comicVotes
    totalVotes = totalComicVotes
  }
  data.addColumn('number', 'Votos')

  let name
  let numVotes
  let arialabel = `Total de votos ${totalVotes}, `

  const voted = getVoted(mode)
  const numVoted = voted.length

  for (let i = 0; i < numVoted; i += 1) {
    name = voted[i]
    numVotes = 0
    for (let j = 0; j < totalVotes; j += 1) {
      if (name === votes.votos[j].voto) {
        numVotes += 1
      }
    }
    arialabel += `${name} ${numVotes} votos, `
    data.addRow([name, numVotes])
  }
  const chartMode = (mode === 'superheroes') ? 'chartHeroes' : 'chartComics'
  const title = (mode === 'superheroes') ? 'personajes' : 'comics'
  $(`#${chartMode}`).attr('aria-label', arialabel)
  const options = {
    title: `Votación de ${title}`,
    width: 400,
    height: 300,
    backgroundColor: 'transparent',
    legend: { textStyle: { color: 'ghostwhite' } },
    titleTextStyle: { color: 'ghostwhite' },
    hAxis: { textStyle: { color: 'ghostwhite' } },
    vAxis: { textStyle: { color: 'ghostwhite' } }
  }

  let chart
  switch (type) {
    case 'Tarta':
      chart = new google.visualization.PieChart(document.getElementById(chartMode))
      break
    case 'Barras':
      chart = new google.visualization.BarChart(document.getElementById(chartMode))
      break
    case 'Columnas':
      chart = new google.visualization.ColumnChart(document.getElementById(chartMode))
      break
    case 'Donut':
      options.pieHole = 0.4
      chart = new google.visualization.PieChart(document.getElementById(chartMode))
      break
    default:
      break
  }
  chart.draw(data, options)
}

/**
 * Simple y sencillo. Llama a drawChart onchange.
 */
function loadSelect() {
  chartOptions.map((option) => {
    $('#selectHeroChart').append(`<option value="${option}">${option}</option>`)
    $('#selectComicChart').append(`<option value="${option}">${option}</option>`)
  })
  $('#selectHeroChart').change(() => {
    type = $('#selectHeroChart').val()
    drawChart('superheroes')
  })
  $('#selectComicChart').change(() => {
    type = $('#selectComicChart').val()
    drawChart('comics')
  })
}

/**
 * La democracia de los frikis!
 */
function loadVotes() {
  if (Storage !== void(0)) {
    heroVotes = JSON.parse(localStorage.herovotes)
    comicVotes = JSON.parse(localStorage.comicvotes)
    totalHeroVotes = Object.keys(heroVotes.votos).length
    totalComicVotes = Object.keys(comicVotes.votos).length
  }
}

$(document).ready(() => {
  loadVotes()
  loadSelect()
  setTimeout(() => {
    google.charts.load('visualization', '1', { packages: ['corechart'] })
    // google.charts.setOnLoadCallback(drawChart)
  }, 200)
})
