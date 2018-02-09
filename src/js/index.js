import $ from 'jquery'
import './jquery.simplePagination'

import arrow from '../images/grey-arrow.png'

const publicKey = 'd7de5198717c06d40d93e733cff7e438'

const carouselLength = 5
const carouselClasses = ['third left', 'second left', 'principal', 'second right', 'third right']
const superheroesLength = 10

let superheroes

function activateDescriptionToggle(description) {
  $('#descriptionToggle').click(() => {
    if ($('#descriptionToggle').text() === '(Ver más)') {
      $('#description').text(description)
      $('#descriptionToggle').text('(...)')
    } else {
      $('#description').text(`${description.substring(0, 20)}... `)
      $('#descriptionToggle').text('(Ver más)')
    }
  })
}

function addDescriptionToggle(description) {
  $('#description').text(`${description.substring(0, 20)}... `)
  $('<span id="descriptionToggle">(Ver más)</span>').insertAfter('#description')
  activateDescriptionToggle(description)
}

function refreshSuperHeroInfo() {
  const index = +$('.principal').attr('id').substr(10)
  $('#id').text(superheroes[index].id)
  $('#name').text(superheroes[index].name)
  $('#comics').text(superheroes[index].comics.available)

  const description = (superheroes[index].description !== '') ? superheroes[index].description : 'No disponible'
  $('#description').text(description)

  if ($('#descriptionToggle') !== undefined) {
    $('#descriptionToggle').remove()
  }
  if (description !== 'No disponible') {
    addDescriptionToggle(description)
  }
}

function moveCarouselLeft() {
  let index = +$('.third.left').attr('id').substr(10)
  index -= 1
  moveCarousel(index)
}

function moveCarouselRight() {
  let index = +$('.third.left').attr('id').substr(10)
  index += 1
  moveCarousel(index)
}

function deactivateArrows() {
  $('#leftarrow').off('click')
  $('#rightarrow').off('click')
}

function deactivateKeys() {
  $(document).off('keydown')
}

function activateArrows() {
  $('#leftarrow').click(() => {
    moveCarouselLeft()
  })
  $('#rightarrow').click(() => {
    moveCarouselRight()
  })
}

function activateCarousel() {
  $('.left').click(() => {
    moveCarouselLeft()
  })
  $('.right').click(() => {
    moveCarouselRight()
  })
}

function activateKeys() {
  $(document).keydown((event) => {
    if (event.which === 13 || event.keyCode === 13) {
      openDialog()
    } else if (event.which === 37 || event.keyCode === 37) {
      moveCarouselLeft()
    } else if (event.which === 39 || event.keyCode === 39) {
      moveCarouselRight()
    }
  })
}

function closeDialog() {
  deactivateKeys()
  activateArrows()
  activateKeys()
  $('.curtain').css('display', 'none')
  $('.dialog').css('display', 'none')
}

/*
function vote() {
  $('.popup').css('display', 'block')
  if (Storage !== void(0)) {
    const newVote = {}
    newVote.nombre = $('#txtFirstName').val()
    newVote.apellido = $('#txtLastName').val()
    newVote.email = $('#txtEmail').val()
    newVote.voto = $('#tituloForm').text()
    votes['votos'].push(newVote)
    localStorage['votos'] = JSON.stringify(votes)
    setTimeout(() => { window.location = 'results.html' }, 3000)
  } else {
    closeDialog()
  }
}
*/

/*
function openDialog() {
  deactivateArrows()
  deactivateKeys()
  $(document).keydown((event) => {
    if (event.which === 27 || event.keyCode === 27) {
      closeDialog()
    }
    if (event.which === 13 || event.keyCode === 13) {
      vote()
    }
  })
  $('.curtain').css('display', 'block')
  $('.dialog').css('display', 'flex')
  $('#tituloForm').text($('#titulo').text())
}
*/

/*
function activatePrincipal() {
  $('.principal').click(() => {
    openDialog()
  })
}
*/

function moveCarousel(index) {
  $('#carrusel').children().remove()
  let i
  if (index === -1) {
    i = superheroesLength - 1
  } else if (index === superheroesLength) {
    i = 0
  } else {
    i = index
  }
  
  let j = 0
  const leftarrow = `<div id="leftarrow" class="arrow" aria-label="Mueve selección a la izquierda"><img src="${arrow}" aria-labelledby="leftarrow" alt="Flecha izquierda"></div>`
  $(leftarrow).appendTo('#carrusel')
  do {
    const superhero = superheroes[i]
    const superheroPic = `${superhero.thumbnail.path}.${superhero.thumbnail.extension}`
    let carouselElement
    if (carouselClasses[j] !== 'principal') {
      carouselElement = `<div id="superheroe${i}" data-name="${superhero.name}" class="superheroes ${carouselClasses[j]}"><img src="${superheroPic}" alt="${superhero.name}"></div>`
    } else {
      carouselElement = `<div id="superheroe${i}" data-name=="${superhero.name}" class="superheroes ${carouselClasses[j]}" tabindex=1 aria-label="${superhero.name}"><img src="${superheroPic}" aria-labelledby="${superhero.name}" alt="${superhero.name}"></div>`
      $('#currentHero').text(`${i + 1}/10`)
    }

    $(carouselElement).appendTo('#carrusel')
    i += 1
    if (i === superheroesLength) {
      i = 0
    }
    j += 1
  } while (j !== carouselLength)
  const rightarrow = `<div id="rightarrow" class="arrow" aria-label="Mueve selección a la derecha"><img src="${arrow}" aria-labelledby="rightarrow" alt="Flecha derecha"></div>`
  $(rightarrow).appendTo('#carrusel')
  activateCarousel()
  // activatePrincipal()
  activateArrows()
  refreshSuperHeroInfo()
}

function generateCarousel() {
  const i = superheroesLength - 2
  moveCarousel(i)
}

function activateButtons() {
  $('#btnReturn').click(() => {
    closeDialog()
  })

  $('#btnVote').click(() => {
    vote()
  })
}

/*
function loadVotes() {
  if (Storage !== void(0)) {
    if (localStorage['votos'] !== undefined) {
      votes = JSON.parse(localStorage['votos'])
    } else {
      localStorage['votos'] = JSON.stringify(votes)
    }
  } else {
    $('.popup').find('p').first().text('¡Voto no realizado!')
    $('.popup').find('p').last().text('No se ha podido guardar el voto, lo sentimos.')
  }
}
*/

const queryFor = option => ({
  characters: 'https://gateway.marvel.com/v1/public/characters',
  comics: 'https://gateway.marvel.com/v1/public/comics'
})[option]

function loadSuperheroes(offset) {
  superheroes = []
  $.getJSON(queryFor('characters'), { offset: offset, limit: 100, apikey: publicKey }).done(function (response) {
    for (let i = 0; i < superheroesLength; i++) {
      superheroes.push(response.data.results[i])
    }
    superheroes = response.data.results
    generateCarousel()
  })
}

function loadPaginator() {
  $('.paginator').pagination({
    items: 100,
    itemsOnPage: 10,
    cssStyle: 'light-theme',
    onPageClick: (pageNum) => {
      loadSuperheroes((pageNum * 10) - 10)
    }
  })
}


$(document).ready(() => {
  loadSuperheroes(0)
  loadPaginator()
  // activatePrincipal()
  activateDescriptionToggle()
  activateKeys()
  activateButtons()
  // loadVotes()
})

