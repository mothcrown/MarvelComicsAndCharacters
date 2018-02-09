/* global google */
import $ from 'jquery'

// Opciones disponibles. Quejas ninguna!
const chartOptions = ['Tarta', 'Barras', 'Columnas', 'Donut']
let type = 'Tarta'

let heroVotes
let comicVotes
let totalHeroVotes

/**
 * Píllame quiénes han sido votados
 */
function getVotedHeroes() {
  const votedHeroes = []
  Object.values(heroVotes.votos).map((vote) => {
    const name = vote.voto
    let found = false
    for (let i = 0; i < votedHeroes.length; i += 1) {
      if (name === votedHeroes[i]) {
        found = true
      }
    }

    if (!found) {
      votedHeroes.push(name)
    }
  })
  return votedHeroes
}

/**
 * Esto hay que refactorizarlo para añadir comics.
 * No me va a dar tiempo.
 */
function drawChart() {
  const data = new google.visualization.DataTable()
  data.addColumn('string', 'Personaje')
  data.addColumn('number', 'Votos')

  let heroName
  let numHeroVotes
  let arialabel = "Total de votos" + totalHeroVotes + ","

  const votedHeroes = getVotedHeroes()
  const numVotedHeroes = votedHeroes.length

  for (let i = 0; i < numVotedHeroes; i += 1) {
    heroName = votedHeroes[i]
    numHeroVotes = 0
    for (let j = 0; j < totalHeroVotes; j += 1) {
      if (heroName === heroVotes.votos[j].voto) {
        numHeroVotes += 1
      }
    }
    arialabel += `${heroName} ${numHeroVotes} votos, `
    data.addRow([heroName, numHeroVotes])
  }

  $('#chartHeroes').attr('aria-label', arialabel)
  const options = {
    title: 'Votaciones de personajes',
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
      chart = new google.visualization.PieChart(document.getElementById('chartHeroes'))
      break
    case 'Barras':
      chart = new google.visualization.BarChart(document.getElementById('chartHeroes'))
      break
    case 'Columnas':
      chart = new google.visualization.ColumnChart(document.getElementById('chartHeroes'))
      break
    case 'Donut':
      options.pieHole = 0.4
      chart = new google.visualization.PieChart(document.getElementById('chartHeroes'))
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
  })
  $('#selectHeroChart').change(() => {
    type = $('#selectHeroChart').val()
    drawChart()
  })
}

/**
 * La democracia de los frikis!
 */
function loadVotes() {
  if (Storage !== void(0)) {
    heroVotes = JSON.parse(localStorage.herovotes)
    // comicVotes = JSON.parse(localStorage.comicvotes)
    totalHeroVotes = Object.keys(heroVotes.votos).length
    // totalComicVotes = Object.keys(comicVotes.votes).length
  }
}

$(document).ready(() => {
  loadVotes()
  loadSelect()
  setTimeout(() => {
    google.charts.load('visualization', '1', { packages: ['corechart'] })
    google.charts.setOnLoadCallback(drawChart)
  }, 200)
})
