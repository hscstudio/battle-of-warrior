var dropzone = document.getElementById('dropzone');
var heroes = document.getElementsByClassName('hero');
var audioCollision = document.getElementById('collision');
var audioDeath = document.getElementById('death');
var audioMoving = document.getElementById('moving');
var audioHealth = document.getElementById('health');
var audioVictory = document.getElementById('victory');
var divScoreLeft = document.getElementById('scoreLeft');
var divScoreRight = document.getElementById('scoreRight');
var divHeroesLeft = document.getElementById('heroesLeft');
var divHeroesRight = document.getElementById('heroesRight');
var divBlocksLeft = document.getElementById('blocksLeft');
var divBlocksRight = document.getElementById('blocksRight');
var btnExecGame = document.getElementById('execGame');
var divTimer = document.getElementById('timer');
var actionGames = document.getElementsByClassName('action-game');
var selectedHeroes = [];
var startX = 0;
var startY = 0;
var isDragging = false;
var mainIntervalID = null

function notify (msg) {
  UIkit.notification({
    message: msg,
    pos: 'top-center',
  });
}

function saveState() {
  var heroes = dropzone.innerHTML;
  localStorage.setItem('heroes', heroes);
  notify('<span uk-icon=\'icon: check\'></span> saved game state')
}

function clearState() {
  localStorage.setItem('heroes', "");
  dropzone.innerHTML = "";
  notify('<span uk-icon=\'icon: check\'></span> clear game state')
}

function getHeroImage(role, position) {
  var imagePath = 'assets/' + position + '/'
  if (role == 'king') imagePath += '1.png'
  else if (role == 'queen') imagePath += '2.png'
  else if (role == 'commander') imagePath += '3.png'
  else if (role == 'troop') imagePath += '4.png'
  else if (role == 'informan') imagePath += '5.png'
  else if (role == 'block-x') imagePath += '6.png'
  else if (role == 'block-y') imagePath += '7.png'
  return imagePath
}

function getPower(role) {
  var power = 0
  if (role == 'king') power = 100
  else if (role == 'queen') power = 85
  else if (role == 'commander') power = 75
  else if (role == 'troop') power = 50
  else if (role == 'informan') power = 25
  else if (role == 'block-x') power = 150
  else if (role == 'block-y') power = 150
  return power
}

function getDamage(role) {
  var damage = 0
  if (role == 'king') damage = 10
  else if (role == 'queen') damage = 5
  else if (role == 'commander') damage = 15
  else if (role == 'troop') damage = 7
  else if (role == 'informan') damage = 5
  else if (role == 'block-x') damage = 1
  else if (role == 'block-y') damage = 1
  return damage
}

function getDataAttr(object, dataName) {
  return object.getAttribute('data-'+dataName);
}

function setDataAttr(object, dataName, dataVal) {
  object.setAttribute('data-'+dataName, dataVal);
}

function addHero(role, position, type = 'people') {
  var hero = document.createElement('img');
  hero.src = getHeroImage(role, position);
  setDataAttr(hero, 'type', type);
  setDataAttr(hero, 'role', role);
  setDataAttr(hero, 'position', position);
  var power = getPower(role)
  var damage = getDamage(role)
  setDataAttr(hero, 'power', power);
  setDataAttr(hero, 'max-power', power);
  setDataAttr(hero, 'damage', damage);

  var progress = '<progress value="'+power+'" max="'+power+'"></progress>'
  const tooltipText = role + ' - ' + position + '<br>' + progress;
  hero.setAttribute('uk-tooltip', tooltipText);
  hero.classList.add('hero');
  hero.classList.add(role);
  hero.setAttribute('draggable', 'true');
  hero.style.left = (window.innerWidth * 0.20) + 'px'
  hero.style.top = (dropzone.offsetHeight * Math.random()) + 'px'
  if (position == 'right') {
    hero.style.left =  (window.innerWidth * 0.70) + 'px'

    hero.style.transform = 'scaleX(-1)'
  }
  heroes = [...heroes, hero]
  dropzone.appendChild(hero);
  addEventListener()
  notify('<span uk-icon=\'icon: check\'></span> creating hero ' + role + ' - ' + position)
}

function updateSelectedStyles() {
  Array.from(heroes).forEach(function(hero) {
    if (selectedHeroes.includes(hero)) {
      hero.classList.add('selected');
    } else {
      hero.classList.remove('selected');
    }
  });
}

const addEventListener = () => {
  Array.from(heroes).forEach(function(hero) {
    hero.addEventListener('mousedown', function(event) {
      isDragging = false;
      if (!event.shiftKey) selectedHeroes = [];

      if (!selectedHeroes.includes(hero)) {
        selectedHeroes.push(hero);
      }

      updateSelectedStyles();
  });

  hero.addEventListener('mousemove', function(event) {
      if (event.buttons === 1 && selectedHeroes.includes(hero)) {
      isDragging = true;
      var rect = dropzone.getBoundingClientRect();
      var dropX = event.clientX - rect.left;
      var dropY = event.clientY - rect.top;

      selectedHeroes.forEach(function(selectedHero) {
          moveObjectTo(selectedHero, (dropX - startX + selectedHero.offsetLeft) + 'px', (dropY - startY + selectedHero.offsetTop) + 'px')
      });
      }
  });
  });
}

function handleCollision(objA, objB) {
  var translationAmount = 7.5; // Adjust the translation amount for elementA as desired

  var positionA = objA.getBoundingClientRect();
  var positionB = objB.getBoundingClientRect();

  var deltaX = positionA.left - positionB.left;

  var targetType = getDataAttr(objB, 'type')

  if (targetType != 'block') {
    if (deltaX > 0) {
      objB.style.left = (positionB.left - (7 * translationAmount)) + 'px';
    } else {
      objB.style.left = (positionB.left - (3 * translationAmount) ) + 'px';
    }
  }

  // get power & damage
  var roleA = getDataAttr(objA, 'role')
  var roleB = getDataAttr(objB, 'role')
  var powerA = getDataAttr(objA, 'power')
  var powerB = getDataAttr(objB, 'power')
  var maxPowerA = getDataAttr(objA, 'max-power')
  var maxPowerB = getDataAttr(objB, 'max-power')
  var damageA = getDataAttr(objA, 'damage')
  var damageB = getDataAttr(objB, 'damage')
  var positionA = getDataAttr(objA, 'position')
  var positionB = getDataAttr(objB, 'position')

  // random damage
  var newDamageA = Math.random() * damageA
  var newDamageB = Math.random() * damageB

  // minus power from damage
  powerA = powerA - newDamageB
  powerB = powerB - newDamageA

  setDataAttr(objA, 'power', powerA)
  setDataAttr(objB, 'power', powerB)

  var progressA = '<progress value="'+powerA+'" max="'+maxPowerA+'"></progress>'
  var progressB = '<progress value="'+powerB+'" max="'+maxPowerB+'"></progress>'

  var tooltipTextA = roleA + ' - ' + positionA + '<br>' + progressA;
  var tooltipTextB = roleB + ' - ' + positionB + '<br>' + progressB;
  
  objA.setAttribute('uk-tooltip', tooltipTextA)
  objB.setAttribute('uk-tooltip', tooltipTextB)

  if (powerA <= 0) {
    audioDeath.play()
    dropzone.removeChild(objA);
  } else {
    objA.style.opacity = powerA / maxPowerA
  }

  if (powerB <= 0) {
    audioDeath.play()
    dropzone.removeChild(objB);
  } else {
    objB.style.opacity = powerB / maxPowerB
  }
}

function detectCollision(objA, objB) {
  
  var rectA = objA.getBoundingClientRect();
  var rectB = objB.getBoundingClientRect();

  var collision = !(rectA.right < rectB.left || 
                    rectA.left > rectB.right || 
                    rectA.bottom < rectB.top || 
                    rectA.top > rectB.bottom);
  if (collision) {
    audioCollision.play();
    handleCollision(objA, objB)
  }
  return collision;
}

function moveObjectTo(objectToMove, x, y) {
  var startX = parseInt(objectToMove.style.left, 10) || 0;
  var startY = parseInt(objectToMove.style.top, 10) || 0;
  var deltaX = x - startX;
  if (deltaX > 0) objectToMove.style.transform = 'scaleX(1)'
  else objectToMove.style.transform = 'scaleX(-1)'
  var deltaY = y - startY;
  var steps = 50; // Number of steps for the movement
  var stepX = deltaX / steps;
  var stepY = deltaY / steps;
  var currentStep = 0;

  audioMoving.play()

  var intervalID = setInterval(function() {
    heroes = document.getElementsByClassName('hero');
    var isCollision = false
    var heroCollision = null
    Array.from(heroes).forEach(function(hero) {
      if (getDataAttr(hero, 'position') !== getDataAttr(objectToMove, 'position')) {
        if (detectCollision(objectToMove, hero)) {
          isCollision = true
          heroCollision = hero
          clearInterval(intervalID)
          audioMoving.pause();
          audioMoving.currentTime = 0;
        }
      }
    })

    if (isCollision) {
      var positionA = objectToMove.getBoundingClientRect();
      var positionB = heroCollision.getBoundingClientRect();
      var deltaX = positionA.left - positionB.left;
      var targetType = getDataAttr(heroCollision, 'type')
      if (targetType == 'block') {
        if (deltaX > 0) {
          startX -= 2 * stepX;
          startY -= 2 * stepY;
          objectToMove.style.left = startX + 'px';
          objectToMove.style.top = startY + 'px';
        } else {
          startX += 2 * stepX;
          startY += 2 * stepY;
          objectToMove.style.left = startX + 'px';
          objectToMove.style.top = startY + 'px';
        }
      }
    } else {
      if (currentStep >= steps) {
        clearInterval(intervalID);
        audioMoving.pause();
        audioMoving.currentTime = 0;
      } else {
        startX += stepX;
        startY += stepY;
        objectToMove.style.left = startX + 'px';
        objectToMove.style.top = startY + 'px';
        currentStep++;
      }
    }
  }, 50);
}

function detectNearObject(object, targetObject, radius = 100) {
  var rect = object.getBoundingClientRect();
  var targetRect = targetObject.getBoundingClientRect();

  var rectCenterX = rect.left + rect.width / 2;
  var rectCenterY = rect.top + rect.height / 2;

  var targetCenterX = targetRect.left + targetRect.width / 2;
  var targetCenterY = targetRect.top + targetRect.height / 2;

  var distanceX = Math.abs(rectCenterX - targetCenterX);
  var distanceY = Math.abs(rectCenterY - targetCenterY);

  var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

  return distance <= radius;
}

window.addEventListener('load', function() {
  var savedHeroes = localStorage.getItem('heroes');
  if (savedHeroes) {
    dropzone.innerHTML = savedHeroes;
    addEventListener()
    notify('<span uk-icon=\'icon: check\'></span> loaded state')
  }

  actionGames = document.getElementsByClassName('action-game');
  Array.from(actionGames).forEach(function(action) {
    action.setAttribute('disabled', 'disabled')
  })
});

document.addEventListener('mouseup', function() {
  if (isDragging) {
    isDragging = false;
  }
});

dropzone.addEventListener('mousedown', function(event) {
  if (event.target === dropzone) {
    var rect = dropzone.getBoundingClientRect();
    var dropX = event.clientX - rect.left;
    var dropY = event.clientY - rect.top;

    selectedHeroes.forEach(function(selectedHero) {
        moveObjectTo(selectedHero, dropX, dropY)
    });
    selectedHeroes = [];
    updateSelectedStyles();
  }
});

dropzone.addEventListener('mousemove', function(event) {
  if (event.buttons === 1 && event.target === dropzone) {
    var rect = dropzone.getBoundingClientRect();
    var selectionRect = {
      left: Math.min(startX, event.clientX) - rect.left,
      top: Math.min(startY, event.clientY) - rect.top,
      width: Math.abs(event.clientX - startX),
      height: Math.abs(event.clientY - startY)
    };

    selectedHeroes = [];

    Array.from(heroes).forEach(function(hero) {
      var heroRect = hero.getBoundingClientRect();

      if (
        heroRect.left >= selectionRect.left &&
        heroRect.top >= selectionRect.top &&
        heroRect.right <= selectionRect.left + selectionRect.width &&
        heroRect.bottom <= selectionRect.top + selectionRect.height
      ) {
        selectedHeroes.push(hero);
      }
    });
    // if (selectedHeroes.length > 0) console.log('select: ' + selectedHeroes.length + ' el')

    updateSelectedStyles();
  }
});

document.addEventListener('keydown', function(event) {
  const key = event.key; // const {key} = event; ES6+
  if (key === "Delete" || key === 'Backspace') {
    selectedHeroes.forEach(function(selectedHero) {
      dropzone.removeChild(selectedHero);
    });
    notify('Dropped hero') 
  }
  if (key === "Escape") {
    selectedHeroes = []
    updateSelectedStyles()
  }
  if (key === "ArrowUp") {
    selectedHeroes.forEach(function(selectedHero) {
      var currentPos = parseInt(selectedHero.style.top, 10);
      var newPos = currentPos - 1;
      selectedHero.style.top = newPos + 'px';
    });
  }

  if (key === "ArrowRight") {
    selectedHeroes.forEach(function(selectedHero) {
      var currentPos = parseInt(selectedHero.style.left, 10);
      var newPos = currentPos + 1;
      selectedHero.style.left = newPos + 'px';
      selectedHero.style.transform = 'scaleX(1)'
    })
  }

  if (key === "ArrowDown") {
    selectedHeroes.forEach(function(selectedHero) {
      var currentPos = parseInt(selectedHero.style.top, 10);
      var newPos = currentPos + 1;
      selectedHero.style.top = newPos + 'px';
    })
  }

  if (key === "ArrowLeft") {
    selectedHeroes.forEach(function(selectedHero) {
      var currentPos = parseInt(selectedHero.style.left, 10);
      var newPos = currentPos - 1;
      selectedHero.style.left = newPos + 'px';
      selectedHero.style.transform = 'scaleX(-1)'
    })
  }

});

function setZoom(zoom, el) {     
  transformOrigin = [0,0];
  el = el || instance.getContainer();
  var p = ["webkit", "moz", "ms", "o"],
        s = "scale(" + zoom + ")",
        oString = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";

  for (var i = 0; i < p.length; i++) {
      el.style[p[i] + "Transform"] = s;
      el.style[p[i] + "TransformOrigin"] = oString;
  }

  el.style["transform"] = s;
  el.style["transformOrigin"] = oString;
}

//setZoom(5,document.getElementsByClassName('container')[0]);

function showVal(a){
  var zoomScale = Number(a);
  setZoom(zoomScale, dropzone)
}

function getOneRandomObject(arrayOfObject, param, pos) {
  var filteredArray = Array.from(arrayOfObject).filter(function(hero) {
    var position = getDataAttr(hero, 'position')
    var role = getDataAttr(hero, 'role')
    var type = getDataAttr(hero, 'type')
    if (position === pos && type!=='block') {
      if (param == 'top') {
        return ['king', 'queen', 'commander'].includes(role)
      }
      else return true
    }
  });

  if (filteredArray.length === 0) {
    return null; // Return null if no object with the specified id is found
  }

  var randomIndex = Math.floor(Math.random() * filteredArray.length);
  return filteredArray[randomIndex];
}

function action(actionType, param = 'all', pos) {  
  if (actionType == 'select') {
    selectedHeroes = []
    Array.from(heroes).forEach(function(hero) {
      var position = getDataAttr(hero, 'position')
      var role = getDataAttr(hero, 'role')
      var type = getDataAttr(hero, 'type')  
      if (position == pos && type!=='block') {
        if (param == 'all') {
          selectedHeroes.push(hero)
        }
        else if (param == 'soldiers') {
          if (!['king', 'queen'].includes(role)) {
            selectedHeroes.push(hero)
          }
        } else if (param == 'top') {
          if (['king', 'queen'].includes(role)) {
            selectedHeroes.push(hero)
          }
        }
      }
    })
  }

  if (actionType=='scatter'){
    selectedHeroes.forEach(function(selectedHero) {
      var dropX = parseInt(selectedHero.style.left) + (Math.floor(Math.random() * (100 - (-100) + 1)) + (-100))
      var dropY = parseInt(selectedHero.style.top) + (Math.floor(Math.random() * (100 - (-100) + 1)) + (-100))
      moveObjectTo(selectedHero, dropX, dropY)
    })
  }

  if (actionType=='attack'){
    var target = getOneRandomObject(heroes, param, pos)
    selectedHeroes.forEach(function(selectedHero) {
      if (target) {
        var dropX = parseInt(target.style.left)
        var dropY = parseInt(target.style.top)
        moveObjectTo(selectedHero, dropX, dropY)
      }
    })
  }

  updateSelectedStyles()
}


function updateTimer(timer, startTime) {
  var currentTime = Date.now() - startTime;
  var hours = Math.floor(currentTime / 3600000);
  var minutes = Math.floor((currentTime % 3600000) / 60000);
  var seconds = Math.floor((currentTime % 60000) / 1000);

  // Format the time values to ensure they always have two digits
  var formattedTime = formatTime(hours) + ':' + formatTime(minutes) + ':' + formatTime(seconds);

  timer.textContent = formattedTime;
}

function formatTime(time) {
  return time.toString().padStart(2, '0');
}


function startGame() {
  btnExecGame.innerHTML = "Stop Game"
  var startTime = Date.now();

  mainIntervalID = setInterval(() => {
    updateTimer(timer, startTime)
    var scoreLeft = 0
    var scoreRight = 0
    var heroesLeft = 0
    var heroesRight = 0
    var blocksLeft = 0
    var blocksRight = 0
    var heroes = document.getElementsByClassName('hero');
    Array.from(heroes).forEach(function(hero) {
      // get power & damage
      var type = getDataAttr(hero, 'type')
      var role = getDataAttr(hero, 'role')
      var position = getDataAttr(hero, 'position')
      var power = getDataAttr(hero, 'power')
      power = parseInt(power)
      var maxPower = getDataAttr(hero, 'max-power')
      // var damage = getDataAttr(hero, 'damage')
      var position = getDataAttr(hero, 'position')
      var newPower = parseInt(power, 10)
      if (power < maxPower) {
        newPower = newPower + 1
        setDataAttr(hero, 'power', newPower)
        var progress = '<progress value="'+newPower+'" max="'+maxPower+'"></progress>'
        var tooltipText = role + ' - ' + position + '<br>' + progress;
        hero.setAttribute('uk-tooltip', tooltipText)
        hero.style.opacity = newPower / maxPower
        if ((newPower / maxPower) >= 0.99) {
          audioHealth.play()
        }
      }

      if (position == 'left') {
        if (type != 'block') scoreLeft += newPower
        if (type == 'block') blocksLeft++
        else heroesLeft++
      }
      if (position == 'right') {
        if (type != 'block') scoreRight += newPower
        if (type == 'block') blocksRight++
        else heroesRight++
      }

      if (type !== 'block') {
        // detectNearObject(hero)
        Array.from(heroes).forEach(function(hero2) {
          var position2 = getDataAttr(hero2, 'position')
          var type = getDataAttr(hero2, 'type')
          if (type !== 'block' && position2!=position) {
            var isNear = detectNearObject(hero, hero2, 100)
            if (isNear) {
              var dropX = parseInt(hero2.style.left)
              var dropY = parseInt(hero2.style.top)
              moveObjectTo(hero, dropX, dropY)
            }
          }
        })
      }
    })
    divScoreLeft.innerHTML = scoreLeft
    divScoreRight.innerHTML = scoreRight
    divHeroesLeft.innerHTML = heroesLeft
    divHeroesRight.innerHTML = heroesRight
    divBlocksLeft.innerHTML = blocksLeft
    divBlocksRight.innerHTML = blocksRight


    if (scoreLeft <= 0 && scoreRight > 0) {
      stopGame()
      notify('Right victory &#x1F389;')
      audioVictory.play()
      action('select', 'all', 'right')
      action('scatter')
    }
    if (scoreRight <= 0 && scoreLeft > 0) {
      stopGame()
      notify('Left victory &#x1F389;')  
      audioVictory.play()
      action('select', 'all', 'left')
      action('scatter')
    }
  }, 1000);

  actionGames = document.getElementsByClassName('action-game');
  Array.from(actionGames).forEach(function(action) {
    action.removeAttribute('disabled')
  })
}

function stopGame() {
  btnExecGame.innerHTML = "Start Game"
  clearInterval(mainIntervalID)
  actionGames = document.getElementsByClassName('action-game');
  Array.from(actionGames).forEach(function(action) {
    action.setAttribute('disabled', 'disabled')
  })
}

function execGame() {
  if (mainIntervalID) stopGame()
  else startGame()
}
