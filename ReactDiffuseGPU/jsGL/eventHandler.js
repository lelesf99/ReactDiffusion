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
canvas.addEventListener('mousedown', (event) => {
	restart();
});
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
