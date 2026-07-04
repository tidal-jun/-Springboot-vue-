import request from "@/utils/request";

//员工性别信息
export const empGenderData = () => request.get('/report/empGenderData');

// 员工职位人数统计
export const empJobData = () => request.get('/report/empJobData');

// 学员学历统计
export const studentDegreeData = () => request.get('/report/studentDegreeData');

//班级人数统计
export const studentCountData = () => request.get('/report/studentCountData');
