document.addEventListener('DOMContentLoaded', function(){
    whenElementInScreen('.scrollspy', 'current', id => {
      var currentElement = document.querySelector(`.spy-links li a[href='#${id}']`);
      var allActived = document.querySelectorAll(`.spy-links li.active`);
      Array.prototype.forEach.call(allActived, i => i.classList.remove('active'));
      currentElement.parentElement.classList.add('active');
    });

    startMasks();
})

function startMasks(){
  let customInput = document.querySelector('#custom-input');
  Chameleon.init(customInput, '012345-CUS-6789-TOM');
}
