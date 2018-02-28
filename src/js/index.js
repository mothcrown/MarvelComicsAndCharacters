import $ from 'jquery'
import './jquery.simplePagination'

import arrow from '../images/grey-arrow.png'
import spinner from '../images/spinner.gif'

// DO NOT STEAL!!11!
const publicKey = 'd7de5198717c06d40d93e733cff7e438'

let superheroes
let comics
let heroVotes
let comicVotes

// CONSTS
const carouselLength = 5
const carouselClasses = ['third left', 'second left', 'principal', 'second right', 'third right']
const petitionLength = 100

/**
 * Hay mejores formas de hacer esto, pero creo que esta es bastante mona!
 * @param {*} description 
 */
function activateDescriptionToggle(descriptionMode, descriptionToggleMode, description) {
  $(`#${descriptionToggleMode}`).click(() => {
    if ($(`#${descriptionToggleMode}`).text() === '(Ver más)') {
      $(descriptionMode).text(description)
      $(`#${descriptionToggleMode}`).text('(...)')
    } else {
      $(descriptionMode).text(`${description.substring(0, 20)}... `)
      $(`#${descriptionToggleMode}`).text('(Ver más)')
    }
  })
}

/**
 * Añado (ver más) tanto para comics como para superhéroes
 * @param {*} description 
 */
function addDescriptionToggle(mode, description) {
  const descriptionMode = (mode === 'superheroes') ? '#descriptionsuper' : '#descriptioncomic'
  $(descriptionMode).text(`${description.substring(0, 20)}... `)
  const descriptionToggleMode = (mode === 'superheroes') ? 'descriptionToggleSuper' : 'descriptionToggleComic'
  $(`<span id="${descriptionToggleMode}">(Ver más)</span>`).insertAfter(descriptionMode)
  activateDescriptionToggle(descriptionMode, descriptionToggleMode, description)
}

/**
 * Cambia info cuando movemos el carrusel. Esto hay que refactorizarlo porque
 * Virgen bendita!
 */
function refreshInfo(mode) {
  const index = +$(`.${mode}.principal`).attr('id').substr(9)
  let description
  if (mode === 'superheroes') {
    $('#idsuper').text(superheroes[index].id)
    $('#name').text(superheroes[index].name)
    $('#comics').text(superheroes[index].comics.available)
    description = (superheroes[index].description !== '') ? superheroes[index].description : 'No disponible'
    $('#descriptionsuper').text(description)
    if ($('#descriptionToggleSuper') !== undefined) {
      $('#descriptionToggleSuper').remove()
    }
    if (description !== 'No disponible') {
      addDescriptionToggle(mode, description)
    }
  } else {
    $('#comicid').text(comics[index].id)
    $('#title').text(comics[index].title)
    $('#issue').text(comics[index].issueNumber)
    description = (comics[index].description !== null) ? comics[index].description : 'No disponible'
    $('#descriptioncomic').text(description)
    if ($('#descriptionToggleComic') !== undefined) {
      $('#descriptionToggleComic').remove()
    }
    if (description !== 'No disponible') {
      addDescriptionToggle(mode, description)
    }
  }
}

/**
 * Mueve carrusel a la izquierda
 */
function moveCarouselLeft(mode) {
  let index = +$(`.${mode}.third.left`).attr('id').substr(9)
  index -= 1
  moveCarousel(mode, index)
}

/**
 * Mueve carrusel a la derecha
 */
function moveCarouselRight(mode) {
  let index = +$(`.${mode}.third.left`).attr('id').substr(9)
  index += 1
  moveCarousel(mode, index)
}

/**
* Desconectamos flechas si no nos hacen falta
*/
function deactivateArrows() {
  $('#leftarrowSuper').off('click')
  $('#rightarrowSuper').off('click')
  $('#leftarrowComic').off('click')
  $('#rightarrowComic').off('click')
}

/**
 * Evitamos votos cada vez que alguien pulse enter fuera del dialog
 */
function deactivateKeys() {
  $(document).off('keydown')
}

/**
 * Activa flechas.
 * 
 * REFACTORIZA
 */
function activateArrows() {
  $('#leftarrowSuper').click(() => {
    moveCarouselLeft('superheroes')
  })
  $('#rightarrowSuper').click(() => {
    moveCarouselRight('superheroes')
  })
  $('#leftarrowComic').click(() => {
    moveCarouselLeft('comics')
  })
  $('#rightarrowComic').click(() => {
    moveCarouselRight('comics')
  })
}

/**
 * Muy mono.
 */
function activateCarousels(mode) {
  $(`.left.${mode}`).click(() => {
    moveCarouselLeft(mode)
  })
  $(`.right.${mode}`).click(() => {
    moveCarouselRight(mode)
  })
}

function closeDialog() {
  deactivateKeys()
  deactivateButtons()
  activateArrows()
  $('.curtain').css('display', 'none')
  $('.dialog').css('display', 'none')
}

/**
 * Genera voto de personaje/comic y guarda
 */
function vote(mode) {
  $('.popup').css('display', 'block')
  if (Storage !== void(0)) {
    const newVote = {}
    newVote.nombre = $('#txtFirstName').val()
    newVote.apellido = $('#txtLastName').val()
    newVote.email = $('#txtEmail').val()
    newVote.telefono = $('#txtTfno').val()
    newVote.voto = $('#nameForm').text()
    if (mode === 'superheroes') {
      heroVotes.votos.push(newVote)
      localStorage.herovotes = JSON.stringify(heroVotes)
    } else {
      comicVotes.votos.push(newVote)
      localStorage.comicvotes = JSON.stringify(comicVotes)
    }
    setTimeout(() => { window.location = 'results.html' }, 3000)
  } else {
    closeDialog()
  }
}

/**
 * Abre dialogo y cambia estilo de control por teclado
 */
function openDialog(mode) {
  deactivateArrows()
  deactivateKeys()
  $(document).keydown((event) => {
    if (event.which === 27 || event.keyCode === 27) {
      closeDialog()
    }
    if (event.which === 13 || event.keyCode === 13) {
      vote(mode)
    }
  })
  $('.curtain').css('display', 'block')
  $('.dialog').css('display', 'flex')
  const getField = (mode === 'superheroes') ? '#name' : '#title'
  const voteName = $(getField).text()
  $('#nameForm').text(voteName)
  activateButtons(mode)
}


function activatePrincipal(mode) {
  $(`.principal.${mode}`).click(() => {
    openDialog(mode)
  })
}

/**
 * El motor de nuestro Slideshow, vamos cambiando el index a partir del cual se
 * dibuja el carrusel. Simple!
 * 
 * Esto... esto ha ido a peor. Mucho.
 * @param {*} index 
 */
function moveCarousel(mode, index) {
  const carouselMode = (mode === 'superheroes') ? '#carruselSuperheroes' : '#carruselComics'
  $(carouselMode).children().remove()
  
  let i
  if (index === -1) {
    i = petitionLength - 1
  } else if (index === petitionLength) {
    i = 0
  } else {
    i = index
  }
  
  const leftArrowId = (mode === 'superheroes') ? 'leftarrowSuper' : 'leftarrowComic'
  const rightArrowId = (mode === 'superheroes') ? 'rightarrowSuper' : 'rightarrowComic'

  const leftarrow = `<div id="${leftArrowId}" class="arrow" aria-label="Mueve selección a la izquierda"><img src="${arrow}" aria-labelledby="leftarrow" alt="Flecha izquierda"></div>`
  $(leftarrow).appendTo(carouselMode)
  let j = 0
  do {
    let carouselElement
    if (mode === 'superheroes') {
      const superhero = superheroes[i]
      const superheroPic = `${superhero.thumbnail.path}.${superhero.thumbnail.extension}`
      
      if (carouselClasses[j] !== 'principal') {
        carouselElement = `<div id="superhero${i}" data-name="${superhero.name}" class="superheroes ${carouselClasses[j]}"><img src="${superheroPic}" alt="${superhero.name}"></div>`
      } else {
        carouselElement = `<div id="superhero${i}" data-name=="${superhero.name}" class="superheroes ${carouselClasses[j]}" aria-label="${superhero.name}"><img src="${superheroPic}" aria-labelledby="${superhero.name}" alt="${superhero.name}"></div>`
        $('#currentHero').text(`${i + 1}/100`)
      }
    } else {
      const comic = comics[i]
      const comicPic = `${comic.thumbnail.path}.${comic.thumbnail.extension}`
      
      if (carouselClasses[j] !== 'principal') {
        carouselElement = `<div id="comiclist${i}" data-name="${comic.title}" class="comics ${carouselClasses[j]}"><img src="${comicPic}" alt="${comic.title}"></div>`
      } else {
        carouselElement = `<div id="comiclist${i}" data-name=="${comic.title}" class="comics ${carouselClasses[j]}" aria-label="${comic.title}"><img src="${comicPic}" aria-labelledby="${comic.title}" alt="${comic.title}"></div>`
        $('#currentComic').text(`${i + 1}/100`)
      }
    }

    $(carouselElement).appendTo(carouselMode)
    i += 1
    if (i === petitionLength) {
      i = 0
    }
    j += 1
  } while (j !== carouselLength)

  const rightarrow = `<div id="${rightArrowId}" class="arrow" aria-label="Mueve selección a la derecha"><img src="${arrow}" aria-labelledby="rightarrow" alt="Flecha derecha"></div>`
  $(rightarrow).appendTo(carouselMode)

  activateCarousels(mode)
  activatePrincipal(mode)
  activateArrows()
  refreshInfo(mode)
}

function deactivateButtons() {
  $('#btnReturn').off()
  $('#btnVote').off()
}

function activateButtons(mode) {
  $('#btnReturn').click(() => {
    closeDialog()
  })

  $('#btnVote').click(() => {
    vote(mode)
  })
}

/**
 * Cargamos votos! Weee!
 */
function loadVotes() {
  if (Storage !== void(0)) {
    if (localStorage.herovotes !== undefined) {
      heroVotes = JSON.parse(localStorage.herovotes)
    } else {
      heroVotes = { votos: [] }
      localStorage.herovotes = JSON.stringify(heroVotes)
    }

    if (localStorage.comicvotes !== undefined) {
      comicVotes = JSON.parse(localStorage.comicvotes)
    } else {
      comicVotes = { votos: [] }
      localStorage.comicvotes = JSON.stringify(comicVotes)
    }
  } else {
    $('.popup').find('p').first().text('¡Voto no realizado!')
    $('.popup').find('p').last().text('No se ha podido guardar el voto, lo sentimos.')
  }
}

const queryFor = option => ({
  superheroes: 'https://gateway.marvel.com/v1/public/characters',
  comics: 'https://gateway.marvel.com/v1/public/comics'
})[option]

function loadStuff(mode) {
  let aux = []
  const spinnerMode = (mode === 'superheroes') ? '.spinnerSuper' : '.spinnerComic'
  $(spinnerMode).append(`<img src="${spinner}"></img>`)
  $.getJSON(queryFor(mode), { limit: 100, apikey: publicKey }).done(function (response) {
    aux = response.data.results
    if (mode === 'superheroes') {
      superheroes = aux
    } else {
      comics = aux
    }
    moveCarousel(mode, 0)
    $(spinnerMode).empty()
  })
}

/**
 * Le debo una cerveza al creador de esto!
 */
function loadPaginators() {
  $('#paginatorSuperheroes').pagination({
    items: 100,
    itemsOnPage: 10,
    cssStyle: 'light-theme',
    onPageClick: (pageNum) => {
      moveCarousel('superheroes', (pageNum * 10) - 10)
    }
  })
  $('#paginatorComics').pagination({
    items: 100,
    itemsOnPage: 10,
    cssStyle: 'light-theme',
    onPageClick: (pageNum) => {
      moveCarousel('comics', (pageNum * 10) - 10)
    }
  })
}

$(document).ready(() => {
  loadStuff('superheroes')
  loadStuff('comics')
  loadPaginators()
  activateDescriptionToggle()
  loadVotes()
})

