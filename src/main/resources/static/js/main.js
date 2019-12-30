// vertex shader
let VERTEX_SHADER_SOURCE =
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

let FRAGMENT_SHADER_SOURCE =
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

let canvas = document.getElementById("canvas");
let gl = canvas.getContext('webgl');
let program = createProgram(gl, VERTEX_SHADER_SOURCE,
	FRAGMENT_SHADER_SOURCE);

if (!program) {
	console.log(123);
}

let positionLocation = gl.getAttribLocation(program, "a_position");
let colorLocation = gl.getAttribLocation(program, "a_color");
let normalLocation = gl.getAttribLocation(program, "a_normal");
let matrixLocation = gl.getUniformLocation(program, 'u_matrix');
let u_Sampler = gl.getUniformLocation(program, 'u_Sampler');
let u_decide = gl.getUniformLocation(program, 'decide');
let u_mcolor = gl.getUniformLocation(program, 'mcolor');
let a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
let viewProjectionLocation = gl.getUniformLocation(program, "p_matrix");

let isDecide = true;

let lightPosition = [1.0, 1.0, 1.0, 1.0];

let lightAmbient = [0.2, 0.2, 0.2, 1.0];
let lightDiffuse = [1.0, 1.0, 1.0, 1.0];
let lightSpecular = [1.0, 1.0, 1.0, 1.0];

let materialAmbient = [1.0, 0.0, 1.0, 1.0];
let materialDiffuse = [1.0, 0.8, 0.0, 1.0];
let materialSpecular = [1.0, 0.8, 0.0, 1.0];
let materialShininess = 100.0;

gl.clearColor(0.5, 0.5, 0.5, 1.0);

//鼠标滚轮控制模型放大缩小
document.addEventListener('mousewheel', mousewheel, false);
//键盘事件
document.addEventListener('keydown', onKeyDown, false);

//camera
let cameraAngleRadians = degToRad(0);

let texture_name_to_texture = {
	"eye1.png": init_texture("../model/better/eye1.png"),
	"mouth1.png": init_texture("../model/better/mouth1.png"),
	"pikagen.png": init_texture("../model/better/pikagen.png")
};

let patrick_obj = {};
patrick_obj.vertex_buffer = gl.createBuffer();
patrick_obj.index_buffer = gl.createBuffer();
patrick_obj.color_buffer = gl.createBuffer();
patrick_obj.normal_buffer = gl.createBuffer();
patrick_obj.texture_buffer = gl.createBuffer();

let patrick_center_vec3 = [0, 0, 0];
let patrick_direct_z_vec4 = [0, 1, 0, 1];
let patrick_translation_vec3 = [350, 0, -600];
let patrick_rotation_vec3 = [degToRad(0), degToRad(0), degToRad(0)];
let patrick_scale_vec3 = [0.8, 0.8, 0.8];
let patrick_view_radians = degToRad(100);

let patrick_colors = [];
let patrick_vertices = [];
let patrick_vertex_indexes = [];
let patrick_normals = [];
let patrick_textpo = [];

let patrick_textures_indexes = [];
let patrick_texture = init_texture("../model/better/Char_Patrick.png");

init_patrick_data_list();
patrick_convert_data_to_buffer();

let pikaqiu_obj = {};
pikaqiu_obj.vertex_buffer = gl.createBuffer();
pikaqiu_obj.index_buffer = gl.createBuffer();
pikaqiu_obj.color_buffer = gl.createBuffer();
pikaqiu_obj.normal_buffer = gl.createBuffer();
pikaqiu_obj.texture_buffer = gl.createBuffer();

let pikaqiu_center_vec3 = [0, 0, 0];
let pikaqiu_direct_z_vec4 = [0, 1, 0, 1];
let pikaqiu_translation_vec3 = [-300, 75, -400];
let pikaqiu_rotation_vec3 = [degToRad(0), degToRad(0), degToRad(0)];
let pikaqiu_scale_vec3 = [0.8, 0.8, 0.8];
let pikaqiu_view_radians = degToRad(100);  // TODO 这里好像没有用到??? 但是派大星的是用到了

let pikaqiu_colors = [];
let pikaqiu_vertices = [];
let pikaqiu_normals = [];
let pikaqiu_textures = [];
let pikaqiu_part_objs;  // 就是之前的 piTemp, 里面存储的是每个部分的 obj
init_pikaqiu_as_obj_part_list();

let ground_obj = {};
ground_obj.vertex_buffer = gl.createBuffer();
ground_obj.index_buffer = gl.createBuffer();
ground_obj.color_buffer = gl.createBuffer();
ground_obj.normal_buffer = gl.createBuffer();
let ground_center_vec3 = [0, 0, 0];
let ground_direct_z_vec4 = [1, 0, 0, 1];
let ground_translation_vec3 = [0, 0, -600];
let ground_rotation_vec3 = [degToRad(0), degToRad(0), degToRad(0)];
let ground_scale_vec3 = [1, 1, 1];
let ground_view_radians = degToRad(100);

let ground_colors = [];
let ground_vertices = [];
let ground_vertex_indexes = [];
let ground_normals = [];
init_ground();
ground_convert_data_to_buffer();

// 光源球
let light_ball_obj = {};
light_ball_obj.vertex_buffer = gl.createBuffer();
light_ball_obj.index_buffer = gl.createBuffer();
light_ball_obj.color_buffer = gl.createBuffer();
light_ball_obj.normal_buffer = gl.createBuffer();
let light_ball_center_vec3 = [0, 0, 0];
let light_ball_direct_z_vec4 = [0, 0, 1, 1];
let light_ball_translation_vec3 = lightPosition;
let light_ball_rotation_vec3 = [degToRad(0), degToRad(0), degToRad(0)];
let light_ball_scale_vec3 = [0.1, 0.1, 0.1];

let light_ball_colors = [];
let light_ball_vertices = [];
let light_ball_vertex_indexes = [];
let light_ball_normals = [];

init_light_ball_data();
light_ball_convert_data_to_buffer();

let g_last = Date.now();
let ANGLE_STEP = 45.0;
let JUMP_STEP = 10000000.0;

let isUp = true;
let isDown = false;
let pikaqiu_translation_0 = [0, 0, 0];
pikaqiu_translation_0[0] = pikaqiu_translation_vec3[0];
pikaqiu_translation_0[1] = pikaqiu_translation_vec3[1];
pikaqiu_translation_0[2] = pikaqiu_translation_vec3[2];
let pikaqiu_rotation0 = [0, 0, 0];
pikaqiu_rotation0[0] = pikaqiu_rotation_vec3[0];
pikaqiu_rotation0[1] = pikaqiu_rotation_vec3[1];
pikaqiu_rotation0[2] = pikaqiu_rotation_vec3[2];
let pikaqiu_step1 = true;

let isUp2 = true;
let isDown2 = false;
let patrick_translation_0 = [0, 0, 0];
patrick_translation_0[0] = patrick_translation_vec3[0];
patrick_translation_0[1] = patrick_translation_vec3[1];
patrick_translation_0[2] = patrick_translation_vec3[2];
let patrick_rotation0 = [0, 0, 0];
patrick_rotation0[0] = patrick_rotation_vec3[0];
patrick_rotation0[1] = patrick_rotation_vec3[1];
patrick_rotation0[2] = patrick_rotation_vec3[2];
let patrick_move_decide = true;

let isAlive = true;  // 是否在动
let tick = function () {
	animate_patrick();
	requestAnimationId = requestAnimationFrame(tick, canvas); // Request that the
	drawSceneIndex();
};

tick();

function animateCamera(angle) {
	if (isAlive) {
		// Calculate the elapsed time
		let now = Date.now();
		let elapsed = now - g_last;
		g_last = now;
		// Update the current rotation angle (adjusted by the elapsed time)
		let newAngle = angle + (ANGLE_STEP * elapsed) / 100000.0;
		return newAngle %= 360;
	} else {
		return angle;
	}
}

function animate_patrick() {

	if (isAlive) {

		if (patrick_move_decide) {
			if (patrick_rotation_vec3[1] - patrick_rotation0[1] < 45 * Math.PI
				/ 180) {
				patrick_rotation_vec3[1] = patrick_rotation_vec3[1] + 5
					* Math.PI
					/ 180;
			} else if ((patrick_translation_vec3[0] - patrick_translation_0[0]
				< 200 * patrick_direct_z_vec4[0] && patrick_direct_z_vec4[0]
				> 0) ||
				(patrick_translation_vec3[0] - patrick_translation_0[0] > 200
					* patrick_direct_z_vec4[0] && patrick_direct_z_vec4[0]
					< 0)) {
				patrick_translation_vec3[0] = patrick_translation_vec3[0] + 10
					* patrick_direct_z_vec4[0];
				patrick_translation_vec3[1] = patrick_translation_vec3[1] + 10
					* patrick_direct_z_vec4[1];
				patrick_translation_vec3[2] = patrick_translation_vec3[2] + 10
					* patrick_direct_z_vec4[2];
			} else {
				patrick_move_decide = false;
				patrick_translation_0[0] = patrick_translation_vec3[0];
				patrick_translation_0[1] = patrick_translation_vec3[1];
				patrick_translation_0[2] = patrick_translation_vec3[2];
				patrick_rotation0[0] = patrick_rotation_vec3[0];
				patrick_rotation0[1] = patrick_rotation_vec3[1];
				patrick_rotation0[2] = patrick_rotation_vec3[2];
			}

		} else {
			if (patrick_rotation_vec3[1] - patrick_rotation0[1] < 90 * Math.PI
				/ 180) {
				patrick_rotation_vec3[1] = patrick_rotation_vec3[1] + 5
					* Math.PI / 180;

			} else if ((patrick_translation_vec3[0] - patrick_translation_0[0]
				< 200 * patrick_direct_z_vec4[0] && patrick_direct_z_vec4[0]
				> 0) ||
				(patrick_translation_vec3[0] - patrick_translation_0[0] > 200
					* patrick_direct_z_vec4[0] && patrick_direct_z_vec4[0]
					< 0)) {
				patrick_translation_vec3[0] = patrick_translation_vec3[0] + 10
					* patrick_direct_z_vec4[0];
				patrick_translation_vec3[1] = patrick_translation_vec3[1] + 10
					* patrick_direct_z_vec4[1];
				patrick_translation_vec3[2] = patrick_translation_vec3[2] + 10
					* patrick_direct_z_vec4[2];
			} else {
				patrick_translation_0[0] = patrick_translation_vec3[0];
				patrick_translation_0[1] = patrick_translation_vec3[1];
				patrick_translation_0[2] = patrick_translation_vec3[2];
				patrick_rotation0[0] = patrick_rotation_vec3[0];
				patrick_rotation0[1] = patrick_rotation_vec3[1];
				patrick_rotation0[2] = patrick_rotation_vec3[2];
			}
		}

		if (pikaqiu_step1) {
			if (pikaqiu_translation_vec3[2] - pikaqiu_translation_0[2] < 200) {
				pikaqiu_translation_vec3[2] += 5;
			} else if (pikaqiu_rotation_vec3[1] - pikaqiu_rotation0[1] < 90
				* Math.PI
				/ 180) {
				pikaqiu_rotation_vec3[1] = pikaqiu_rotation_vec3[1] + 5
					* Math.PI
					/ 180;
			} else if (pikaqiu_translation_vec3[0] - pikaqiu_translation_0[0]
				< 200) {
				pikaqiu_translation_vec3[0] += 5;
			} else {
				pikaqiu_step1 = false;
				pikaqiu_translation_0[0] = pikaqiu_translation_vec3[0];
				pikaqiu_translation_0[1] = pikaqiu_translation_vec3[1];
				pikaqiu_translation_0[2] = pikaqiu_translation_vec3[2];
				pikaqiu_rotation0[0] = pikaqiu_rotation_vec3[0];
				pikaqiu_rotation0[1] = pikaqiu_rotation_vec3[1];
				pikaqiu_rotation0[2] = pikaqiu_rotation_vec3[2];
			}
		} else {
			if (pikaqiu_rotation_vec3[1] - pikaqiu_rotation0[1] < 90 * Math.PI
				/ 180) {
				pikaqiu_rotation_vec3[1] = pikaqiu_rotation_vec3[1] + 5
					* Math.PI
					/ 180;
			} else if (pikaqiu_translation_0[2] - pikaqiu_translation_vec3[2]
				< 200) {
				pikaqiu_translation_vec3[2] -= 5;
			} else if (pikaqiu_rotation_vec3[1] - pikaqiu_rotation0[1] < 180
				* Math.PI / 180) {
				pikaqiu_rotation_vec3[1] = pikaqiu_rotation_vec3[1] + 5
					* Math.PI
					/ 180;
			} else if (-pikaqiu_translation_vec3[0] + pikaqiu_translation_0[0]
				< 200) {
				pikaqiu_translation_vec3[0] -= 5;
			} else if (pikaqiu_rotation_vec3[1] - pikaqiu_rotation0[1] < 270
				* Math.PI / 180) {
				pikaqiu_rotation_vec3[1] = pikaqiu_rotation_vec3[1] + 5
					* Math.PI
					/ 180;
			} else {
				pikaqiu_step1 = true;
				pikaqiu_translation_0[0] = pikaqiu_translation_vec3[0];
				pikaqiu_translation_0[1] = pikaqiu_translation_vec3[1];
				pikaqiu_translation_0[2] = pikaqiu_translation_vec3[2];
				pikaqiu_rotation0[0] = pikaqiu_rotation_vec3[0];
				pikaqiu_rotation0[1] = pikaqiu_rotation_vec3[1];
				pikaqiu_rotation0[2] = pikaqiu_rotation_vec3[2];
			}
		}
	}
}

function patrick_convert_data_to_buffer() {
	gl.bindBuffer(gl.ARRAY_BUFFER, patrick_obj.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(patrick_textpo),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, patrick_obj.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(patrick_vertex_indexes),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, patrick_obj.color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(patrick_colors),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, patrick_obj.normal_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(patrick_normals),
		gl.STATIC_DRAW);

	// 绑定材质的纹理
	gl.bindBuffer(gl.ARRAY_BUFFER, patrick_obj.texture_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(patrick_textures_indexes),
		gl.STATIC_DRAW);
}

function pikaqiu_convert_data_to_buffer_partly() {
	gl.bindBuffer(gl.ARRAY_BUFFER, pikaqiu_obj.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pikaqiu_vertices),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, pikaqiu_obj.color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pikaqiu_colors),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, pikaqiu_obj.normal_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pikaqiu_normals),
		gl.STATIC_DRAW);

	// 绑定材质的纹理
	gl.bindBuffer(gl.ARRAY_BUFFER, pikaqiu_obj.texture_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pikaqiu_textures),
		gl.STATIC_DRAW);
}

function ground_convert_data_to_buffer() {
	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ground_vertices),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ground_obj.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(ground_vertex_indexes),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ground_colors),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.normal_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ground_normals),
		gl.STATIC_DRAW);
}

function light_ball_convert_data_to_buffer() {
	gl.bindBuffer(gl.ARRAY_BUFFER, light_ball_obj.vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(light_ball_vertices),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, light_ball_obj.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(light_ball_vertex_indexes),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, light_ball_obj.color_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(light_ball_colors),
		gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, light_ball_obj.normal_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(light_ball_normals),
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
			patrick_view_radians = degToRad(
				radToDeg(patrick_view_radians) < 150 ? radToDeg(
					patrick_view_radians) + 1 : radToDeg(
					patrick_view_radians));
		}
		if (e.wheelDelta < 0) { //当滑轮向下滚动时
			patrick_view_radians = degToRad(
				radToDeg(patrick_view_radians) > 30 ? radToDeg(
					patrick_view_radians) - 1 : radToDeg(
					patrick_view_radians));
		}
	} else if (e.detail) { //Firefox滑轮事件
		if (e.detail > 0) { //当滑轮向上滚动时
			patrick_view_radians = degToRad(
				radToDeg(patrick_view_radians) < 150 ? radToDeg(
					patrick_view_radians) + 1 : radToDeg(
					patrick_view_radians));
		}
		if (e.detail < 0) { //当滑轮向下滚动时
			patrick_view_radians = degToRad(
				radToDeg(patrick_view_radians) > 30 ? radToDeg(
					patrick_view_radians) - 1 : radToDeg(
					patrick_view_radians));
		}
	}
}

//监听键盘事件
function onKeyDown(event) {
	//A
	if (event.keyCode === 65) {
		patrick_translation_vec3[0] = patrick_translation_vec3[0] - 10;
	}
	//D
	if (event.keyCode === 68) {
		patrick_translation_vec3[0] = patrick_translation_vec3[0] + 10;
	}
	//W
	if (event.keyCode === 87) {
		patrick_translation_vec3[0] = patrick_translation_vec3[0] + 10
			* patrick_direct_z_vec4[0];
		patrick_translation_vec3[1] = patrick_translation_vec3[1] + 10
			* patrick_direct_z_vec4[1];
		patrick_translation_vec3[2] = patrick_translation_vec3[2] + 10
			* patrick_direct_z_vec4[2];
	}
	//S
	if (event.keyCode === 83) {
		patrick_translation_vec3[0] = patrick_translation_vec3[0] - 10
			* patrick_direct_z_vec4[0];
		patrick_translation_vec3[1] = patrick_translation_vec3[1] - 10
			* patrick_direct_z_vec4[1];
		patrick_translation_vec3[2] = patrick_translation_vec3[2] - 10
			* patrick_direct_z_vec4[2];
	}
	//LEFT
	if (event.keyCode === 37) {
		pikaqiu_translation_vec3[0] = pikaqiu_translation_vec3[0] - 10;
	}
	//RIGHT
	if (event.keyCode === 39) {
		pikaqiu_translation_vec3[0] = pikaqiu_translation_vec3[0] + 10;
	}
	//UP
	if (event.keyCode === 38) {
		pikaqiu_translation_vec3[0] = pikaqiu_translation_vec3[0] + 10
			* pikaqiu_direct_z_vec4[0];
		pikaqiu_translation_vec3[1] = pikaqiu_translation_vec3[1] + 10
			* pikaqiu_direct_z_vec4[1];
		pikaqiu_translation_vec3[2] = pikaqiu_translation_vec3[2] + 10
			* pikaqiu_direct_z_vec4[2];
	}
	//DOWN
	if (event.keyCode === 40) {

		pikaqiu_translation_vec3[0] = pikaqiu_translation_vec3[0] - 10
			* pikaqiu_direct_z_vec4[0];
		pikaqiu_translation_vec3[1] = pikaqiu_translation_vec3[1] - 10
			* pikaqiu_direct_z_vec4[1];
		pikaqiu_translation_vec3[2] = pikaqiu_translation_vec3[2] - 10
			* pikaqiu_direct_z_vec4[2];
	}

	//Z
	if (event.keyCode === 90) {
		patrick_rotation_vec3[1] = patrick_rotation_vec3[1] - 10 * Math.PI
			/ 180;
	}
	//C
	if (event.keyCode === 67) {
		patrick_rotation_vec3[1] = patrick_rotation_vec3[1] + 10 * Math.PI
			/ 180;
	}
	//B
	if (event.keyCode === 66) {
		pikaqiu_rotation_vec3[1] = pikaqiu_rotation_vec3[1] - 10 * Math.PI
			/ 180;
	}
	//M
	if (event.keyCode === 77) {
		pikaqiu_rotation_vec3[1] = pikaqiu_rotation_vec3[1] + 10 * Math.PI
			/ 180;
	}

	//1
	if (event.keyCode === 97) {
		patrick_scale_vec3[0] = patrick_scale_vec3[0] - 0.01;
		patrick_scale_vec3[1] = patrick_scale_vec3[0];
		patrick_scale_vec3[2] = patrick_scale_vec3[0];
	}

	//2
	if (event.keyCode === 98) {
		patrick_scale_vec3[0] = patrick_scale_vec3[0] + 0.01;
		patrick_scale_vec3[1] = patrick_scale_vec3[0];
		patrick_scale_vec3[2] = patrick_scale_vec3[0];
	}

	//4
	if (event.keyCode === 100) {
		pikaqiu_scale_vec3[0] = pikaqiu_scale_vec3[0] - 0.01;
		pikaqiu_scale_vec3[1] = pikaqiu_scale_vec3[0];
		pikaqiu_scale_vec3[2] = pikaqiu_scale_vec3[0];
	}

	//5
	if (event.keyCode === 101) {
		pikaqiu_scale_vec3[0] = pikaqiu_scale_vec3[0] + 0.01;
		pikaqiu_scale_vec3[1] = pikaqiu_scale_vec3[0];
		pikaqiu_scale_vec3[2] = pikaqiu_scale_vec3[0];
	}

	if (event.keyCode === 96) {
		isDecide = !isDecide;
	}
}

document.getElementById("Button0").onclick = function () {
	lightPosition[0] += 10;
	light_ball_translation_vec3[0] = lightPosition[0];
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
		new Float32Array(lightPosition));
};

document.getElementById("Button1").onclick = function () {
	lightPosition[0] -= 10;
	light_ball_translation_vec3[0] = lightPosition[0];
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
		new Float32Array(lightPosition));
};

document.getElementById("Button2").onclick = function () {
	lightPosition[1] += 10;
	light_ball_translation_vec3[1] = lightPosition[1];
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
		new Float32Array(lightPosition));
};

document.getElementById("Button3").onclick = function () {
	lightPosition[1] -= 10;
	light_ball_translation_vec3[1] = lightPosition[1];
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
		new Float32Array(lightPosition));
};

document.getElementById("Button4").onclick = function () {
	lightPosition[2] += 10;
	light_ball_translation_vec3[2] = lightPosition[2];
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
		new Float32Array(lightPosition));
};

document.getElementById("Button5").onclick = function () {
	lightPosition[2] -= 10;
	light_ball_translation_vec3[2] = lightPosition[2];
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
		new Float32Array(lightPosition));
};

document.getElementById("Button6").onclick = function () {
	cameraAngleRadians = degToRad(radToDeg(cameraAngleRadians) + 10);
};
document.getElementById("Button7").onclick = function () {
	cameraAngleRadians = degToRad(radToDeg(cameraAngleRadians) - 10);
};

document.getElementById("Button8").onclick = function () {
	patrick_scale_vec3[0] = patrick_scale_vec3[0] + 0.01;
	patrick_scale_vec3[1] = patrick_scale_vec3[0];
	patrick_scale_vec3[2] = patrick_scale_vec3[0];
};
document.getElementById("Button9").onclick = function () {
	patrick_scale_vec3[0] = patrick_scale_vec3[0] - 0.01;
	patrick_scale_vec3[1] = patrick_scale_vec3[0];
	patrick_scale_vec3[2] = patrick_scale_vec3[0];
};

document.getElementById("Button10").onclick = function () {
	pikaqiu_scale_vec3[0] = pikaqiu_scale_vec3[0] + 0.01;
	pikaqiu_scale_vec3[1] = pikaqiu_scale_vec3[0];
	pikaqiu_scale_vec3[2] = pikaqiu_scale_vec3[0];
};
document.getElementById("Button11").onclick = function () {
	pikaqiu_scale_vec3[0] = pikaqiu_scale_vec3[0] - 0.01;
	pikaqiu_scale_vec3[1] = pikaqiu_scale_vec3[0];
	pikaqiu_scale_vec3[2] = pikaqiu_scale_vec3[0];
};

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

	let ambientProduct = [0, 0, 0, 0];
	ambientProduct[0] = lightAmbient[0] * materialAmbient[0];
	ambientProduct[1] = lightAmbient[1] * materialAmbient[1];
	ambientProduct[2] = lightAmbient[2] * materialAmbient[2];
	ambientProduct[3] = lightAmbient[3] * materialAmbient[3];

	let diffuseProduct = m4.multiply(lightDiffuse, materialDiffuse);

	let specularProduct = [0, 0, 0, 0];
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
	gl.bindBuffer(gl.ARRAY_BUFFER, patrick_obj.color_buffer);
	let size = 3;
	let type = gl.FLOAT;
	let normalize = false; // normalize the data (convert from 0-255 to 0-1)
	let stride = 0;
	let offset = 0;
	gl.vertexAttribPointer(colorLocation, size, type, normalize, stride,
		offset);

	// 冲入纹理数据
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, patrick_texture);
	gl.uniform1i(u_Sampler, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, patrick_obj.texture_buffer);
	gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_TexCoord);

	// 计算图像转换
	let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	let zNear = 1;
	let zFar = 2000;
	let perMatrix = m4.perspective(patrick_view_radians, aspect, zNear,
		zFar);

	// 相机
	let radius = 250;
	let fPosition = [radius, 0, 0];
	let camera_translation = [-150, 0, -600];

	let cameraChangeMatrix = m4.translation(camera_translation[0],
		camera_translation[1], camera_translation[2]);
	let cameraMatrix = m4.yRotation(cameraAngleRadians);
	cameraMatrix = m4.translate(cameraMatrix, 250, 200, radius * 1.5);
	let cameraPosition = [
		cameraMatrix[12],
		cameraMatrix[13],
		cameraMatrix[14],
	];
	let up = [0, 1, 0];
	cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);
	let cameraUnchangedMatrix = m4.translation(-camera_translation[0],
		-camera_translation[1], -camera_translation[2]);

	cameraMatrix = m4.multiply(m4.multiply(cameraChangeMatrix, cameraMatrix),
		cameraUnchangedMatrix);
	let viewMatrix = m4.inverse(cameraMatrix);
	let viewProjectionMatrix = m4.multiply(perMatrix, viewMatrix);

	gl.uniformMatrix4fv(viewProjectionLocation, false, viewProjectionMatrix);

	let changeMatrix = m4.translation(patrick_center_vec3[0],
		patrick_center_vec3[1],
		patrick_center_vec3[2]);
	let T = m4.translation(patrick_translation_vec3[0],
		patrick_translation_vec3[1],
		patrick_translation_vec3[2]);
	let Rx = m4.axisRotation([1, 0, 0, 1], patrick_rotation_vec3[0]);
	let Ry = m4.axisRotation([0, 1, 0, 1], patrick_rotation_vec3[1]);
	let Rz = m4.axisRotation([0, 0, 1, 1], patrick_rotation_vec3[2]);
	let S = m4.scaling(patrick_scale_vec3[0], patrick_scale_vec3[1],
		patrick_scale_vec3[2]);
	let unchangedMatrix = m4.translation(-patrick_center_vec3[0],
		-patrick_center_vec3[1],
		-patrick_center_vec3[2]);
	let mvMatrix = m4.multiply(m4.multiply(m4.multiply(
		m4.multiply(m4.multiply(m4.multiply(changeMatrix, T), Rx), Ry), Rz), S),
		unchangedMatrix);

	patrick_direct_z_vec4 = [0, 0, 1, 1];
	patrick_direct_z_vec4 = m4.transformNormal(mvMatrix, patrick_direct_z_vec4);
	gl.uniformMatrix4fv(matrixLocation, false, mvMatrix);

	gl.enableVertexAttribArray(normalLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, patrick_obj.normal_buffer);
	size = 3;
	type = gl.FLOAT;
	normalize = false;
	stride = 0;
	offset = 0;
	gl.vertexAttribPointer(normalLocation, size, type, normalize, stride,
		offset);

	//顶点数据buffer
	gl.enableVertexAttribArray(positionLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, patrick_obj.vertex_buffer);
	size = 3;
	type = gl.FLOAT;
	normalize = false;
	stride = 0;
	offset = 0;
	gl.vertexAttribPointer(positionLocation, size, type, normalize, stride,
		offset);

	u_mcolor = 1.0;
	gl.uniform1f(gl.getUniformLocation(program, "mcolor"), u_mcolor);

	u_decide = 1.0;

	gl.uniform1f(gl.getUniformLocation(program, "decide"), u_decide);

	gl.drawArrays(gl.TRIANGLES, 0, patrick_textpo.length);

	u_mcolor = 0.0;
	gl.uniform1f(gl.getUniformLocation(program, "mcolor"), u_mcolor);

	// 绘制 bilibili2

	changeMatrix = m4.translation(pikaqiu_center_vec3[0],
		pikaqiu_center_vec3[1],
		pikaqiu_center_vec3[2]);
	T = m4.translation(pikaqiu_translation_vec3[0],
		pikaqiu_translation_vec3[1],
		pikaqiu_translation_vec3[2]);
	Rx = m4.axisRotation([1, 0, 0, 1], pikaqiu_rotation_vec3[0]);
	Ry = m4.axisRotation([0, 1, 0, 1], pikaqiu_rotation_vec3[1]);
	Rz = m4.axisRotation([0, 0, 1, 1], pikaqiu_rotation_vec3[2]);
	S = m4.scaling(pikaqiu_scale_vec3[0], pikaqiu_scale_vec3[1],
		pikaqiu_scale_vec3[2]);
	unchangedMatrix = m4.translation(-pikaqiu_center_vec3[0],
		-pikaqiu_center_vec3[1],
		-pikaqiu_center_vec3[2]);

	mvMatrix = m4.multiply(m4.multiply(m4.multiply(
		m4.multiply(m4.multiply(m4.multiply(changeMatrix, T), Rx), Ry), Rz), S),
		unchangedMatrix);

	pikaqiu_direct_z_vec4 = [0, 0, 1, 1];
	pikaqiu_direct_z_vec4 = m4.transformNormal(mvMatrix, pikaqiu_direct_z_vec4);

	// 绘制 bilibili2

	for (let i = 0; i < pikaqiu_part_objs.length; ++i) {
		u_decide = 2;

		gl.uniform1f(gl.getUniformLocation(program, "decide"), u_decide);

		init_data_for_pikaqiu_partly(i);

		let current_obj_texture = get_texture_for_obj(pikaqiu_part_objs[i]);

		pikaqiu_convert_data_to_buffer_partly();

		// 顶点颜色buffer
		gl.enableVertexAttribArray(colorLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, pikaqiu_obj.color_buffer);
		size = 3;
		type = gl.FLOAT;
		normalize = false;  // normalize the data (convert from 0-255 to 0-1)
		stride = 0;
		offset = 0;
		gl.vertexAttribPointer(colorLocation, size, type, normalize, stride,
			offset);

		gl.uniformMatrix4fv(matrixLocation, false, mvMatrix);

		gl.enableVertexAttribArray(normalLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, pikaqiu_obj.normal_buffer);
		size = 3;
		type = gl.FLOAT;
		normalize = false;
		stride = 0;
		offset = 0;
		gl.vertexAttribPointer(normalLocation, size, type, normalize, stride,
			offset);

		// 冲入纹理数据
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, current_obj_texture);
		gl.uniform1i(u_Sampler, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, pikaqiu_obj.texture_buffer);
		gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(a_TexCoord);

		gl.enableVertexAttribArray(positionLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, pikaqiu_obj.vertex_buffer);
		size = 3;
		type = gl.FLOAT;
		normalize = false;
		stride = 0;
		offset = 0;
		gl.vertexAttribPointer(positionLocation, size, type, normalize, stride,
			offset);

		// 绘制
		gl.drawArrays(gl.TRIANGLES, 0, pikaqiu_vertices.length);

	}

	// 绘制光源球
	gl.enableVertexAttribArray(positionLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, light_ball_obj.vertex_buffer);
	size = 3;
	type = gl.FLOAT;
	normalize = false;
	stride = 0;
	offset = 0;
	gl.vertexAttribPointer(positionLocation, size, type, normalize, stride,
		offset);
	// 顶点颜色buffer
	gl.enableVertexAttribArray(colorLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, light_ball_obj.color_buffer);
	size = 3;
	type = gl.FLOAT;
	normalize = false; // normalize the data (convert from 0-255 to 0-1)
	stride = 0;
	offset = 0;
	gl.vertexAttribPointer(colorLocation, size, type, normalize, stride,
		offset);

	changeMatrix = m4.translation(light_ball_center_vec3[0],
		light_ball_center_vec3[1],
		light_ball_center_vec3[2]);
	T = m4.translation(light_ball_translation_vec3[0],
		light_ball_translation_vec3[1],
		light_ball_translation_vec3[2]);
	Rx = m4.axisRotation([1, 0, 0, 1], light_ball_rotation_vec3[0]);
	Ry = m4.axisRotation([0, 1, 0, 1], light_ball_rotation_vec3[1]);
	Rz = m4.axisRotation([0, 0, 1, 1], light_ball_rotation_vec3[2]);
	S = m4.scaling(light_ball_scale_vec3[0], light_ball_scale_vec3[1],
		light_ball_scale_vec3[2]);
	unchangedMatrix = m4.translation(-light_ball_center_vec3[0],
		-light_ball_center_vec3[1], -light_ball_center_vec3[2]);

	mvMatrix = m4.multiply(m4.multiply(m4.multiply(
		m4.multiply(m4.multiply(m4.multiply(changeMatrix, T), Rx), Ry), Rz), S),
		unchangedMatrix);
	gl.uniformMatrix4fv(matrixLocation, false, mvMatrix);

	light_ball_direct_z_vec4 = [0, 0, 1, 1];
	light_ball_direct_z_vec4 = m4.transformNormal(mvMatrix,
		light_ball_direct_z_vec4);

	u_decide = 0;

	gl.uniform1f(gl.getUniformLocation(program, "decide"), u_decide);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, light_ball_obj.index_buffer);
	// // // 绘制
	gl.drawElements(gl.TRIANGLES, light_ball_vertex_indexes.length,
		gl.UNSIGNED_SHORT,
		0);

	// ground
	gl.enableVertexAttribArray(positionLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.vertex_buffer);
	size = 3;
	type = gl.FLOAT;
	normalize = false;
	stride = 0;
	offset = 0;
	gl.vertexAttribPointer(positionLocation, size, type, normalize, stride,
		offset);
	// 顶点颜色buffer
	gl.enableVertexAttribArray(colorLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, ground_obj.color_buffer);
	size = 3;
	type = gl.FLOAT;
	normalize = false; // normalize the data (convert from 0-255 to 0-1)
	stride = 0;
	offset = 0;
	gl.vertexAttribPointer(colorLocation, size, type, normalize, stride,
		offset);

	changeMatrix = m4.translation(ground_center_vec3[0], ground_center_vec3[1],
		ground_center_vec3[2]);
	T = m4.translation(ground_translation_vec3[0],
		ground_translation_vec3[1],
		ground_translation_vec3[2]);
	Rx = m4.axisRotation([1, 0, 0, 1], ground_rotation_vec3[0]);
	Ry = m4.axisRotation([0, 1, 0, 1], ground_rotation_vec3[1]);
	Rz = m4.axisRotation([0, 0, 1, 1], ground_rotation_vec3[2]);
	S = m4.scaling(ground_scale_vec3[0], ground_scale_vec3[1],
		ground_scale_vec3[2]);
	unchangedMatrix = m4.translation(-ground_center_vec3[0],
		-ground_center_vec3[1],
		-ground_center_vec3[2]);

	mvMatrix = m4.multiply(m4.multiply(m4.multiply(
		m4.multiply(m4.multiply(m4.multiply(changeMatrix, T), Rx), Ry), Rz), S),
		unchangedMatrix);
	gl.uniformMatrix4fv(matrixLocation, false, mvMatrix);

	ground_direct_z_vec4 = [0, 0, 1, 1];
	ground_direct_z_vec4 = m4.transformNormal(mvMatrix, ground_direct_z_vec4);

	u_decide = 4;

	gl.uniform1f(gl.getUniformLocation(program, "decide"), u_decide);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ground_obj.index_buffer);
	// // // 绘制
	gl.drawElements(gl.TRIANGLES, ground_vertex_indexes.length,
		gl.UNSIGNED_SHORT, 0);
}

function init_patrick_data_list() {
	let temp = get_webgl_model_object(patrick);
	temp = flatten_webgl_model_object(temp);
	patrick_vertices = all_multi_by(temp.vertices, 400);
	patrick_vertex_indexes = temp.v_indexes;
	patrick_colors = temp.colors;
	patrick_normals = temp.normals;
	patrick_textures_indexes = temp.textures;

	for (let i = 0; i < patrick_vertex_indexes.length; ++i) {
		patrick_textpo.push(patrick_vertices[3 * patrick_vertex_indexes[i]]);
		patrick_textpo.push(
			patrick_vertices[3 * patrick_vertex_indexes[i] + 1]);
		patrick_textpo.push(
			patrick_vertices[3 * patrick_vertex_indexes[i] + 2]);
	}

	return temp
}

function init_pikaqiu_as_obj_part_list() {
	pikaqiu_part_objs = get_all_part_as_obj_list(pikaqiu)
}

function init_data_for_pikaqiu_partly(index) {
	pikaqiu_vertices = all_multi_by(
		make_one_dimension(pikaqiu_part_objs[index].vertices), 2);
	pikaqiu_colors = make_one_dimension(pikaqiu_part_objs[index].colors);
	pikaqiu_normals = make_one_dimension(pikaqiu_part_objs[index].normals);
	pikaqiu_textures = make_one_dimension(pikaqiu_part_objs[index].textures)

}

function init_ground() {
	ground_vertices = [
		800, -20, 500,
		-800, -20, 500, // v0 White
		-800, -30, 500, 800, -30, 500, // v1 Magenta
		800, -30, -500, 800, -20, -500, // v2 Red
		-800, -20, -500, -800, -30, -500, // v3 Yellow
	];

	ground_vertex_indexes = [
		0, 1, 2, 0, 2, 3, // 前
		0, 3, 4, 0, 4, 5, // 右
		0, 5, 6, 0, 6, 1, // 上
		1, 6, 7, 1, 7, 2, // 左
		7, 4, 3, 7, 3, 2, // 下
		4, 7, 6, 4, 6, 5 // 后
	];

	ground_colors = [
		0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0
	]

}

function init_light_ball_data() {
	let tobj = {};
	tobj = config_tinker_obj(tobj, tinker_obj_3_config);
	light_ball_vertices = tobj.vertices;
	light_ball_vertex_indexes = tobj.indexes;
	light_ball_colors = tobj.colors;
	light_ball_normals = tobj.normals
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

function get_texture_for_obj(_obj) {
	return texture_name_to_texture[_obj['mtl_info']['map_Kd']]
}