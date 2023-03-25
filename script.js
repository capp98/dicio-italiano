const form = document.forms[0];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  GetInputWord();
});

let proxy = 'https://cors-anywhere.herokuapp.com/';
let parser = new DOMParser();

function createCORSRequest(word) {
  let xhr = new XMLHttpRequest();
  let url =
    proxy +
    `https://www.dizionario-italiano.it/dizionario-italiano.php?parola=${word}`;

  if ('withCredentials' in xhr) {
    xhr.open('get', url, true);
  } else if (typeof XDomainRequest != 'undefined') {
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    xhr = null;
  }
  return xhr;
}

function GetInputWord() {
  let word = document.getElementById('word').value;
  GetWord(word);
}

function GetWord(word) {
  if (word === undefined) return;
  document.getElementById('loading').style.display = 'flex';
  console.log('Pesquisando');
  let request = createCORSRequest(word);
  request.send();

  request.onload = function () {
    let xmlDocument = new DOMParser().parseFromString(
      request.response,
      'text/html'
    );

    //   let definicoes = xmlDocument.querySelectorAll(".italiano");
    //   let gramaticas = xmlDocument.querySelectorAll(".grammatica");
    let elementos = xmlDocument.querySelectorAll('.paradigma ~ span');

    let element = document.createElement('div');

    let wordFound = document.createElement('h1');
    let wordSpelled = document.createElement('span');
    let pronounce = document.createElement('abbr');

    if (xmlDocument.querySelector('.lemma') != null) {
      wordFound.innerText =
        xmlDocument.querySelector('.lemma').childNodes[0].textContent;
      element.append(wordFound);

      if (xmlDocument.querySelector('small > span') != null) {
        wordSpelled.innerText =
          xmlDocument.querySelector('small > span').innerText;
        element.append(wordSpelled);
      }

      pronounce.innerText = xmlDocument.querySelector(
        '.paradigma > acronym'
      ).innerText;

      element.append(pronounce);

      let index = 1;

      elementos.forEach((elemento) => {
        if (elemento.className == 'grammatica') {
          let h3 = document.createElement('h3');
          h3.innerText = elemento.innerText;
          element.append(h3);

          index = 1;
        } else if (elemento.className == 'italiano') {
          let p = document.createElement('p');
          p.innerText = index++ + '. ';

          elemento.innerText.split(' ').forEach((palavra) => {
            let span = document.createElement('span');
            span.className = 'palavra';
            span.addEventListener('click', (e) => GetSpanWord(e));
            span.innerText = palavra + ' ';
            p.append(span);
          });
          element.append(p);
        }
      });

      let div = document.getElementById('ui');
      if (div.hasChildNodes()) div.removeChild(div.children[0]);
      div.prepend(element);
      document.getElementById('loading').style.display = 'none';
    } else {
      let element = document.createElement('div');

      let h1 = document.createElement('h1');
      h1.innerText = 'Palavra não encontrada';

      element.append(h1);

      let div = document.getElementById('ui');
      if (div.hasChildNodes()) div.removeChild(div.children[0]);
      div.prepend(element);
      document.getElementById('loading').style.display = 'none';
    }
  };
}

function GetSpanWord(e) {
  let word = e.target.innerText.replace(',', '').replace('.', '').trim();
  GetWord(word);
}
