let hideShow = document.querySelector("#hideShow");
let menu = document.querySelector(".menu");
let difA = document.querySelector('#difA');
let difB = document.querySelector('#difB');
let feedA = document.querySelector('#feed');
let killB = document.querySelector('#kill');
let stepSlider = document.querySelector('#steps');
let checkX = document.querySelector('#checkX');
let checkY = document.querySelector('#checkY');

let rangeSlider = document.querySelector('#range');
let offSlider = document.querySelector('#offset');

hideShow.addEventListener('click', (event) => {
	event.preventDefault();
	if (menu.classList.contains('show')) {
		menu.classList.remove('show');
		hideShow.innerHTML = 'Menu ↓'
	} else {
		menu.classList.add('show');
		hideShow.innerHTML = 'Menu ↑'
	}
});
canvas.addEventListener('mousedown', (event) => {
	intX = event.offsetX;
	intY = event.offsetY;
	restart(intX, intY);
});
difA.addEventListener('input', () => {
	DiffusionA = map(difA.value, 0, 100, 0.5, 1.0);
});
difB.addEventListener('input', () => {
	DiffusionB = map(difB.value, 0, 100, 0.35, 1.0);
});
feedA.addEventListener('input', () => {
	feed = map(feedA.value, 0, 100, 0.01, 0.09);
});
killB.addEventListener('input', () => {
	kill = map(killB.value, 0, 100, 0.01, 0.09);
});
rangeSlider.addEventListener('input', () => {
	range = map(rangeSlider.value, 0, 100, 1, 2);
});
offSlider.addEventListener('input', () => {
	offset = map(offSlider.value, 0, 100, 0.5, 1);
});
stepSlider.addEventListener('input', () => {
	step = stepSlider.value;
});
checkX.addEventListener('change', () => {
	swtchX = (checkX.checked);
});
checkY.addEventListener('change', () => {
	swtchY = (checkY.checked);
});
