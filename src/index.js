import Chameleon from './Chameleon';

M.AutoInit();
window.addEventListener('scroll', function (e) {
  if (window.pageYOffset > 10)
    document.querySelector('nav').classList.add('nav-fixed-scroll');
  else
    document.querySelector('nav').classList.remove('nav-fixed-scroll');
});

let reais = document.querySelector('#money-real');
let dolar = document.querySelector('#money-dolar');
let telephone = document.querySelector('#telephone');
let telephoneMulti = document.querySelector('#telephone-multi');
let cpf = document.querySelector('#cpf');
let cnpj = document.querySelector('#cnpj');
let cep = document.querySelector('#cep');
let cpfCnpj = document.querySelector('#cpf-cnpj');
let date = document.querySelector('#date');
let hour = document.querySelector('#hour');
let infinitPhone = document.querySelector('#infinit-phone');
let infinit = document.querySelector('#infinit');

Chameleon.initOptions('#money-real', { reverseInput: true, masks: [{ mask: ".***,99", isMoney: true, moneyCountryMask: 'R$' }] });
Chameleon.initOptions(dolar, { reverseInput: true, masks: [{ mask: ",***.99", isMoney: true, moneyCountryMask: '$' }] });
Chameleon.init(telephone, "(99) 9999-99999");
Chameleon.init(telephoneMulti, "(99) 9999-9999", "(99) 99999-9999");
Chameleon.init(infinitPhone, "(99) 99999-9999*", "(99) 9999-9999");
Chameleon.init(infinit, "***-INFINITO-");
Chameleon.init(cpf, "999.999.999-99");
Chameleon.init(cnpj, "99.999.999/9999-99");
Chameleon.init(cep, "99999-999");
Chameleon.init(cpfCnpj, "99.999.999/9999-99", "999.999.999-99");
Chameleon.initOptions(date, { masks: [{ mask: "99[1-31]/99[1-12]/9999[1920-2018]", placeholder: 'DD/MM/YYYY' }] });
Chameleon.initOptions(hour, { masks: [{ mask: "99[0-24]:99[0-60]", placeholder: 'HH:MM' }] });

let btnMenu = document.querySelector('.sidenav-btn-trigger');
let menuId = btnMenu.getAttribute('data-target');
let menu = document.querySelector(`#${menuId}`);
btnMenu.onclick = function () {
  menu.classList.toggle('nav-menu-open');
  let navsDependencies = document.querySelectorAll('.menu-dep');
  navsDependencies.forEach(n => n.classList.toggle('padding-menu'));
}
