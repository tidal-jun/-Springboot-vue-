import axios from 'axios';
import {ElMessage} from 'element-plus'
// 用于跳转
import router from '@/router';

//创建axios实例对象
const request = axios.create({
    
    //但是这里的URL是在src，如果在项目打包时，这个URL就固定死了，不便于后续更改
    // baseURL: 'https://apifoxmock.com/m1/3128855-1224313-default',

    //所以这里需要修改URL然后在vite.config.js进行路径URL的修改

    baseURL: '/api',
    timeout: 600000 //设置这么高是为了方便后端断点调试
})

//上面是创建实例对象，以后就不用axios发送异步请求了，可以基于我们创建的request发送请求


// 而后发送的请求 给服务器， 服务器返回的结果就可以通过下面的response拦截器，直接拦截回调

// 后端 -> 前端（响应）
//axios的响应 response 拦截器       这个是响应段拦截器，也就是拦截服务器也就是后端返回回来的结果
request.interceptors.response.use(
    (response) => {  //成功回调
        return response.data;
    },
    (error) => {    //失败回调
        if(error.response.status === 401){ //全等(类型 + 值)    == 会进行隐式转换 '401' 和 401算一样
            console.log('登录超时');
            //提示信息
            ElMessage.error('登录超时，请重新登录');
            //跳转到登录页面
            router.push('/login');
        }else {
            ElMessage.error('接口访问异常');
        }
        return Promise.reject(error)
    }
)


// 前端 -> 后端（请求）
// axuis的请求 request 拦截器 - 获取localStorage中的token，在请求头中增加token请求头
request.interceptors.request.use(
  (config) => { //成功回调
                        // 转换成JSON对象数据
    const loginUser = JSON.parse(localStorage.getItem('loginUser'));
    if(loginUser && loginUser.token){
      config.headers.token = loginUser.token;
    }
    return config;
  },
  (error) => { //失败回调
    return Promise.reject(error)
  }
)


export default request