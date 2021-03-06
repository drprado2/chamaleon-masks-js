document.addEventListener('DOMContentLoaded', function(){
    whenElementInScreen('.scrollspy', 'current', id => {
      var currentElement = document.querySelector(`.spy-links li a[href='#${id}']`);
      var allActived = document.querySelectorAll(`.spy-links li.active`);
      Array.prototype.forEach.call(allActived, i => i.classList.remove('active'));
      currentElement.parentElement.classList.add('active');
    });

})

Chameleon.init('#custom-input', '012345-CUS-6789-TOM');

Chameleon.init('#cpf', '999.999.999-99');
Chameleon.init('#cnpj', '99.999.999/0001-99');
Chameleon.init('#cep', '99999-999');
Chameleon.init('#telephone', '(99) 99999-9999');
Chameleon.init('#credit-card', '9999 9999 9999 9999');
Chameleon.initOptions('#cred-card-valid', {masks: [{mask: '99/99', placeholder: 'MM/YY'}]});

Chameleon.initOptions('#date', {masks: [{mask: '99/99/9999', placeholder: 'DD/MM/YYYY'}]});
Chameleon.initOptions('#hour', {masks: [{mask: '99:99:99', placeholder: 'HH:MM:SS'}]});

Chameleon.init('#cpf-cnpj', '999.999.999-99', '99.999.999/0001-99');
Chameleon.init('#telephone-multi', '(99) 9999-9999', '(99) 99999-9999');
Chameleon.initOptions('#multi-date', {masks: [{mask: '99/99/99', placeholder: 'DD/MM/YY'}, {mask: '99/99/9999', placeholder: 'DD/MM/YYYY'}]});

Chameleon.initOptions('#reverse-date', {masks: [{mask: '99/99/9999', placeholder: 'YYYY/MM/DD'}], reverseInput: true});

Chameleon.initOptions('#money-real',
{
  reverseInput: true,
  masks: [
    { mask: ".***,99", isMoney: true, moneyCountryMask: 'R$' }
  ]
});
Chameleon.initOptions('#money-dolar',
{
  reverseInput: true,
  masks: [
    { mask: ",***.99", isMoney: true, moneyCountryMask: '$' }
  ]
});

Chameleon.initOptions('#limited-date', { masks: [{ mask: "99[1-31]/99[1-12]/9999[1920-2018]", placeholder: 'DD/MM/YYYY' }] });
Chameleon.initOptions('#limited-time', { masks: [{ mask: "99[0-24]:99[0-59]", placeholder: 'HH:MM' }] });
Chameleon.init('#limited-custom', '99[0-6].999[800-999].999[500-600]-99[10-50]');

Chameleon.initOptions('#mix-date', { masks: [{ mask: "99[1-31]/99[1-12]/9999[2018-2020]", placeholder: 'YYYY/MM/DD' }],reverseInput: true});
Chameleon.initOptions('#mix-mult-infit', { masks: [{ mask: "999-999_99" },{ mask: "999-CHANGE-999+99@***@" }]});

Chameleon.init(infinit, "999.99-***-INFINITO-");
