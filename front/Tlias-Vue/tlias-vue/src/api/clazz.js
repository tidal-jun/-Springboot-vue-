import request from "@/utils/request";

//分页查询班级数据
export const queryPageApi = (name, begin, end, page, pageSize) =>
  request.get(`/clazzs?name=${name}&begin=${begin}&end=${end}&page=${page}&pageSize=${pageSize}`);

//添加班级
export const saveApi = (clazz) => request.post('/clazzs', clazz);

//根据ID查询
export const queryInfoApi = (id) => request.get(`/clazzs/${id}`);

//编辑班级
export const updateApi = (clazz) => request.put('/clazzs', clazz);

//删除班级
export const deleteApi = (id) => request.delete(`/clazzs/${id}`);

//查询全部班级信息
export const findAllApi = () => request.get('/clazzs/list');