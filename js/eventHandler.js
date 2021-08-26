var hideShow = document.querySelector("#hideShow");
var menu = document.querySelector(".menu");
var difA = document.querySelector('#difA');
var difB = document.querySelector('#difB');
var feedA= document.querySelector('#feed');
var killB= document.querySelector('#kill');

hideShow.addEventListener('click', (event) => {
	event.preventDefault();
	if(menu.classList.contains('show')) {
		menu.classList.remove('show');
		hideShow.innerHTML = 'Menu ↓'
	} else {
		menu.classList.add('show');
		hideShow.innerHTML = 'Menu ↑'
	}
});
let mousedown = false;
let leftClick = false;
canvas.addEventListener('mousedown', (event) => {
});
canvas.addEventListener('mousemove', (event) => {
});
canvas.addEventListener('mouseup', (event) => {
});
canvas.addEventListener('mousedown', (event) => {
	intX = event.offsetX;
	intY = event.offsetY;
	if (event.which == 3) {
		leftClick = true;
		remB(intX, intY);
	} else {
		leftClick = false;
		addB(intX, intY);
	}
	mousedown = true;
});
canvas.addEventListener('mousemove', (event) => {
	if(mousedown){
		intX = event.offsetX;
		intY = event.offsetY;
		if (leftClick) {
			remB(intX, intY);
		} else {
			addB(intX, intY);
		}
	}
});
canvas.addEventListener('mouseup', (event) => {
    mousedown = false;
});
window.addEventListener('contextmenu', function (e) { 
	// do something here... 
	e.preventDefault(); 
  }, false);

difA.addEventListener('input', () => {
	DiffusionA = map(difA.value, 0, 100, 0.5, 1);
});
difB.addEventListener('input', () => {
	DiffusionB = map(difB.value, 0, 100, 0.5, 1);
});
feedA.addEventListener('input', () => {
	feed = map(feedA.value, 0, 100, 0.02, 0.08);
});
killB.addEventListener('input', () => {
	kill = map(killB.value, 0, 100, 0.02, 0.08);
});