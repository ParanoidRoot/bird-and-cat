// vertex shader
var BILIBILI_VERTEX_SHADER_SOURCE =
	`
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;
attribute vec2 a_TexCoord;

varying vec4 v_color;
varying vec2 v_TexCoord;

uniform float mcolor;
uniform mat4 u_matrix;
uniform mat4 p_matrix;
uniform vec4 ambientProduct, diffuseProduct, specularProduct;
uniform vec4 lightPosition;
uniform float shininess;

void main()
{
	vec4 pos2 = u_matrix * vec4(a_position, 1.0);

	vec4 normal = vec4(a_normal , 1.0);
	vec3 pos = pos2.xyz/pos2.w;

	vec3 L;
	if(lightPosition.w == 0.0) L = normalize(lightPosition.xyz);
	else L = normalize( lightPosition.xyz - pos );
	vec3 E = normalize( -pos );
	vec3 N = normalize( (u_matrix*normal).xyz/(u_matrix*normal).w );
	vec3 H = normalize( L + E );

	vec4 ambient = ambientProduct;
	float Kd = max( dot(L, N), 0.0 );
	vec4 diffuse = Kd*vec4(a_color,1.0);
	if(mcolor == 1.0)
		diffuse = Kd*vec4(0.8,0.8,0.8,1.0);
	float Ks = pow( max(dot(N, H), 0.0), shininess );
	vec4 specular = Ks * specularProduct;
	if( dot(L, N) < 0.0 ) specular = vec4(0.0, 0.0, 0.0, 1.0);

	v_color = (ambient + diffuse + specular);

	gl_Position = p_matrix * u_matrix * vec4(a_position, 1.0);

	v_TexCoord = a_TexCoord;
}`;
// fragment shader
var BILIBILI_FRAGMENT_SHADER_SOURCE =
	`
precision mediump float;
varying vec4 v_color;
uniform float decide;
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;

void main()
{
	vec4 fcolor = v_color;
	fcolor.a = 1.0;
	if(decide == 1.0)
		gl_FragColor = vec4(fcolor.rgb * texture2D(u_Sampler, v_TexCoord).rgb, fcolor.a);
	else if(decide == 2.0)
		gl_FragColor = vec4(fcolor.rgb * texture2D(u_Sampler, v_TexCoord).rgb, fcolor.a);
	else if(decide == 3.0)
		gl_FragColor = vec4(fcolor.rgb * vec4(1.0,0.8705,0.192,1.0).rgb, fcolor.a);
	else
		gl_FragColor = fcolor;
}`;

// gl_FragColor = fcolor;

var canvas = document.getElementById("canvas");
var gl = canvas.getContext('webgl');
var program = createProgram(gl, BILIBILI_VERTEX_SHADER_SOURCE,
	BILIBILI_FRAGMENT_SHADER_SOURCE);

if (!program) {
	console.log(123);
}

var positionLocation = gl.getAttribLocation(program, "a_position");
var colorLocation = gl.getAttribLocation(program, "a_color");
var normalLocation = gl.getAttribLocation(program, "a_normal");
var matrixLocation = gl.getUniformLocation(program, 'u_matrix');
var u_Sampler = gl.getUniformLocation(program, 'u_Sampler');
var u_decide = gl.getUniformLocation(program, 'decide');
var u_mcolor = gl.getUniformLocation(program, 'mcolor');
var a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
var viewProjectionLocation = gl.getUniformLocation(program, "p_matrix");

var isDecide = true;

var lightPosition = [1.0, 1.0, 1.0, 1.0];

var lightAmbient = [0.2, 0.2, 0.2, 1.0];
var lightDiffuse = [1.0, 1.0, 1.0, 1.0];
var lightSpecular = [1.0, 1.0, 1.0, 1.0];

var materialAmbient = [1.0, 0.0, 1.0, 1.0];
var materialDiffuse = [1.0, 0.8, 0.0, 1.0];
var materialSpecular = [1.0, 0.8, 0.0, 1.0];
var materialShininess = 100.0;

gl.clearColor(0.5, 0.5, 0.5, 1.0);

//鼠标滚轮控制模型放大缩小
document.addEventListener('mousewheel', mousewheel, false);
//键盘事件
document.addEventListener('keydown', onKeyDown, false);

//camera
var cameraAngleRadians = degToRad(0);

var texture_name_to_texture = {
	"eye1.png": init_texture("../model/better/eye1.png"),
	"mouth1.png": init_texture("../model/better/mouth1.png"),
	"pikagen.png": init_texture("../model/better/pikagen.png")
};

var bilibili_obj = {};
bilibili_obj.vertexBuffer = gl.createBuffer();
bilibili_obj.indexBuffer = gl.createBuffer();
bilibili_obj.colorBuffer = gl.createBuffer();
bilibili_obj.normalBuffer = gl.createBuffer();
bilibili_obj.texture_buffer = gl.createBuffer();

var bilibili_center = [300, 200, 50];
var bilibili_directZ = [0, 1, 0, 1];
var bilibili_translation = [350, 0, -600];
var bilibili_rotation = [degToRad(0), degToRad(0), degToRad(0)];
var bilibili_scale = [1, 1, 1];
var bilibili_fieldOfViewRadians = degToRad(100);

bilibili_colors = [];
bilibili_vertices = [];
bilibili_faces = [];
bilibili_normals = [];
bilibili_textpo = [];

var bilibili_textures = [];
var bilibili_texture = init_texture("../model/better/Char_Patrick.png");

obj_1 = drawbilibili();
bilibili_convertData();

var bilibili2_obj = {};
bilibili2_obj.vertexBuffer = gl.createBuffer();
bilibili2_obj.indexBuffer = gl.createBuffer();
bilibili2_obj.colorBuffer = gl.createBuffer();
bilibili2_obj.normalBuffer = gl.createBuffer();
bilibili2_obj.texture_buffer = gl.createBuffer();

var bilibili2_center = [0, 0, 0];
var bilibili2_directZ = [0, 1, 0, 1];
var bilibili2_translation = [-300, 75, -400];
var bilibili2_rotation = [degToRad(0), degToRad(0), degToRad(0)];
var bilibili2_scale = [1, 1, 1];
var bilibili2_fieldOfViewRadians = degToRad(100);

bilibili2_colors = [];
bilibili2_vertices = [];
bilibili2_faces = [];
bilibili2_normals = [];

var bilibili2_textures = [];
var piTemp;
drawbilibili2();

var ground_obj = {};
ground_obj.vertexBuffer = gl.createBuffer();
ground_obj.indexBuffer = gl.createBuffer();
ground_obj.colorBuffer = gl.createBuffer();
ground_obj.normalBuffer = gl.createBuffer();
var ground_center = [0, 0, 0];
var ground_directZ = [1, 0, 0, 1];
var ground_translation = [0, 0, -600];
var ground_rotation = [degToRad(0), degToRad(0), degToRad(0)];
var ground_scale = [1, 1, 1];
var ground_fieldOfViewRadians = degToRad(100);

ground_colors = [];
ground_vertices = [];
ground_faces = [];
ground_normals = [];
drawground();
ground_convertDate();

// 光源球
var light_ball_obj = {};
light_ball_obj.vertexBuffer = gl.createBuffer();
light_ball_obj.indexBuffer = gl.createBuffer();
light_ball_obj.colorBuffer = gl.createBuffer();
light_ball_obj.normalBuffer = gl.createBuffer();
var light_ball_center = lightPosition;
var light_ball_directZ = [0, 0, 1, 1];
var light_ball_translation = [0, 0, 0];
var light_ball_rotation = [degToRad(0), degToRad(0), degToRad(0)];
var light_ball_scale = [0.1, 0.1, 0.1];

light_ball_colors = [];
light_ball_vertices = [];
light_ball_faces = [];
light_ball_normals = [];

draw_light_ball();
light_ball_convertData();

// 新的正方形
var test_cube_obj = {};
test_cube_obj.vertexBuffer = gl.createBuffer();
test_cube_obj.indexBuffer = gl.createBuffer();
test_cube_obj.colorBuffer = gl.createBuffer();
test_cube_obj.normalBuffer = gl.createBuffer();
var test_cube_center = [0, 0, 0];
var test_cube_directZ = [0, 0, 1, 1];
var test_cube_translation = [0, 0, 0];
var test_cube_rotation = [degToRad(0), degToRad(0), degToRad(0)];
var test_cube_scale = [1, 1, 1];

test_cube_colors = [];
test_cube_vertices = [];
test_cube_faces = [];
test_cube_normals = [];

// draw_test_cube()
// test_cube_convertData()

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
var isAlive = false; // 是否在动
var forward = true; //向前跳
var tick = function () {
	cameraAngleRadians = animateCamera(cameraAngleRadians); // Update the rotation angle
	animateBilibili();
	requestAnimationid = requestAnimationFrame(tick, canvas); // Request that the 
	drawSceneIndex();
};

tick();

function animateCamera(angle) {
	if (isAlive) {
		// Calculate the elapsed time
		var now = Date.now();
		var elapsed = now - g_last;
		g_last = now;
		// Update the current rotation angle (adjusted by the elapsed time)
		var newAngle = angle + (ANGLE_STEP * elapsed) / 100000.0;
		return newAngle %= 360;
	} else {
		return angle;
	}
}

function animateBilibili() {

	if (isAlive) {
		var now = Date.now();
		var elapsed = now - g_last;
		g_last = now;
		// xfj 轴跳跃
		if (isup) {
			bilibili2_translation[1] = bilibili2_translation[1] + (JUMP_STEP
				* 1) / 1000000.0
		}
		if (isdown) {
			bilibili2_translation[1] = bilibili2_translation[1] - (JUMP_STEP
				* 1) / 1000000.0
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
			bilibili_rotation[2] += angleInRadians % 360;
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
			var angleInDegrees = 180;
			var angleInRadians = angleInDegrees * Math.PI / 180;
			bilibili2_rotation[1] = angleInRadians;
		}
		if (bilibili2_translation[2] <= -1000) {
			forward = false;
			var angleInDegrees = 0;
			var angleInRadians = angleInDegrees * Math.PI / 180;
			bilibili2_rotation[1] = angleInRadians;
		}
	}

}

function bilibili_convertData() {

	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili_obj.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bilibili_textpo),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bilibili_obj.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bilibili_faces),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili_obj.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bilibili_colors),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili_obj.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bilibili_normals),
		gl.STATIC_DRAW);

	// 绑定材质的纹理
	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili_obj.texture_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bilibili_textures),
		gl.STATIC_DRAW);
}

function bilibili2_convertData() {
	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili2_obj.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bilibili2_vertices),
		gl.STATIC_DRAW);

	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bilibili2_obj.indexBuffer);
	// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bilibili2_faces), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili2_obj.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bilibili2_colors),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili2_obj.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bilibili2_normals),
		gl.STATIC_DRAW);

	// 绑定材质的纹理
	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili2_obj.texture_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bilibili2_textures),
		gl.STATIC_DRAW);
}

function ground_convertDate() {
	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ground_vertices),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ground_obj.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ground_faces),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ground_colors),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ground_normals),
		gl.STATIC_DRAW);
}

function light_ball_convertData() {
	gl.bindBuffer(gl.ARRAY_BUFFER, light_ball_obj.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(light_ball_vertices),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, light_ball_obj.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(light_ball_faces),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, light_ball_obj.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(light_ball_colors),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, light_ball_obj.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(light_ball_normals),
		gl.STATIC_DRAW);
}

function test_cube_convertData() {
	gl.bindBuffer(gl.ARRAY_BUFFER, test_cube_obj.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(test_cube_vertices),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, test_cube_obj.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(test_cube_faces),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, test_cube_obj.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(test_cube_colors),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, test_cube_obj.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(test_cube_normals),
		gl.STATIC_DRAW);
}

function radToDeg(r) {
	return r * 180 / Math.PI;
}

function degToRad(d) {
	return d * Math.PI / 180;
}

//鼠标滑轮
function mousewheel(e) {
	if (e.wheelDelta) { //判断浏览器IE，谷歌滑轮事件
		if (e.wheelDelta > 0) { //当滑轮向上滚动时
			bilibili_fieldOfViewRadians = degToRad(
				radToDeg(bilibili_fieldOfViewRadians) < 150 ? radToDeg(
					bilibili_fieldOfViewRadians) + 1 : radToDeg(
					bilibili_fieldOfViewRadians));
		}
		if (e.wheelDelta < 0) { //当滑轮向下滚动时
			bilibili_fieldOfViewRadians = degToRad(
				radToDeg(bilibili_fieldOfViewRadians) > 30 ? radToDeg(
					bilibili_fieldOfViewRadians) - 1 : radToDeg(
					bilibili_fieldOfViewRadians));
		}
	} else if (e.detail) { //Firefox滑轮事件
		if (e.detail > 0) { //当滑轮向上滚动时
			bilibili_fieldOfViewRadians = degToRad(
				radToDeg(bilibili_fieldOfViewRadians) < 150 ? radToDeg(
					bilibili_fieldOfViewRadians) + 1 : radToDeg(
					bilibili_fieldOfViewRadians));
		}
		if (e.detail < 0) { //当滑轮向下滚动时
			bilibili_fieldOfViewRadians = degToRad(
				radToDeg(bilibili_fieldOfViewRadians) > 30 ? radToDeg(
					bilibili_fieldOfViewRadians) - 1 : radToDeg(
					bilibili_fieldOfViewRadians));
		}
	}
}

//监听键盘事件
function onKeyDown(event) {
	//A
	if (event.keyCode == 65) {
		bilibili_translation[0] = bilibili_translation[0] - 10;
	}
	//D
	if (event.keyCode == 68) {
		bilibili_translation[0] = bilibili_translation[0] + 10;
	}
	//W
	if (event.keyCode == 87) {
		bilibili_translation[0] = bilibili_translation[0] + 10
			* bilibili_directZ[0];
		bilibili_translation[1] = bilibili_translation[1] + 10
			* bilibili_directZ[1];
		bilibili_translation[2] = bilibili_translation[2] + 10
			* bilibili_directZ[2];
	}
	//S
	if (event.keyCode == 83) {
		bilibili_translation[0] = bilibili_translation[0] - 10
			* bilibili_directZ[0];
		bilibili_translation[1] = bilibili_translation[1] - 10
			* bilibili_directZ[1];
		bilibili_translation[2] = bilibili_translation[2] - 10
			* bilibili_directZ[2];
	}
	//LEFT
	if (event.keyCode == 37) {
		bilibili2_translation[0] = bilibili2_translation[0] - 10;
	}
	//RIGHT
	if (event.keyCode == 39) {
		bilibili2_translation[0] = bilibili2_translation[0] + 10;
	}
	//UP
	if (event.keyCode == 38) {
		bilibili2_translation[0] = bilibili2_translation[0] + 10
			* bilibili2_directZ[0];
		bilibili2_translation[1] = bilibili2_translation[1] + 10
			* bilibili2_directZ[1];
		bilibili2_translation[2] = bilibili2_translation[2] + 10
			* bilibili2_directZ[2];
	}
	//DOWN
	if (event.keyCode == 40) {

		bilibili2_translation[0] = bilibili2_translation[0] - 10
			* bilibili2_directZ[0];
		bilibili2_translation[1] = bilibili2_translation[1] - 10
			* bilibili2_directZ[1];
		bilibili2_translation[2] = bilibili2_translation[2] - 10
			* bilibili2_directZ[2];
	}

	//Z
	if (event.keyCode == 90) {
		bilibili_rotation[1] = bilibili_rotation[1] - 10 * Math.PI / 180;
	}
	//C
	if (event.keyCode == 67) {
		bilibili_rotation[1] = bilibili_rotation[1] + 10 * Math.PI / 180;
	}
	//B
	if (event.keyCode == 66) {
		bilibili2_rotation[1] = bilibili2_rotation[1] - 10 * Math.PI / 180;
	}
	//M
	if (event.keyCode == 77) {
		bilibili2_rotation[1] = bilibili2_rotation[1] + 10 * Math.PI / 180;
	}

	//+
	if (event.keyCode == 187) {
		cameraAngleRadians = degToRad(radToDeg(cameraAngleRadians) + 10);
	}
	//-
	if (event.keyCode == 189) {
		cameraAngleRadians = degToRad(radToDeg(cameraAngleRadians) - 10);
	}

	//1
	if (event.keyCode == 97) {
		bilibili_scale[0] = bilibili_scale[0] - 0.01;
		bilibili_scale[1] = bilibili_scale[0];
		bilibili_scale[2] = bilibili_scale[0];
	}

	//2
	if (event.keyCode == 98) {
		bilibili_scale[0] = bilibili_scale[0] + 0.01;
		bilibili_scale[1] = bilibili_scale[0];
		bilibili_scale[2] = bilibili_scale[0];
	}

	//4
	if (event.keyCode == 100) {
		bilibili2_scale[0] = bilibili2_scale[0] - 0.01;
		bilibili2_scale[1] = bilibili2_scale[0];
		bilibili2_scale[2] = bilibili2_scale[0];
	}

	//5
	if (event.keyCode == 101) {
		bilibili2_scale[0] = bilibili2_scale[0] + 0.01;
		bilibili2_scale[1] = bilibili2_scale[0];
		bilibili2_scale[2] = bilibili2_scale[0];
	}

	//7
	if (event.keyCode == 103) {
		lightPosition[0] += 10;
		light_ball_center[0] += 10;
		gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
			new Float32Array(lightPosition));
	}

	//8
	if (event.keyCode == 104) {
		lightPosition[1] += 10;
		light_ball_center[1] += 10;
		gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
			new Float32Array(lightPosition));
	}

	//9
	if (event.keyCode == 105) {
		lightPosition[2] += 10;
		light_ball_center[2] += 10;
		gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
			new Float32Array(lightPosition));
	}

	//u
	if (event.keyCode == 85) {
		lightPosition[0] -= 10;
		light_ball_center[0] -= 10;
		gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
			new Float32Array(lightPosition));
	}

	//i
	if (event.keyCode == 73) {
		lightPosition[1] -= 10;
		light_ball_center[1] -= 10;
		gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
			new Float32Array(lightPosition));
	}

	//o
	if (event.keyCode == 79) {
		lightPosition[2] -= 10;
		light_ball_center[2] -= 10;
		gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
			new Float32Array(lightPosition));
	}

	if (event.keyCode == 96) {
		isDecide = isDecide ? false : true;
	}
}


function drawSceneIndex() {

	webglUtils.resizeCanvasToDisplaySize(gl.canvas);

	if (isDecide) {
		lightAmbient = [0.2, 0.2, 0.2, 1.0];
		lightDiffuse = [1.0, 1.0, 1.0, 1.0];
		lightSpecular = [1.0, 1.0, 1.0, 1.0];

		materialAmbient = [1.0, 0.0, 1.0, 1.0];
		materialDiffuse = [1.0, 0.8, 0.0, 1.0];
		materialSpecular = [1.0, 0.8, 0.0, 1.0];
	} else {
		lightAmbient = [0.2, 0.2, 0.2, 1.0];
		lightDiffuse = [0.5, 0.5, 0.5, 1.0];
		lightSpecular = [0.5, 0.5, 0.5, 1.0];

		materialAmbient = [0.5, 0.0, 0.5, 1.0];
		materialDiffuse = [0.5, 0.8, 0.0, 1.0];
		materialSpecular = [0.5, 0.8, 0.0, 1.0];
	}

	ambientProduct = [0, 0, 0, 0];
	ambientProduct[0] = lightAmbient[0] * materialAmbient[0];
	ambientProduct[1] = lightAmbient[1] * materialAmbient[1];
	ambientProduct[2] = lightAmbient[2] * materialAmbient[2];
	ambientProduct[3] = lightAmbient[3] * materialAmbient[3];

	diffuseProduct = m4.multiply(lightDiffuse, materialDiffuse);

	specularProduct = [0, 0, 0, 0];
	specularProduct[0] = lightSpecular[0] * materialSpecular[0];
	specularProduct[1] = lightSpecular[1] * materialSpecular[1];
	specularProduct[2] = lightSpecular[2] * materialSpecular[2];
	specularProduct[3] = lightSpecular[3] * materialSpecular[3];

	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
		new Float32Array(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
		new Float32Array(diffuseProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
		new Float32Array(specularProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
		new Float32Array(lightPosition));
	gl.uniform1f(gl.getUniformLocation(program, "shininess"),
		materialShininess);

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.useProgram(program);
	gl.clearColor(0.5, 0.5, 0.5, 1.0);

	// 顶点颜色buffer
	gl.enableVertexAttribArray(colorLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili_obj.colorBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false; // normalize the data (convert from 0-255 to 0-1)
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(colorLocation, size, type, normalize, stride,
		offset);

	// 冲入纹理数据
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, bilibili_texture);
	gl.uniform1i(u_Sampler, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili_obj.texture_buffer);
	gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_TexCoord);

	// 计算图像转换
	var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	var zNear = 1;
	var zFar = 2000;
	var perMatrix = m4.perspective(bilibili_fieldOfViewRadians, aspect, zNear,
		zFar);

	// 相机
	var radius = 250;
	var fPosition = [radius, 0, 0];
	camera_translation = [-150, 0, -600];

	camerachangeMatrix = m4.translation(camera_translation[0],
		camera_translation[1], camera_translation[2]);
	var cameraMatrix = m4.yRotation(cameraAngleRadians);
	cameraMatrix = m4.translate(cameraMatrix, 250, 200, radius * 1.5);
	var cameraPosition = [
		cameraMatrix[12],
		cameraMatrix[13],
		cameraMatrix[14],
	];
	var up = [0, 1, 0];
	var cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);
	cameraunchangeMatrix = m4.translation(-camera_translation[0],
		-camera_translation[1], -camera_translation[2]);

	cameraMatrix = m4.multiply(m4.multiply(camerachangeMatrix, cameraMatrix),
		cameraunchangeMatrix);
	var viewMatrix = m4.inverse(cameraMatrix);
	var viewProjectionMatrix = m4.multiply(perMatrix, viewMatrix);

	gl.uniformMatrix4fv(viewProjectionLocation, false, viewProjectionMatrix);

	changeMatrix = m4.translation(bilibili_center[0], bilibili_center[1],
		bilibili_center[2]);
	var T = m4.translation(bilibili_translation[0], bilibili_translation[1],
		bilibili_translation[2]);
	var Rx = m4.axisRotation([1, 0, 0, 1], bilibili_rotation[0]);
	var Ry = m4.axisRotation([0, 1, 0, 1], bilibili_rotation[1]);
	var Rz = m4.axisRotation([0, 0, 1, 1], bilibili_rotation[2]);
	var S = m4.scaling(bilibili_scale[0], bilibili_scale[1], bilibili_scale[2]);
	unchangeMatrix = m4.translation(-bilibili_center[0], -bilibili_center[1],
		-bilibili_center[2]);
	mvMatrix = m4.multiply(m4.multiply(m4.multiply(
		m4.multiply(m4.multiply(m4.multiply(changeMatrix, T), Rx), Ry), Rz), S),
		unchangeMatrix);

	bilibili_directZ = [0, 0, 1, 1];
	bilibili_directZ = m4.transformNormal(mvMatrix, bilibili_directZ);
	gl.uniformMatrix4fv(matrixLocation, false, mvMatrix);

	gl.enableVertexAttribArray(normalLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili_obj.normalBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(normalLocation, size, type, normalize, stride,
		offset);

	//顶点数据buffer
	gl.enableVertexAttribArray(positionLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, bilibili_obj.vertexBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(positionLocation, size, type, normalize, stride,
		offset);

	u_mcolor = 1.0;
	gl.uniform1f(gl.getUniformLocation(program, "mcolor"), u_mcolor);

	u_decide = 1.0;

	gl.uniform1f(gl.getUniformLocation(program, "decide"), u_decide);

	gl.drawArrays(gl.TRIANGLES, 0, bilibili_textpo.length);

	u_mcolor = 0.0;
	gl.uniform1f(gl.getUniformLocation(program, "mcolor"), u_mcolor);

	// 绘制 bilibili2

	changeMatrix = m4.translation(bilibili2_center[0], bilibili2_center[1],
		bilibili2_center[2]);
	var T = m4.translation(bilibili2_translation[0], bilibili2_translation[1],
		bilibili2_translation[2]);
	var Rx = m4.axisRotation([1, 0, 0, 1], bilibili2_rotation[0]);
	var Ry = m4.axisRotation([0, 1, 0, 1], bilibili2_rotation[1]);
	var Rz = m4.axisRotation([0, 0, 1, 1], bilibili2_rotation[2]);
	var S = m4.scaling(bilibili2_scale[0], bilibili2_scale[1],
		bilibili2_scale[2]);
	unchangeMatrix = m4.translation(-bilibili2_center[0], -bilibili2_center[1],
		-bilibili2_center[2]);

	mvMatrix = m4.multiply(m4.multiply(m4.multiply(
		m4.multiply(m4.multiply(m4.multiply(changeMatrix, T), Rx), Ry), Rz), S),
		unchangeMatrix);

	bilibili2_directZ = [0, 0, 1, 1];
	bilibili2_directZ = m4.transformNormal(mvMatrix, bilibili2_directZ);

	// 绘制 bilibili2

	for (let i = 0; i < piTemp.length; ++i) {
		u_decide = 2;

		gl.uniform1f(gl.getUniformLocation(program, "decide"), u_decide);

		drawbilibili2PartI(i);

		let current_obj_texture = get_texture_for_obj(piTemp[i]);

		// if(piTemp[i].mtl_info.map_Kd == "pikagen.png")
		// {
		// 	u_decide = 2;

		// 	gl.uniform1f(gl.getUniformLocation(program, "decide"), u_decide);
		// }

		bilibili2_convertData();

		// 顶点颜色buffer
		gl.enableVertexAttribArray(colorLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, bilibili2_obj.colorBuffer);
		var size = 3;
		var type = gl.FLOAT;
		var normalize = false; // normalize the data (convert from 0-255 to 0-1)
		var stride = 0;
		var offset = 0;
		gl.vertexAttribPointer(colorLocation, size, type, normalize, stride,
			offset);

		gl.uniformMatrix4fv(matrixLocation, false, mvMatrix);

		gl.enableVertexAttribArray(normalLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, bilibili2_obj.normalBuffer);
		var size = 3;
		var type = gl.FLOAT;
		var normalize = false;
		var stride = 0;
		var offset = 0;
		gl.vertexAttribPointer(normalLocation, size, type, normalize, stride,
			offset);

		// 冲入纹理数据
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, current_obj_texture);
		gl.uniform1i(u_Sampler, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, bilibili2_obj.texture_buffer);
		gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(a_TexCoord);

		gl.enableVertexAttribArray(positionLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, bilibili2_obj.vertexBuffer);
		var size = 3;
		var type = gl.FLOAT;
		var normalize = false;
		var stride = 0;
		var offset = 0;
		gl.vertexAttribPointer(positionLocation, size, type, normalize, stride,
			offset);

		// 绘制
		gl.drawArrays(gl.TRIANGLES, 0, bilibili2_vertices.length);

	}

	// 绘制光源球
	gl.enableVertexAttribArray(positionLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, light_ball_obj.vertexBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(positionLocation, size, type, normalize, stride,
		offset);
	// 顶点颜色buffer
	gl.enableVertexAttribArray(colorLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, light_ball_obj.colorBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false; // normalize the data (convert from 0-255 to 0-1)
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(colorLocation, size, type, normalize, stride,
		offset);

	changeMatrix = m4.translation(light_ball_center[0], light_ball_center[1],
		light_ball_center[2]);
	var T = m4.translation(light_ball_translation[0], light_ball_translation[1],
		light_ball_translation[2]);
	var Rx = m4.axisRotation([1, 0, 0, 1], light_ball_rotation[0]);
	var Ry = m4.axisRotation([0, 1, 0, 1], light_ball_rotation[1]);
	var Rz = m4.axisRotation([0, 0, 1, 1], light_ball_rotation[2]);
	var S = m4.scaling(light_ball_scale[0], light_ball_scale[1],
		light_ball_scale[2]);
	unchangeMatrix = m4.translation(-light_ball_center[0],
		-light_ball_center[1], -light_ball_center[2]);

	mvMatrix = m4.multiply(m4.multiply(m4.multiply(
		m4.multiply(m4.multiply(m4.multiply(changeMatrix, T), Rx), Ry), Rz), S),
		unchangeMatrix);
	gl.uniformMatrix4fv(matrixLocation, false, mvMatrix);

	light_ball_directZ = [0, 0, 1, 1];
	light_ball_directZ = m4.transformNormal(mvMatrix, light_ball_directZ);

	u_decide = 0;

	gl.uniform1f(gl.getUniformLocation(program, "decide"), u_decide);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, light_ball_obj.indexBuffer);
	// // // 绘制
	gl.drawElements(gl.TRIANGLES, light_ball_faces.length, gl.UNSIGNED_SHORT,
		0);

	// ground
	gl.enableVertexAttribArray(positionLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.vertexBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(positionLocation, size, type, normalize, stride,
		offset);
	// 顶点颜色buffer
	gl.enableVertexAttribArray(colorLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.colorBuffer);
	var size = 3;
	var type = gl.FLOAT;
	var normalize = false; // normalize the data (convert from 0-255 to 0-1)
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(colorLocation, size, type, normalize, stride,
		offset);

	changeMatrix = m4.translation(ground_center[0], ground_center[1],
		ground_center[2]);
	var T = m4.translation(ground_translation[0], ground_translation[1],
		ground_translation[2]);
	var Rx = m4.axisRotation([1, 0, 0, 1], ground_rotation[0]);
	var Ry = m4.axisRotation([0, 1, 0, 1], ground_rotation[1]);
	var Rz = m4.axisRotation([0, 0, 1, 1], ground_rotation[2]);
	var S = m4.scaling(ground_scale[0], ground_scale[1], ground_scale[2]);
	unchangeMatrix = m4.translation(-ground_center[0], -ground_center[1],
		-ground_center[2]);

	mvMatrix = m4.multiply(m4.multiply(m4.multiply(
		m4.multiply(m4.multiply(m4.multiply(changeMatrix, T), Rx), Ry), Rz), S),
		unchangeMatrix);
	gl.uniformMatrix4fv(matrixLocation, false, mvMatrix);

	ground_directZ = [0, 0, 1, 1];
	ground_directZ = m4.transformNormal(mvMatrix, ground_directZ);

	u_decide = 0;

	gl.uniform1f(gl.getUniformLocation(program, "decide"), u_decide);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ground_obj.indexBuffer);
	// // // 绘制
	gl.drawElements(gl.TRIANGLES, ground_faces.length, gl.UNSIGNED_SHORT, 0);
}


function drawbilibili() {
	let temp = get_webgl_model_object(patrick);
	temp = flatten_webgl_model_object(temp);
	bilibili_vertices = all_multi_by(temp.vertices, 400);
	bilibili_faces = temp.v_indexes;
	bilibili_colors = temp.colors;
	bilibili_normals = temp.normals;
	bilibili_textures = temp.textures;

	for (let i = 0; i < bilibili_faces.length; ++i) {
		bilibili_textpo.push(bilibili_vertices[3 * bilibili_faces[i]]);
		bilibili_textpo.push(bilibili_vertices[3 * bilibili_faces[i] + 1]);
		bilibili_textpo.push(bilibili_vertices[3 * bilibili_faces[i] + 2]);
	}

	return temp
}


function drawbilibili2() {
	piTemp = get_all_part_as_obj_list(pikaqiu)
}

function drawbilibili2PartI(index) {
	bilibili2_vertices = all_multi_by(
		make_one_dimension(piTemp[index].vertices), 2);
	bilibili2_colors = make_one_dimension(piTemp[index].colors);
	bilibili2_normals = make_one_dimension(piTemp[index].normals);
	bilibili2_textures = make_one_dimension(piTemp[index].textures)

}

function drawground() {
	ground_vertices = [
		800, -20, 500,
		-800, -20, 500, // v0 White
		-800, -30, 500, 800, -30, 500, // v1 Magenta
		800, -30, -500, 800, -20, -500, // v2 Red
		-800, -20, -500, -800, -30, -500, // v3 Yellow
	];

	ground_faces = [
		0, 1, 2, 0, 2, 3, // 前
		0, 3, 4, 0, 4, 5, // 右
		0, 5, 6, 0, 6, 1, // 上
		1, 6, 7, 1, 7, 2, // 左
		7, 4, 3, 7, 3, 2, // 下
		4, 7, 6, 4, 6, 5 // 后
	];

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

function draw_light_ball() {
	let tobj = {};
	tobj = config_tinker_obj(tobj, tinker_obj_3_config);
	light_ball_vertices = tobj.vertices;
	light_ball_faces = tobj.indexes;
	light_ball_colors = tobj.colors;
	light_ball_normals = tobj.normals
}

function draw_test_cube() {
	let tobj = {};
	tobj = config_tinker_obj(tobj, tinker_obj_4_config, 'Kd', true);
	test_cube_vertices = tobj.vertices;
	test_cube_faces = tobj.indexes;
	test_cube_colors = tobj.colors;
	test_cube_normals = tobj.normals
}

function handleLoadedTexture(texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image
	);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

// 纹理贴图, 创建纹理并且加载图片
function init_texture(img_rel_path) {
	let ans_texture = gl.createTexture();
	ans_texture.image = new Image();
	ans_texture.image.onload = function () {
		handleLoadedTexture(ans_texture)
	};
	ans_texture.image.src = img_rel_path;

	return ans_texture
}

function get_texture_for_obj(_obj, prefix = "../model/better/") {
	return texture_name_to_texture[_obj['mtl_info']['map_Kd']]
}