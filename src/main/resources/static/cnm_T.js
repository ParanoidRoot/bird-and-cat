// vertex shader
var BILIBILI_VERTEX_SHADER_SOURCE =
	`
	attribute vec4 vPosition;
	attribute vec4 vNormal;
	varying vec3 N, L, E;
	uniform mat4 modelViewMatrix;
	uniform mat4 projectionMatrix;
	uniform vec4 lightPosition;

	attribute vec4 a_TexCoord;
	varying vec2 v_TexCoord;
	
	void main()
	{
		vec3 pos = -(modelViewMatrix * vPosition).xyz;
		vec3 light = lightPosition.xyz;
		L = normalize( light - pos );
		E = -pos;
		N = normalize( (modelViewMatrix*vNormal).xyz);
		gl_Position = projectionMatrix * modelViewMatrix * vPosition;
		v_TexCoord = a_TexCoord;
	}
`;
// fragment shader
var BILIBILI_FRAGMENT_SHADER_SOURCE =
	`

	precision mediump float;
	uniform vec4 ambientProduct;
	uniform vec4 diffuseProduct;
	uniform vec4 specularProduct;
	uniform float shininess;
	varying vec3 N, L, E;

	uniform sampler2D u_Sampler;
	varying vec2 v_TexCoord;

	void main()
	{
		vec4 fColor;
		vec3 H = normalize( L + E );
		vec4 ambient = ambientProduct;
		float Kd = max( dot(L, N), 0.0 );
		vec4 diffuse = Kd*diffuseProduct;
		float Ks = pow( max(dot(N, H), 0.0), shininess );
		vec4 specular = Ks * specularProduct;
		if( dot(L, N) < 0.0 ) specular = vec4(0.0, 0.0, 0.0, 1.0);
		fColor = ambient + diffuse + specular;
		fColor.a = 1.0;
		gl_FragColor = fColor * texture2D(u_Sampler, v_TexCoord);
	}
`;
var canvas = document.getElementById("canvas");
var gl = canvas.getContext('webgl');
var program = createProgram(gl, BILIBILI_VERTEX_SHADER_SOURCE, BILIBILI_FRAGMENT_SHADER_SOURCE)

var positionLocation = gl.getAttribLocation(program, "vPosition");
var colorLocation = gl.getAttribLocation(program, "fColor");
var matrixLocation = gl.getUniformLocation(program, "u_matrix");
gl.clearColor(0.5, 0.5, 0.5, 1.0)

//camera
var cameraAngleRadians = degToRad(0);

//bilibili
var bilibili_obj = new Object();
bilibili_obj.vertexBuffer = gl.createBuffer();
bilibili_obj.indexBuffer = gl.createBuffer();
bilibili_obj.colorBuffer = gl.createBuffer();

var bilibili_center = [150, 110, 50];
var bilibili_directZ = [0, 0, 1, 1];
var bilibili_translation = [100, 0, -600];
var bilibili_rotation = [degToRad(0), degToRad(0), degToRad(0)];
var bilibili_scale = [1, 1, 1];
var bilibili_fieldOfViewRadians = degToRad(100);

bilibili_colors = [];
bilibili_vertices = [];
bilibili_faces = [];
drawbilibili();
console.log("1" + bilibili_faces.length)
bilibili_convertData()

//bilibili2
var bilibili2_obj = new Object();
bilibili2_obj.vertexBuffer = gl.createBuffer();
bilibili2_obj.indexBuffer = gl.createBuffer();
bilibili2_obj.colorBuffer = gl.createBuffer();

//  160,146,100
var bilibili2_center = [0, 0, 0];
var bilibili2_directZ = [1, 0, 0, 1];
var bilibili2_translation = [-300, 75, -600];
var bilibili2_rotation = [degToRad(0), degToRad(0), degToRad(0)];
var bilibili2_scale = [1, 1, 1];
var bilibili2_fieldOfViewRadians = degToRad(100);

bilibili2_colors = [];
bilibili2_vertices = [];
bilibili2_faces = [];
drawbilibili2()
bilibili2_convertData()

//地图和天空
var ground_obj = new Object();
ground_obj.vertexBuffer = gl.createBuffer()
ground_obj.indexBuffer = gl.createBuffer()
ground_obj.colorBuffer = gl.createBuffer()
var ground_center = [0, 0, 0];
var ground_directZ = [1, 0, 0, 1];
var ground_translation = [0, 0, -600];
var ground_rotation = [degToRad(0), degToRad(0), degToRad(0)];
var ground_scale = [1, 1, 1];
var ground_fieldOfViewRadians = degToRad(100);

ground_colors = [];
ground_vertices = [];
ground_faces = [];
drawground()
console.log(ground_obj)
console.log(ground_vertices)
ground_convertDate()


// drawSceneIndex();
// Start drawing
var g_last = Date.now();
var ANGLE_STEP = 45.0;
var JUMP_STEP = 10000000.0;
var isup = true;
var isdown = false;
var isup2 = true;
var isdown2 = false;
var requestAnimationid = 1; // 用来删除相机
var requestAnimationid2 = 1; // 用来删除动画
var isAlive = true; // 是否在动
var forward = true; //向前跳
var tick1 = function () {
	cameraAngleRadians = animateCamera(cameraAngleRadians); // Update the rotation angle
	animateBilibili()
	requestAnimationid = requestAnimationFrame(tick1, canvas); // Request that the 
	drawSceneIndex();
};

var tick2 = function () {
	animateBilibili()
	requestAnimationid2 = requestAnimationFrame(tick2, canvas); // Request that the 
	drawSceneIndex(); // Draw the trianglebrowser ?calls tick
};
tick1();

function animateCamera(angle) {
	// Calculate the elapsed time
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = angle + (ANGLE_STEP * elapsed) / 100000.0;
	return newAngle %= 360;
}

function animateBilibili() {
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	// xfj 轴跳跃
	if (isup) {
		bilibili2_translation[1] = bilibili2_translation[1] + (JUMP_STEP * 1) / 1000000.0
	}
	if (isdown) {
		bilibili2_translation[1] = bilibili2_translation[1] - (JUMP_STEP * 1) / 1000000.0
	}
	if (bilibili2_translation[1] <= 75) {
		isup = true;
		isdown = false;
	}
	if (bilibili2_translation[1] >= 300) {
		isup = false;
		isdown = true;
	}


	if (isup2) {
		var angleInDegrees = 20;
		var angleInRadians = angleInDegrees * Math.PI / 180;
		bilibili_rotation[1] += angleInRadians % 360;
		bilibili_translation[1] = bilibili_translation[1] + (JUMP_STEP * 0.1) / 1000000.0
	}
	if (isdown2) {
		bilibili_translation[1] = bilibili_translation[1] - (JUMP_STEP * 0.1) / 1000000.0
	}
	if (bilibili_translation[1] <= 75) {
		isup2 = true;
		isdown2 = false;
	}
	if (bilibili_translation[1] >= 1000) {
		isup2 = false;
		isdown2 = true;
	}


	if (forward) {
		bilibili2_translation[0] += 7 * bilibili2_directZ[0];
		bilibili2_translation[1] += 7 * bilibili2_directZ[1];
		bilibili2_translation[2] += 7 * bilibili2_directZ[2];
		console.log(bilibili2_translation[2])
	} else {
		bilibili2_translation[0] += 7 * bilibili2_directZ[0];
		bilibili2_translation[1] += 7 * bilibili2_directZ[1];
		bilibili2_translation[2] += 7 * bilibili2_directZ[2];
		console.log(bilibili2_translation[2])
	}
	if (bilibili2_translation[2] >= -100) {
		forward = true;
		var angleInDegrees = 180
		var angleInRadians = angleInDegrees * Math.PI / 180;
		bilibili2_rotation[1] = angleInRadians;
	}
	if (bilibili2_translation[2] <= -1000) {
		forward = false;
		var angleInDegrees = 0
		var angleInRadians = angleInDegrees * Math.PI / 180;
		bilibili2_rotation[1] = angleInRadians;
	}

}



function bilibili_convertData() {
	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili_obj.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bilibili_vertices), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bilibili_obj.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bilibili_faces), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili_obj.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bilibili_colors), gl.STATIC_DRAW);
}

function bilibili2_convertData() {
	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili2_obj.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bilibili2_vertices), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bilibili2_obj.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bilibili2_faces), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili2_obj.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bilibili2_colors), gl.STATIC_DRAW);
}

function ground_convertDate() {
	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ground_vertices), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ground_obj.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ground_faces), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ground_colors), gl.STATIC_DRAW);
}


function radToDeg(r) {
	return r * 180 / Math.PI;
}

function degToRad(d) {
	return d * Math.PI / 180;
}

// // 设置UI

webglLessonsUI.setupSlider("#cameraAngle", {
	value: radToDeg(cameraAngleRadians),
	slide: updateCameraAngle,
	min: -360,
	max: 360
});

function updateCameraAngle(event, ui) {
	cameraAngleRadians = degToRad(ui.value);
	drawSceneIndex();
}
// webglLessonsUI.setupSlider("#bilibili_fieldOfView", { value: radToDeg(bilibili_fieldOfViewRadians), slide: bilibili_updateFieldOfView, min: 30, max: 120 });
// webglLessonsUI.setupSlider("#bilibili_x", { value: bilibili_translation[0], slide: bilibili_updatePosition(0), min: -400, max: 200 });
// webglLessonsUI.setupSlider("#bilibili_y", { value: bilibili_translation[1], slide: bilibili_updatePosition(1), min: -400, max: 300 });
// webglLessonsUI.setupSlider("#bilibili_z", { value: bilibili_translation[2], slide: bilibili_updatePosition(2), min: -1000, max: 0 });
// webglLessonsUI.setupSlider("#bilibili_angleX", { value: radToDeg(bilibili_rotation[0]), slide: bilibili_updateRotation(0), max: 360 });
// webglLessonsUI.setupSlider("#bilibili_angleY", { value: radToDeg(bilibili_rotation[1]), slide: bilibili_updateRotation(1), max: 360 });
// webglLessonsUI.setupSlider("#bilibili_angleZ", { value: radToDeg(bilibili_rotation[2]), slide: bilibili_updateRotation(2), max: 360 });
// webglLessonsUI.setupSlider("#bilibili_scale", { value: bilibili_scale[0], slide: bilibili_updateScale(0), min: 0.01, max: 5, step: 0.01, precision: 2 });

// webglLessonsUI.setupSlider("#bilibili2_fieldOfView", { value: radToDeg(bilibili2_fieldOfViewRadians), slide: bilibili2_updateFieldOfView, min: 30, max: 120 });
// webglLessonsUI.setupSlider("#bilibili2_x", { value: bilibili2_translation[0], slide: bilibili2_updatePosition(0), min: -400, max: 200 });
// webglLessonsUI.setupSlider("#bilibili2_y", { value: bilibili2_translation[1], slide: bilibili2_updatePosition(1), min: -400, max: 300 });
// webglLessonsUI.setupSlider("#bilibili2_z", { value: bilibili2_translation[2], slide: bilibili2_updatePosition(2), min: -1000, max: 0 });
// webglLessonsUI.setupSlider("#bilibili2_angleX", { value: radToDeg(bilibili2_rotation[0]), slide: bilibili2_updateRotation(0), max: 360 });
// webglLessonsUI.setupSlider("#bilibili2_angleY", { value: radToDeg(bilibili2_rotation[1]), slide: bilibili2_updateRotation(1), max: 360 });
// webglLessonsUI.setupSlider("#bilibili2_angleZ", { value: radToDeg(bilibili2_rotation[2]), slide: bilibili2_updateRotation(2), max: 360 });
// webglLessonsUI.setupSlider("#bilibili2_scale", { value: bilibili2_scale[0], slide: bilibili2_updateScale(0), min: 0.01, max: 5, step: 0.01, precision: 2 });

// document.getElementById("pause").onclick = function () {
// 	console.log("pause")
// 	if (isAlive) {
// 		console.log("pausealive")
// 		window.cancelAnimationFrame(requestAnimationid)
// 		tick2()
// 		isAlive = false;
// 	}
// }
// document.getElementById("go").onclick = function () {
// 	console.log("go")
// 	if (!isAlive) {
// 		console.log("goalive")
// 		window.cancelAnimationFrame(requestAnimationid2)
// 		tick1()
// 		isAlive = true;
// 	}
// }

// // // 设置滑块滑动
// function bilibili_updatePosition(index) {
// 	return function (event, ui) {
// 		bilibili_translation[index] = ui.value;
// 		drawSceneIndex();
// 	};
// }

// function bilibili_updateRotation(index) {
// 	return function (event, ui) {
// 		var angleInDegrees = ui.value;
// 		var angleInRadians = angleInDegrees * Math.PI / 180;
// 		bilibili_rotation[index] = angleInRadians;
// 		drawSceneIndex();
// 	};
// }

// function bilibili_updateScale(index) {
// 	return function (event, ui) {
// 		bilibili_scale[index] = ui.value;
// 		bilibili_scale[index + 1] = ui.value;
// 		bilibili_scale[index + 2] = ui.value;
// 		drawSceneIndex();
// 	};
// }

// function bilibili_updateFieldOfView(event, ui) {
// 	bilibili_fieldOfViewRadians = degToRad(ui.value);
// 	drawSceneIndex();
// }

// document.getElementById("bilibili_forward").onclick = function () {
//   bilibili_translation[0] += 100 * bilibili_directZ[0];
//   bilibili_translation[1] += 100 * bilibili_directZ[1];
//   bilibili_translation[2] += 100 * bilibili_directZ[2];
//   drawSceneIndex();
// }
// document.getElementById("bilibili_backward").onclick = function () {
//   bilibili_translation[0] -= 100 * bilibili_directZ[0];
//   bilibili_translation[1] -= 100 * bilibili_directZ[1];
//   bilibili_translation[2] -= 100 * bilibili_directZ[2];
//   drawSceneIndex();
// }

// // bilibili2
// function bilibili2_updatePosition(index) {
// 	return function (event, ui) {
// 		bilibili2_translation[index] = ui.value;
// 		drawSceneIndex();
// 	};
// }

// function bilibili2_updateRotation(index) {
// 	return function (event, ui) {

// 		var angleInDegrees = ui.value;
// 		var angleInRadians = angleInDegrees * Math.PI / 180;
// 		bilibili2_rotation[index] = angleInRadians;
// 		drawSceneIndex();
// 	};
// }

// function bilibili2_updateScale(index) {
// 	return function (event, ui) {
// 		bilibili2_scale[index] = ui.value;
// 		bilibili2_scale[index + 1] = ui.value;
// 		bilibili2_scale[index + 2] = ui.value;
// 		drawSceneIndex();
// 	};
// }

// function bilibili2_updateFieldOfView(event, ui) {
// 	bilibili2_fieldOfViewRadians = degToRad(ui.value);
// 	drawSceneIndex();
// }

// document.getElementById("bilibili2_forward").onclick = function () {
//   bilibili2_translation[0] += 100 * bilibili2_directZ[0];
//   bilibili2_translation[1] += 100 * bilibili2_directZ[1];
//   bilibili2_translation[2] += 100 * bilibili2_directZ[2];
//   drawSceneIndex();
// }
// document.getElementById("bilibili2_backward").onclick = function () {
//   bilibili2_translation[0] -= 100 * bilibili2_directZ[0];
//   bilibili2_translation[1] -= 100 * bilibili2_directZ[1];
//   bilibili2_translation[2] -= 100 * bilibili2_directZ[2];
//   drawSceneIndex();
// }


function drawSceneIndex() {
	webglUtils.resizeCanvasToDisplaySize(gl.canvas);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.useProgram(program);
	gl.clearColor(0.5, 0.5, 0.5, 1.0)


	gl.enableVertexAttribArray(positionLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili_obj.vertexBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
	
	// 顶点颜色buffer
	gl.enableVertexAttribArray(colorLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili_obj.colorBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false; // normalize the data (convert from 0-255 to 0-1)
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);

	// 计算图像转换
	var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
	var zNear = 1
	var zFar = 2000
	var perMatrix = m4.perspective(bilibili_fieldOfViewRadians, aspect, zNear, zFar)



	// 相机
	var radius = 250;
	var fPosition = [radius, 0, 0];
	camera_translation = [-150, 0, -600];

	camerachangeMatrix = m4.translation(camera_translation[0], camera_translation[1], camera_translation[2])
	var cameraMatrix = m4.yRotation(cameraAngleRadians);
	cameraMatrix = m4.translate(cameraMatrix, 250, 200, radius * 1.5);
	var cameraPosition = [
		cameraMatrix[12],
		cameraMatrix[13],
		cameraMatrix[14],
	];
	var up = [0, 1, 0];
	var cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);
	cameraunchangeMatrix = m4.translation(-camera_translation[0], -camera_translation[1], -camera_translation[2])

	cameraMatrix = m4.multiply(m4.multiply(camerachangeMatrix, cameraMatrix), cameraunchangeMatrix);
	var viewMatrix = m4.inverse(cameraMatrix);
	var viewProjectionMatrix = m4.multiply(perMatrix, viewMatrix);


	changeMatrix = m4.translation(bilibili_center[0], bilibili_center[1], bilibili_center[2])
	var T = m4.translation(bilibili_translation[0], bilibili_translation[1], bilibili_translation[2]);
	var Rx = m4.axisRotation([1, 0, 0, 1], bilibili_rotation[0]);
	var Ry = m4.axisRotation([0, 1, 0, 1], bilibili_rotation[1]);
	var Rz = m4.axisRotation([0, 0, 1, 1], bilibili_rotation[2]);
	var S = m4.scaling(bilibili_scale[0], bilibili_scale[1], bilibili_scale[2]);
	unchangeMatrix = m4.translation(-bilibili_center[0], -bilibili_center[1], -bilibili_center[2])
	mvMatrix = m4.multiply(m4.multiply(m4.multiply(m4.multiply(m4.multiply(m4.multiply(changeMatrix, T), Rx), Ry), Rz), S), unchangeMatrix);
	matrix = m4.multiply(viewProjectionMatrix, mvMatrix);


	bilibili_directZ = [0, 0, 1, 1];
	bilibili_directZ = m4.transformNormal(mvMatrix, bilibili_directZ);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bilibili_obj.indexBuffer);
	gl.uniformMatrix4fv(matrixLocation, false, matrix);
	gl.drawElements(gl.TRIANGLES, bilibili_faces.length, gl.UNSIGNED_SHORT, 0);


	// 绘制 bilibili2
	gl.enableVertexAttribArray(positionLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili2_obj.vertexBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
	// 顶点颜色buffer
	gl.enableVertexAttribArray(colorLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili2_obj.colorBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false; // normalize the data (convert from 0-255 to 0-1)
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);

	changeMatrix = m4.translation(bilibili2_center[0], bilibili2_center[1], bilibili2_center[2])
	var T = m4.translation(bilibili2_translation[0], bilibili2_translation[1], bilibili2_translation[2]);
	var Rx = m4.axisRotation([1, 0, 0, 1], bilibili2_rotation[0]);
	var Ry = m4.axisRotation([0, 1, 0, 1], bilibili2_rotation[1]);
	var Rz = m4.axisRotation([0, 0, 1, 1], bilibili2_rotation[2]);
	var S = m4.scaling(bilibili2_scale[0], bilibili2_scale[1], bilibili2_scale[2]);
	unchangeMatrix = m4.translation(-bilibili2_center[0], -bilibili2_center[1], -bilibili2_center[2])

	mvMatrix = m4.multiply(m4.multiply(m4.multiply(m4.multiply(m4.multiply(m4.multiply(changeMatrix, T), Rx), Ry), Rz), S), unchangeMatrix);
	matrix = m4.multiply(viewProjectionMatrix, mvMatrix);

	bilibili2_directZ = [0, 0, 1, 1];
	bilibili2_directZ = m4.transformNormal(mvMatrix, bilibili2_directZ);

	gl.uniformMatrix4fv(matrixLocation, false, matrix);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bilibili2_obj.indexBuffer);
	// // // 绘制
	gl.drawElements(gl.TRIANGLES, bilibili2_faces.length, gl.UNSIGNED_SHORT, 0);


	// ground
	gl.enableVertexAttribArray(positionLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.vertexBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
	// 顶点颜色buffer
	gl.enableVertexAttribArray(colorLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.colorBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false; // normalize the data (convert from 0-255 to 0-1)
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);

	changeMatrix = m4.translation(ground_center[0], ground_center[1], ground_center[2])
	var T = m4.translation(ground_translation[0], ground_translation[1], ground_translation[2]);
	var Rx = m4.axisRotation([1, 0, 0, 1], ground_rotation[0]);
	var Ry = m4.axisRotation([0, 1, 0, 1], ground_rotation[1]);
	var Rz = m4.axisRotation([0, 0, 1, 1], ground_rotation[2]);
	var S = m4.scaling(ground_scale[0], ground_scale[1], ground_scale[2]);
	unchangeMatrix = m4.translation(-ground_center[0], -ground_center[1], -ground_center[2])

	mvMatrix = m4.multiply(m4.multiply(m4.multiply(m4.multiply(m4.multiply(m4.multiply(changeMatrix, T), Rx), Ry), Rz), S), unchangeMatrix);
	matrix = m4.multiply(viewProjectionMatrix, mvMatrix);

	ground_directZ = [0, 0, 1, 1];
	ground_directZ = m4.transformNormal(mvMatrix, ground_directZ);

	gl.uniformMatrix4fv(matrixLocation, false, matrix);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ground_obj.indexBuffer);
	// // // 绘制
	gl.drawElements(gl.TRIANGLES, ground_faces.length, gl.UNSIGNED_SHORT, 0);
}


function drawbilibili() {
	let tobj = new Object()
	tobj = config_tinker_obj(tobj, tinker_obj_1_config)
	bilibili_vertices = tobj.vertices
	bilibili_faces = tobj.indexes
    bilibili_colors = tobj.colors
    bilibili_normal = tobj.normals
}

function drawbilibili2() {
	let tobj = new Object()
	tobj = config_tinker_obj(tobj, tinker_obj_2_config)
	bilibili2_vertices = tobj.vertices
	bilibili2_faces = tobj.indexes
    bilibili2_colors = tobj.colors
    bilibili2_normals = tobj.normals
}

function drawground() {

	// 创建一个立方体
	//    v6----- v5
	//   /|      /|
	//  v1------v0|
	//  | |     | |
	//  | |v7---|-|v4
	//  |/      |/
	//  v2------v3
	ground_vertices = [
		800, -20, 500, -800, -20, 500, // v0 White
		-800, -30, 500, 800, -30, 500, // v1 Magenta
		800, -30, -500, 800, -20, -500, // v2 Red
		-800, -20, -500, -800, -30, -500, // v3 Yellow
	]

	ground_faces = [
		0, 1, 2, 0, 2, 3, // 前
		0, 3, 4, 0, 4, 5, // 右
		0, 5, 6, 0, 6, 1, // 上
		1, 6, 7, 1, 7, 2, // 左
		7, 4, 3, 7, 3, 2, // 下
		4, 7, 6, 4, 6, 5 // 后
	]

	ground_colors = [
		0, 1, 0, 1, 1, 0,
		0, 1, 0, 1, 1, 0,
		0, 1, 0, 1, 1, 0,
		0, 1, 0, 1, 1, 0,
		0, 1, 0, 1, 1, 0,
		0, 1, 0, 1, 1, 0,
		0, 1, 0, 1, 1, 0,
		0, 1, 0, 1, 1, 0,
	]

}