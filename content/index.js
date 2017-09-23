(function () {

  let timer;

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  function handleError(error) {
    console.log(error);
  }

  function showPopup(names, e) {
    const popup = qs('#popup');
    popup.innerHTML = names.join(', ');
    popup.style.left = `${e.pageX}px`;
    popup.style.top = `${e.pageY}px`;
    popup.style.display = 'inline';
    popup.style.position = 'absolute';
  }

  function handleData(data, e) {
    const favourites = data.favorites;
    const names = favourites.map(favourite => favourite.user_name);
    showPopup(names, e);
  }

  function addPopup() {
    const html = '<div id="popup"></div>';
    qs('body').insertAdjacentHTML('afterend', html);
  }

  function removeTitles(favourites) {
    favourites.forEach(function (favourite) {
      favourite.removeAttribute('title');
    });
  }

  function getEndpoint(href) {
    const url = href.split('/');
    const lid = url.pop();
    const sid = url.pop();
    return `https://www.metafilter.com/favorited/${sid}/${lid}/json`;
  }

  function showFavourites(e) {
    fetch(getEndpoint(e.target.href))
      .then(response => response.json())
      .then(data => handleData(data, e))
      .catch(handleError);
  }

  function hideFavourites() {
    qs('#popup').style.display = 'none';
    clearTimeout(timer);
  }

  function pauseHover(e) {
    timer = setTimeout(function () {
      showFavourites(e);
    }, 300);
  }

  function getLinks() {
    return qsa('span[id^="favcnt"] a');
  }

  function addListeners(favourites) {
    favourites.forEach(function (favourite) {
      favourite.addEventListener('mouseover', pauseHover, false);
      favourite.addEventListener('mouseout', hideFavourites, false);
    });
  }

  function init() {
    addPopup();
    const favourites = getLinks();
    removeTitles(favourites);
    addListeners(favourites);
  }

  init();

}());
