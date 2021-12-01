var width = 600;
var height = 600;

var curGrid = [];
var nxtGrid = [];
var Binit = [50, 100];
let step = 1;

let DiffusionA = 1;
let DiffusionB = 0.5;
let feed = 0.045;
let kill = 0.060;

let range = 1;
let offset = 0.5;

for (let i = 0; i < width; i++) {
	curGrid[i] = [];
	for (let j = 0; j < height; j++) {
		let d = new Vector2(i, j).dist(new Vector2(width / 2, height / 2));
		if (d + Math.random() * 100 > Binit[0] && d + Math.random() * 100 < Binit[1]) {
			curGrid[i][j] = [
				0,
				Math.random(),
				0,
				0
			];
		} else {
			curGrid[i][j] = [
				1,
				0,
				0,
				0
			];
		}
	}
}
const offCanvas = document.createElement('canvas');
offCanvas.width = width;
offCanvas.height = height;
var offCtx = offCanvas.getContext('2d');
canvas = document.querySelector('canvas');
canvas.setAttribute('width', width);
canvas.setAttribute('height', height);
ctx = canvas.getContext('2d');


function animate() {
	ctx.clearRect(0, 0, width, height);
	myReq = requestAnimationFrame(animate);
	for (let i = 0; i < step; i++) {
		swapCalc(
			DiffusionA,
			DiffusionB,
			feed,
			kill
		);
	}
	render(range, offset);
	ctx.drawImage(offCanvas, 0, 0);
}
animate();

function render(range, offset) {
	const imageData = offCtx.createImageData(width, height);
	let k = 0;
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			k = (i + j * width) * 4

			let col = HSVtoRGB(curGrid[i][j][1] * range + offset, 1, 1);

			//if(bright < 0)bright *= -1;
			imageData.data[k + 0] = col.r * (1 - curGrid[i][j][0]);  // R value
			imageData.data[k + 1] = col.g * (1 - curGrid[i][j][0]);  // G value
			imageData.data[k + 2] = col.b * (1 - curGrid[i][j][0]);  // B value
			imageData.data[k + 3] = 255;  // A value
		}
	}
	offCtx.putImageData(imageData, 0, 0);
}

function swapCalc(
	DiffusionA,
	DiffusionB,
	feed,
	kill
) {
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {

			let A = curGrid[i][j][0];
			let B = curGrid[i][j][1];
			let fA = curGrid[i][j][0];
			let fB = curGrid[i][j][1];

			fA += (DiffusionA * Laplace('A', i, j) - A * B * B + feed * (1 - A));
			fB += (DiffusionB * Laplace('B', i, j) + A * B * B - (kill + feed) * B);

			curGrid[i][j][0] = fA;
			curGrid[i][j][1] = fB;
			curGrid[i][j][2] = A;
			curGrid[i][j][3] = B;
		}
	}
}
function Laplace(Chem, i, j) {
	let pstIndex;
	let futIndex;
	if (i == 0 || i == width - 1 || j == 0 || j == height - 1) return 0;
	if (Chem == 'B') {
		pstIndex = 1;
		futIndex = 3;
	} else {
		pstIndex = 0;
		futIndex = 2;
	}
	// [-1-1] [-1 0] [-1 1]
	// [0 -1] [i, j] [0  1]
	// [1 -1] [1  0] [1  1]

	// [fut] [fut] [fut]
	// [fut] [pst] [pst]
	// [pst] [pst] [pst]

	// [.05] [0.2] [.05]
	// [0.2] [ -1] [0.2]
	// [.05] [0.2] [.05]
	let sum = 0;

	sum += curGrid[i - 1][j - 1][futIndex] * 0.05;
	sum += curGrid[i - 1][j][futIndex] * 0.2;
	sum += curGrid[i - 1][j + 1][futIndex] * 0.05;

	sum += curGrid[i][j - 1][futIndex] * 0.2;
	sum += curGrid[i][j][pstIndex] * -1;
	sum += curGrid[i][j + 1][pstIndex] * 0.2;

	sum += curGrid[i + 1][j - 1][pstIndex] * 0.05;
	sum += curGrid[i + 1][j][pstIndex] * 0.2;
	sum += curGrid[i + 1][j + 1][pstIndex] * 0.05;

	return sum;
}

function addB(x, y) {
	for (let i = x - 10; i < x + 10; i++) {
		for (let j = y - 10; j < y + 10; j++) {
			if (i <= 0 || i >= width - 1 || j <= 0 || j >= height - 1) {
				continue;
			} else {
				curGrid[i][j][1] = 0.5;
			}
		}
	}
}
function remB(x, y) {
	for (let i = x - 20; i < x + 20; i++) {
		for (let j = y - 20; j < y + 20; j++) {
			if (i <= 0 || i >= width - 1 || j <= 0 || j >= height - 1) {
				continue;
			} else {
				curGrid[i][j][1] = 0;
			}
		}
	}
}