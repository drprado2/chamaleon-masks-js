M.AutoInit();
window.addEventListener('scroll', function (e) {
  if (window.pageYOffset > 10)
    document.querySelector('nav').classList.add('nav-fixed-scroll');
  else
    document.querySelector('nav').classList.remove('nav-fixed-scroll');
});

function whenElementInScreen(cssSelector, classToAdd, cbFunction){
  enableScrollListerner();

  var elements = document.querySelectorAll(cssSelector);
  for(var element of elements)
    window.spyScrollElements.push({element: element, callBack: cbFunction, classToAdd: classToAdd});
}

function enableScrollListerner(){
  if(!window.spyScrollElements){
    window.spyScrollElements = [];
    window.addEventListener('scroll', function(){
      var minElementHeight = 220;
      var minDistanceToInit = 80;
      for(var element of window.spyScrollElements){
        var elementYPosition = element.element.getBoundingClientRect().y;
        var screenHeight = window.screen.height;
        var screenYCenter = (screenHeight / 3);
        var elemHeight = element.element.clientHeight;
        elemHeight = elemHeight < minElementHeight ? minElementHeight : elemHeight;
        var intersecFactor = (elementYPosition + (elemHeight - minDistanceToInit)) - screenYCenter;
        var intersected = (intersecFactor >= 0) &&  ((elemHeight - minDistanceToInit) - intersecFactor >= 0);

        if(intersected){
          if(element.element.classList.contains('scroll-in'))
            continue;

          element.element.classList.add(element.classToAdd, 'scroll-in');
          element.callBack(element.element.id);
        }
        else
          element.element.classList.remove(element.classToAdd, 'scroll-in');
      }
    })
  }
}
