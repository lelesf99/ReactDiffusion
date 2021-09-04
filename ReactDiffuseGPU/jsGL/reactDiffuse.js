let width =  1080;
let height = 1080;

let curGrid = [];
let Binit = [10, 100];
let step = 8;

let DiffusionA = 1.0;
let DiffusionB = 0.4;
let feed = 0.045;
let kill = 0.060;

let range = 1;
let offset = 0.5;

let vertexShaderSource = `#version 300 es

	precision mediump float;

	in vec2 vertPosition;

	void main(){
		gl_Position = vec4(vertPosition, 0.0, 1.0);
	}

`;

let computeFragmentShaderSource = `#version 300 es
	precision highp float;
	
	uniform sampler2D u_texture;

	uniform float DiffusionA;
	uniform float DiffusionB;
	uniform float feed;
	uniform float kill;

	out vec4 fragColor;

	void main() {
		vec2 Fcd = vec2(
				gl_FragCoord.x / 1080.0, 
				gl_FragCoord.y / 1080.0
			);

		float A = texture(u_texture, Fcd).x;
		float B = texture(u_texture, Fcd).z;

		float fA = A;
		float fB = B;

		vec2 onePixel = vec2(1.0, 1.0) / 600.0;
		float LaplaceA =
			texture(u_texture, Fcd + onePixel * vec2(-1, -1)).x * 0.05  +
			texture(u_texture, Fcd + onePixel * vec2( 0, -1)).x * 0.2 +
			texture(u_texture, Fcd + onePixel * vec2( 1, -1)).x * 0.05 +
			texture(u_texture, Fcd + onePixel * vec2(-1,  0)).x * 0.2 +
			texture(u_texture, Fcd + onePixel * vec2( 0,  0)).x * -1.0 +
			texture(u_texture, Fcd + onePixel * vec2( 1,  0)).x * 0.2 +
			texture(u_texture, Fcd + onePixel * vec2(-1,  1)).x * 0.05 +
			texture(u_texture, Fcd + onePixel * vec2( 0,  1)).x * 0.2 +
			texture(u_texture, Fcd + onePixel * vec2( 1,  1)).x * 0.05;

		float LaplaceB =
			texture(u_texture, Fcd + onePixel * vec2(-1, -1)).z * 0.05  +
			texture(u_texture, Fcd + onePixel * vec2( 0, -1)).z * 0.2 +
			texture(u_texture, Fcd + onePixel * vec2( 1, -1)).z * 0.05 +
			texture(u_texture, Fcd + onePixel * vec2(-1,  0)).z * 0.2 +
			texture(u_texture, Fcd + onePixel * vec2( 0,  0)).z * -1.0 +
			texture(u_texture, Fcd + onePixel * vec2( 1,  0)).z * 0.2 +
			texture(u_texture, Fcd + onePixel * vec2(-1,  1)).z * 0.05 +
			texture(u_texture, Fcd + onePixel * vec2( 0,  1)).z * 0.2 +
			texture(u_texture, Fcd + onePixel * vec2( 1,  1)).z * 0.05;
		
		fA += (DiffusionA * LaplaceA - A * B * B + feed * (1.0 - A));
		fB += (DiffusionB * LaplaceB + A * B * B - (kill + feed) * B);

		// Divide the sum by the weight but just use rgb
		// we'll set alpha to 1.0
		fragColor = vec4(fA, 0.0, fB, 1.0);
	}
`;

let drawFragmentShaderSource = `#version 300 es
	precision highp float;
	
	uniform sampler2D u_texture;
	uniform float range;
	uniform float offset;

	out vec4 fragColor;

	// Taken from http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl.
	// All components are in the range [0…1], including hue.
	vec3 hsv2rgb(vec3 c)
	{
		vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
		vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
		return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
	}
	
	void main() {
		vec2 Fcd = vec2(
				gl_FragCoord.x / 1080.0, 
				gl_FragCoord.y / 1080.0
			);

		float A = texture(u_texture, Fcd).x;
		float B = texture(u_texture, Fcd).z;
		
		vec3 Bcolor = hsv2rgb(vec3(B * range + offset, 1.0, 1.0));

		// Divide the sum by the weight but just use rgb
		// we'll set alpha to 1.0
		fragColor = vec4(Bcolor.x * (1.0 - A), Bcolor.y * (1.0 - A), Bcolor.z * (1.0 - A), 1.0);
	}
`;


const canvas = document.querySelector("canvas");
canvas.width = width;
canvas.height = height;
// Initialize the GL context
const gl = canvas.getContext("webgl2");
// Only continue if WebGL is available and working
if (gl === null) {
	alert("Unable to initialize WebGL. Your browser or machine may not support it.");
}

gl.getExtension('EXT_color_buffer_float');
gl.getExtension('OES_texture_float_linear');

let vShader = gl.createShader(gl.VERTEX_SHADER);
let computeShader = gl.createShader(gl.FRAGMENT_SHADER);
let drawShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vShader, vertexShaderSource);
gl.shaderSource(computeShader, computeFragmentShaderSource);
gl.shaderSource(drawShader, drawFragmentShaderSource);

gl.compileShader(vShader);
if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
	console.error('ERROR compiling vertex shader', gl.getShaderInfoLog(vShader));
}
gl.compileShader(computeShader);
if (!gl.getShaderParameter(computeShader, gl.COMPILE_STATUS)) {
	console.error('ERROR compiling frag shader', gl.getShaderInfoLog(computeShader));
}
gl.compileShader(drawShader);
if (!gl.getShaderParameter(drawShader, gl.COMPILE_STATUS)) {
	console.error('ERROR compiling frag shader', gl.getShaderInfoLog(drawShader));
}

let computeProgram = gl.createProgram();
gl.attachShader(computeProgram, vShader);
gl.attachShader(computeProgram, computeShader);
gl.linkProgram(computeProgram);
if (!gl.getProgramParameter(computeProgram, gl.LINK_STATUS)) {
	console.error('ERROR linking computeProgram', gl.getProgramInfoLog(computeProgram));
}

let drawProgram = gl.createProgram();
gl.attachShader(drawProgram, vShader);
gl.attachShader(drawProgram, drawShader);
gl.linkProgram(drawProgram);
if (!gl.getProgramParameter(drawProgram, gl.LINK_STATUS)) {
	console.error('ERROR linking computeProgram', gl.getProgramInfoLog(drawProgram));
}

//setup sampler texture
let normalData = [];
for (let i = 0; i < width; i++) {
	for (let j = 0; j < height; j++) {
		let d = new Vector2(i, j).dist(new Vector2(width/2, height/2));
		if(d + Math.random() * 100 > Binit[0] && d + Math.random() * 100 < Binit[1]) {
			normalData[(i + j * width) * 4 + 0] = 0;
			normalData[(i + j * width) * 4 + 1] = 0;
			normalData[(i + j * width) * 4 + 2] = Math.random();
			normalData[(i + j * width) * 4 + 3] = 1;
		} else {
			normalData[(i + j * width) * 4 + 0] = 1;
			normalData[(i + j * width) * 4 + 1] = 0;
			normalData[(i + j * width) * 4 + 2] = 0;
			normalData[(i + j * width) * 4 + 3] = 1;
		}
	}
}

let textures = [];

// Create current texture
textures[0] = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, textures[0]);
let level = 0;
let texWidth = width;
let texHeight = height;
let data = new Float32Array(normalData);

gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA32F, texWidth, texHeight, 0, gl.RGBA, gl.FLOAT, data);

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);


//Create future texture

textures[1] = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, textures[1]);

gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA32F, texWidth, texHeight, 0, gl.RGBA, gl.FLOAT, null);

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

const frameBuffers = [];

// Create and bind the framebuffer
frameBuffers[0] = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[0]);
 
// attach the texture as the first color attachment
gl.framebufferTexture2D(
    gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[1], level);

// Create and bind the framebuffer
frameBuffers[1] = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[1]);
 
// attach the texture as the first color attachment
gl.framebufferTexture2D(
    gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[0], level);

// Uniform locations
var samplerLocs = [];
samplerLocs[0] = gl.getUniformLocation(computeProgram, 'u_texture');
samplerLocs[1] = gl.getUniformLocation(drawProgram, 'u_texture');

let DiffusionALoc = gl.getUniformLocation(computeProgram, 'DiffusionA');
let DiffusionBLoc = gl.getUniformLocation(computeProgram, 'DiffusionB');
let feedLoc = gl.getUniformLocation(computeProgram, 'feed');
let killLoc = gl.getUniformLocation(computeProgram, 'kill');

let rangeLoc = gl.getUniformLocation(drawProgram, 'range');
let offsetLoc = gl.getUniformLocation(drawProgram, 'offset');

let verts = [
    -1.0,  1.0,
     1.0,  1.0,
    -1.0, -1.0,
     1.0, -1.0,
];

let vertBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

let positionAttrLocation = gl.getAttribLocation(computeProgram, 'vertPosition');
gl.vertexAttribPointer(
	positionAttrLocation, 					//Attr location
	2,										//Number elements per attr
	gl.FLOAT,								//type
	gl.FALSE,								
	2 * Float32Array.BYTES_PER_ELEMENT,		//Size of an individual vertex
	0										//offset
);
gl.enableVertexAttribArray(positionAttrLocation);

let flipFlop = 0;
function animate() {
	let unit = 0;

	requestAnimationFrame(animate);

	gl.useProgram(computeProgram);

	for (let i = 0; i < step; i++) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[flipFlop + i%2]);

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.activeTexture(gl.TEXTURE0 + unit);
		gl.bindTexture(gl.TEXTURE_2D, textures[flipFlop + i%2]);

		gl.uniform1i(samplerLocs[0], unit);

		gl.uniform1f(DiffusionALoc, DiffusionA);
		gl.uniform1f(DiffusionBLoc, DiffusionB);
		gl.uniform1f(feedLoc, feed);
		gl.uniform1f(killLoc, kill);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	gl.useProgram(drawProgram);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.activeTexture(gl.TEXTURE0 + unit);
	gl.bindTexture(gl.TEXTURE_2D, textures[flipFlop]);

	gl.uniform1i(samplerLocs[1], unit);
	gl.uniform1f(rangeLoc, range);
	gl.uniform1f(offsetLoc, offset);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	if (flipFlop == 0) {
		flipFlop = 1;
	} else {
		flipFlop = 0;
	}

}
animate();

function restart() {
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			let d = new Vector2(i, j).dist(new Vector2(width/2, height/2));
			if(d + Math.random() * 100 > Binit[0] && d + Math.random() * 100 < Binit[1]) {
				normalData[(i + j * width) * 4 + 0] = 0;
				normalData[(i + j * width) * 4 + 1] = 0;
				normalData[(i + j * width) * 4 + 2] = Math.random();
				normalData[(i + j * width) * 4 + 3] = 1;
			} else {
				normalData[(i + j * width) * 4 + 0] = 1;
				normalData[(i + j * width) * 4 + 1] = 0;
				normalData[(i + j * width) * 4 + 2] = 0;
				normalData[(i + j * width) * 4 + 3] = 1;
			}
		}
	}
	
	data = new Float32Array(normalData);

	gl.bindTexture(gl.TEXTURE_2D, textures[0]);

	gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA32F, texWidth, texHeight, 0, gl.RGBA, gl.FLOAT, data);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);


	gl.bindTexture(gl.TEXTURE_2D, textures[1]);

	gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA32F, texWidth, texHeight, 0, gl.RGBA, gl.FLOAT, data);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}