var get_webgl_model_object = function(model_json_obj) {
    let ans_obj = new Object()
    
    // 处理顶点
    vertices = model_json_obj['vertices'].slice(1, model_json_obj['vertices_number'] + 1)

    // 处理纹理
    textures = model_json_obj['textures'].slice(1, model_json_obj['textures_number'] + 1)

    // 处理法向量
    normals = model_json_obj['normals'].slice(1, model_json_obj['normals_number'] + 1)

    // 赋值给结果
    ans_obj.vertices = vertices
    ans_obj.textures = []
    ans_obj.normals = []
    ans_obj.colors = []
    ans_obj.v_indexes = []
    // ans_obj.vt_indexes = []
    // ans_obj.vn_indexes = []
    
    // 然后首先重新计算索引, 从零开始
    let total_part = model_json_obj.part_number
    for (let part = 0; part < total_part; ++part) {
        // 首先获取这个 part 的内容
        let part_str = 'part_' + part
        let current_part = model_json_obj[part_str]
        ans_obj[part_str] = new Object()
        let target = 'v_indexes'
        ans_obj[part_str][target] = (
            restart_from_zero(
                current_part[target].slice(1, current_part[target].length)
            )
        )
        target = 'vt_indexes'
        ans_obj[part_str][target] = (
            restart_from_zero(
                current_part[target].slice(1, current_part[target].length)
            )
        )
        target = 'vn_indexes'
        ans_obj[part_str][target] = (
            restart_from_zero(
                current_part[target].slice(1, current_part[target].length)
            )
        )

        // 然后同时将颜色的信息填入 colors 中
        let current_part_mtl = current_part.mtl_info
        ans_obj[part_str]['mtl_info'] = current_part_mtl
    }

    // 然后开始计算索引以及颜色的相关信息
    for (let part = 0; part < total_part; ++part) {
        // 首先合并所有的三个索引
        let part_str = 'part_' + part
        // 合并三个索引
        let target = 'v_indexes'
        ans_obj[target] = ans_obj[target].concat(ans_obj[part_str][target])
        
        // 然后处理法向量以及材质
        let current_vn_indexes = ans_obj[part_str]['vn_indexes']
        let current_vt_indexes = ans_obj[part_str]['vt_indexes']
        // 然后根据这个索引去查询原来的 textures & normals
        for (let j = 0; j < current_vn_indexes.length; ++j) {
            let current_vn_index = current_vn_indexes[j]
            let current_vt_index = current_vt_indexes[j]
            let current_vn = []
            let current_vt = []
            for (let k = 0; k < current_vn_index.length; ++k) {
                current_vn.push(
                    normals[current_vn_index[k]]
                )
            }
            for (let k = 0; k < current_vt_index.length; ++k) {
                current_vt.push(
                    textures[current_vt_index[k]]
                )
            }
            ans_obj.normals = ans_obj.normals.concat(current_vn)
            ans_obj.textures = ans_obj.textures.concat(current_vt)
        }


        // 然后对于根据顶点索引的个数配置颜色
        let v_indexes_number = ans_obj[part_str]['v_indexes'].length
        ans_obj['colors'] = ans_obj['colors'].concat(
            make_colors_of_one_part(
                ans_obj[part_str]['mtl_info'], v_indexes_number
            )
        )
    }    

    // 但会最终结果
    return ans_obj
}

let restart_from_zero = function(a_list_lists) {
    // 输入一个高维数组, 输出其中每一个维度都减一
    let ans_list = []
    for (let i = 0; i < a_list_lists.length; ++i) {
        let current_list = a_list_lists[i]
        let temp = []
        for (let j = 0; j < current_list.length; ++j) {
            temp.push(current_list[j] - 1)
        }
        ans_list.push(temp)
    }
    return ans_list
}

let make_colors_of_one_part = function(current_part_mtl, v_indexes_number) {
    let ans_list = []
    for (let i = 0; i < v_indexes_number; ++i) {
        // 这里暂时定义为构建 kd 变成颜色
        let temp = []
        let color_info = current_part_mtl['Kd']
        for (let j = 0; j < color_info.length; ++j) {
            temp.push(color_info[j])
        }
        ans_list.push(temp)
    }
    return ans_list
}


let make_one_dimension = function(list) {
    let ans_list = []
    for (let i = 0; i < list.length; ++i) {
        for (let j = 0; j < list[i].length; ++j) {
            ans_list.push(list[i][j])
        }
    }
    return ans_list
}


// 将这个对象中的关键列表变成 flatten 的
var flatten_webgl_model_object = function(model_obj) {
    model_obj.vertices = make_one_dimension(model_obj.vertices)
    model_obj.normals = make_one_dimension(model_obj.normals)
    model_obj.textures = make_one_dimension(model_obj.textures)
    model_obj.v_indexes = make_one_dimension(model_obj.v_indexes)
    // model_obj.vn_indexes = make_one_dimension(model_obj.vn_indexes)
    // model_obj.vt_indexes = make_one_dimension(model_obj.vt_indexes)
    model_obj.colors = make_one_dimension(model_obj.colors)
    return model_obj
}

var all_multi_by = function(list, number) {
    for (let i = 0; i < list.length; ++i) {
        list[i] *= number
    }
    return list
}

var get_all_part_as_obj_list = function(_pikaqiu) {
    let ans_objs = []

    // 处理顶点
    let vertices = _pikaqiu['vertices'].slice(1, _pikaqiu['vertices_number'] + 1)

    // 处理纹理
    let textures = _pikaqiu['textures'].slice(1, _pikaqiu['textures_number'] + 1)

    // 处理法向量
    let normals = _pikaqiu['normals'].slice(1, _pikaqiu['normals_number'] + 1)

    let part_number = _pikaqiu.part_number

    for (let i = 0; i < part_number; ++i) {
        let current_part = _pikaqiu['part_' + i]
        ans_objs.push(
            get_part_as_obj(current_part, vertices, textures, normals)
        )
    }


    return ans_objs
}


let get_part_as_obj = function(current_part, vertices, textures, normals) {
    let ans_obj = new Object()

    ans_obj.vertices = []
    ans_obj.textures = []
    ans_obj.normals = []
    ans_obj.colors = []

    let target = 'v_indexes'
    let current_v_indexes = restart_from_zero(
        current_part[target].slice(1, current_part[target].length)
    )

    target = 'vt_indexes'
    let current_vt_indexes = restart_from_zero(
        current_part[target].slice(1, current_part[target].length)
    )

    target = 'vn_indexes'
    let current_vn_indexes = restart_from_zero(
        current_part[target].slice(1, current_part[target].length)
    )

    ans_obj.vertices = pick_into_by_indexes(
        vertices, current_v_indexes
    )

    ans_obj.textures = pick_into_by_indexes(
        textures, current_vt_indexes
    )

    ans_obj.normals = pick_into_by_indexes(
        normals, current_vn_indexes
    )

    ans_obj.colors = make_colors_of_one_part(
        current_part['mtl_info'], current_v_indexes.length*3
    )

    ans_obj.mtl_info = current_part.mtl_info

    return ans_obj
}


let pick_into_by_indexes = function(list, indexes) {
    let ans_list = []
    for (let i = 0; i < indexes.length; ++i) {
        for (let j = 0; j < indexes[i].length; ++j) {
            ans_list.push(list[indexes[i][j]])
        }
    }
    return ans_list
}
