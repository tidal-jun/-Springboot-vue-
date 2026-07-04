import request from '@/utils/request'

//查询日志
export const queryPageApi = (page, pageSize) => request.get(`/log/page?page=${page}&pageSize=${pageSize}`)