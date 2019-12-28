var radToDeg = function(r) {
	return r * 180 / Math.PI;
}

var degToRad =  function(d) {
	return d * Math.PI / 180;
}

var config_tinker_obj = function(tinker_obj, tinker_obj_config, color_name='Kd', is_test_true=false) {
    // 将所有的顶点赋值
    tinker_obj.vertices = []
    // 然后确定索引以及每个区域的颜色
    tinker_obj.indexes = []
    tinker_obj.colors = []
    //法向量
    tinker_obj.normals = []



    let base_index = 0
    for (let part = 0; part < tinker_obj_config.part_num; ++part) {
        // 首先获取到当前的 part
        let current_part = tinker_obj_config['part_' + part]
        // 然后对于这个 part 中的所有的点做一个拼接, 同时要修改所有的索引
        tinker_obj.vertices = tinker_obj.vertices.concat(current_part['vertices'])
        // 然后是这些顶点的颜色
        // 每三个维度一个颜色
        for (let vertice_cnt = 0; vertice_cnt < current_part['total_vertice_num']; ++vertice_cnt) {
            tinker_obj.colors.push(current_part['mtl_info'][color_name][0])
            tinker_obj.colors.push(current_part['mtl_info'][color_name][1])
            tinker_obj.colors.push(current_part['mtl_info'][color_name][2])
        }
        // 最后重新构建索引
        for (let index_pos = 0; index_pos < current_part['total_index_num']; ++index_pos) {
            tinker_obj.indexes.push(current_part['indexes'][index_pos] + base_index)
        }
        base_index += current_part['total_vertice_num']
    }

    var center = get_geo_center(tinker_obj.vertices, tinker_obj)

    for (let i = 0; i < (tinker_obj.vertices.length)*4/3; ++i)
        tinker_obj.normals.push(0.0)

    

    if(tinker_obj.indexes.length%3 == 0){
        for(let i = 0;i<tinker_obj.indexes.length-1;i += 3){

            let v1 = [tinker_obj.vertices[tinker_obj.indexes[i]*3],tinker_obj.vertices[tinker_obj.indexes[i]*3+1],tinker_obj.vertices[tinker_obj.indexes[i]*3+2]];
            let v2 = [tinker_obj.vertices[tinker_obj.indexes[i+1]*3],tinker_obj.vertices[tinker_obj.indexes[i+1]*3+1],tinker_obj.vertices[tinker_obj.indexes[i+1]*3+2]];
            let v3 = [tinker_obj.vertices[tinker_obj.indexes[i+2]*3],tinker_obj.vertices[tinker_obj.indexes[i+2]*3+1],tinker_obj.vertices[tinker_obj.indexes[i+2]*3+2]];

            let tx = v2[0]- v1[0];
            let ty = v2[1]- v1[1];
            let tz = v2[2]- v1[2];

            let ux = v3[0]- v2[0];
            let uy = v3[1]- v2[1];
            let uz = v3[2]- v2[2];

            let tvec = [tx, ty, tz]
            let uvec = [ux, uy, uz]

            var normal = m4.cross(tvec, uvec);
            normal = m4.normalize(normal);

            let triCenter = get_tri_center(v1,v2,v3);

            let center_to_tri_center = get_xxx(triCenter, center)

            if (m4.dot(normal, triCenter)<0) {
                normal[0] *= -1;
                normal[1] *= -1;
                normal[2] *= -1;
            }

            tinker_obj.normals[tinker_obj.indexes[i]*4+0] = normal[0];
            tinker_obj.normals[tinker_obj.indexes[i]*4+1] = normal[1];
            tinker_obj.normals[tinker_obj.indexes[i]*4+2] = normal[2];
            tinker_obj.normals[tinker_obj.indexes[i]*4+3] = 0;
            tinker_obj.normals[tinker_obj.indexes[i+1]*4+0] = normal[0];
            tinker_obj.normals[tinker_obj.indexes[i+1]*4+1] = normal[1];
            tinker_obj.normals[tinker_obj.indexes[i+1]*4+2] = normal[2];
            tinker_obj.normals[tinker_obj.indexes[i+2]*4+3] = 0;
            tinker_obj.normals[tinker_obj.indexes[i+2]*4+0] = normal[0];
            tinker_obj.normals[tinker_obj.indexes[i+2]*4+1] = normal[1];
            tinker_obj.normals[tinker_obj.indexes[i+2]*4+2] = normal[2];
            tinker_obj.normals[tinker_obj.indexes[i+2]*4+3] = 0;
        }
    }else{ 
        console.log('Failed')  
        return -1    
    }
    //计算法向量
    if (is_test_true)
        console.log('!!')
    for(let i=0;i<tinker_obj.normals.length-1; i += 4){
        var j = [tinker_obj.normals[i],tinker_obj.normals[i+1],tinker_obj.normals[i+2]];
        j = m4.normalize(j);
        tinker_obj.normals[i] = j[0];
        tinker_obj.normals[i+1] = j[1];
        tinker_obj.normals[i+2] = j[2];
        tinker_obj.normals[i+3] = 1;
    }
    return tinker_obj
}


var get_geo_center = function(vertices,tinker_obj) {
    var result = [0,0,0];
    for(let i = 0;i<tinker_obj.vertices.length/3;++i)
    {
        result[0]+=tinker_obj.vertices[i*3];
        result[1]+=tinker_obj.vertices[i*3+1];
        result[2]+=tinker_obj.vertices[i*3+2];
    }
    result[0] = result[0] / (tinker_obj.vertices.length/3)
    result[1] = result[1] / (tinker_obj.vertices.length/3)
    result[2] = result[2] / (tinker_obj.vertices.length/3)
    return result;
}


var get_tri_center = function(x1,x2,x3) {
    return [(x1[0]+x2[0]+x3[0])/3,(x1[1]+x2[1]+x3[1])/3,(x1[2]+x2[2]+x3[2])/3];
}

var get_xxx = function(x1,x2) {
    return [x1[0]-x2[0],x1[1] - x2[1],x1[2] - x2[2]];
}
