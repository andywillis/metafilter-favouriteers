(function () {

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  function handleError(error) {
    console.log(error);
  }

  function init() {
    const site = getSite();
    if (hasSite(site)) {
      addPopup();
      const favourites = getLinks();
      removeTitles(favourites);
      addListeners(favourites, site);
    }
  }

  init();

  function getSite() {
    return document.location.host.split('.')[0];
  }

  function hasSite(site) {
    return [
      'www', 'ask', 'metatalk', 'fanfare',
      'projects', 'music', 'podcast'
    ].includes(site);
  }

  function maxLengthName(names) {
    return Math.max.apply(null, names.map(name => name.length));
  }

  function showPopup(names, site, e) {
    const popup = qs('#popup');
    const joinedNames = names.join(', ');
    const len = joinedNames.length;
    const min = maxLengthName(names);
    let width = (min * 8) + (((len * 6) / 250) * 80);
    if (width > 600) width = 600;
    const templ = `<div class="popupclose">X</div><div class="names">${joinedNames}</div>`;
    popup.innerHTML = templ;
    popup.classList.add(`${site}color`);
    popup.style.width = `${width}px`;
    popup.style.left = `${e.pageX - (width / 2)}px`;
    popup.style.top = `${e.pageY + 10}px`;
    popup.style.display = 'inline';
    popup.style.position = 'absolute';
  }

  function handleData(data, site, e) {
    const favourites = data.favorites;
    const names = favourites.map(favourite => favourite.user_name);
    e.target.classList.remove('wait');
    showPopup(names, site, e);
  }

  function closePopup(e) {
    if (e.target.classList.contains('popupclose')) {
      qs('#popup').style.display = 'none';
    }
  }

  function addPopup() {
    const html = '<div id="popup"></div>';
    qs('body').insertAdjacentHTML('afterend', html);
    document.querySelector('#popup').addEventListener('click', closePopup, false);
  }

  function removeTitles(favourites) {
    favourites.forEach(function (favourite) {
      const fav = favourite.getAttribute('title');
      const regex = /^\d+/;
      if (regex.test(fav)) {
        const count = fav.match(regex)[0];
        favourite.setAttribute('data-favcount', count);
        favourite.removeAttribute('title');
        favourite.setAttribute('data-href', favourite.getAttribute('href'));
      }
    });
  }

  function getEndpoint(href) {
    const url = href.split('/');
    const lid = url.pop();
    const sid = url.pop();
    return `https://www.metafilter.com/favorited/${sid}/${lid}/json/`;
  }

  function showFavourites(site, e) {
    e.preventDefault();
    const { favcount, href } = e.target.dataset;
    if (favcount < 150) {
      e.target.classList.add('wait');
      fetch(getEndpoint(href))
        .then(response => response.text())
        .then(json => JSON.parse(json.replace(/\\'/g, '\'')))
        .then(data => handleData(data, site, e))
        .catch(handleError);
    } else {
      showPopup(['Too many names to show.'], site, e);
    }
  }

  function getLinks() {
    return qsa('span[id^="favcnt"] a');
  }

  function addListeners(favourites, site) {
    favourites.forEach(function (favourite) {
      favourite.addEventListener('click', showFavourites.bind(this, site), false);
    });
  }

}());
