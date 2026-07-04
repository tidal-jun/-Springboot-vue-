import request from "@/utils/request";

//分页查询
export const queryPageApi = (name, degree,clazzId, page, pageSize) =>
  request.get(`/students?name=${name}&degree=${degree}&clazzId=${clazzId}&page=${page}&pageSize=${pageSize}`);

//新增学员
export const saveApi = (student) => request.post('/students', student);


// 根据ID查询学员信息
export const queryInfoApi = (id) => request.get(`/students/${id}`);

// 修改学员
export const updateApi = (student) => request.put('/students', student);

// 批量删除
export const deleteApi = (ids) => request.delete(`/students/${ids}`);

//违规处理
export const handleViolationApi = (id,number) => request.put(`/students/violation/${id}/${number}`);
