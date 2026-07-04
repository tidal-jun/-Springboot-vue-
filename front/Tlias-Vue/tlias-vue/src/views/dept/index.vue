<script setup>

import { ref , onMounted} from 'vue';
// import axios from 'axios';

import { queryAllApi, addApi, queryByIdApi, updateApi, deleteByIdApi } from '@/api/dept';

//引入组件： 提示信息
import { ElMessage, ElMessageBox  } from 'element-plus';


//钩子函数
onMounted(() => {
  search();
})

//查询操作
/*
const search = async () =>{
  const result = await axios.get('https://m1.apifoxmock.com/m1/8397290-8165322-default/dept');
  if(result.data.code){   //JS隐式类型转换 0-false 其他数字-true    '' - false ，其他都是true; null,undefined - false
    deptList.value = result.data.data;
  }
}
*/

// 但是这种方式过于繁琐，一个是数据解析繁琐，要resule.data.data可能还会遗漏，一个是请求路径难以维护，如果后期要改，就要一个一个改，不统一
// 为了解决这个问题，我们通常会定义一个请求处理的工具类 - request.js

const search = async () =>{
    const result = await queryAllApi();
    if(result.code){
      deptList.value = result.data;
    }
}

const deptList = ref([])

//Dialog对话框
const dialogFormVisible = ref(false);
const formTitle = ref('');
const dept = ref({name: ''});


//新增操作
const addDept = () => {
  dialogFormVisible.value = true;
  formTitle.value = '新增部门';
  dept.value = {name: ''};

  // 重置表单的校验信息 - 提示信息
  if(deptFormRef.value){
    deptFormRef.value.resetFields();
  }

}

const save = async () => {
  // 提交的表单校验
  if(!deptFormRef.value) return;
  // validate 是对表单进行校验的方法，接收一个回调函数， 两个参数=> valid：如果所有字段都符合rules要求，就为true否则就为false， fields: 包含详细错误信息，例如：{ name: [{ message: '请输入部门名称', field: 'name' }] } 不过这里没用上，可以省略不写
  deptFormRef.value.validate(async (valid, fields) => {
    if (valid){  //通过
      
       let result;

      // 判断是新增还是编辑操作
      if(dept.value.id){   //修改
        result = await updateApi(dept.value)
      }else{  //新增
        result = await addApi(dept.value);
      }

      if(result.code){  //成功
        //1. 成功提示
        ElMessage.success('操作成功');

        //2. 关闭对话框
        dialogFormVisible.value = false;

        //3. 查询出最新数据
        search();

      }else{  //失败
        ElMessage.error(result.msg);
      }
    }else{  // 不通过
       ElMessage.error("表单校验不通过");
    }
  })
}

// 表单校验
const rules = ref({
  name: [
    // required： 必填   message：不填的显示    trigger：触发时机  blur：离焦触发
    { required: true, message: '部门名称是必填项', trigger: 'blur' },
    // 限制长度，2 - 10
    { min: 2, max: 10, message: '部门名称的长度应该在2-10位', trigger: 'blur' },
  ]
})

//声明表单响应式数据，给上面的提交Dialog对话框进行校验使用
const deptFormRef = ref();

// 编辑操作

const deit = async (id) => {
  formTitle.value = '编辑部门';
  
  // 重置表单的校验信息 - 提示信息
  if(deptFormRef.value){
    deptFormRef.value.resetFields();
  }

  const result = await queryByIdApi(id);
  if(result.code){  
    dialogFormVisible.value = true;
    // 如果成功，打开Dialog对话框
    dept.value = result.data;
  }

}
// 因为Dialog对话框编辑和新增是复用同一个，而此时确定已经绑定了save函数，这时编辑需要在save函数中完善， 判断是编辑操作还是确认操作，就查看是否有数据就行


//删除操作
const delById = async (id) =>{
  // 弹出确认框
   ElMessageBox.confirm('您确认删除该部门吗?','提示',
    {confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning',}
    ).then(async () => {      //确认
      const result = await deleteByIdApi(id);
      if(result.code){
        ElMessage.success("删除成功");
        search();
      }else{
        ElMessage.error(result.msg);
      }
    })
    .catch(() => {    //取消
      ElMessage({
        type: 'info',
        message: '您已取消删除',
      })
    })


}


</script>

<template>
  <h1>部门管理</h1>
  <div class="container">
    <el-button type = "primary" @click="addDept"> + 新增部门</el-button>
  </div>

  <!-- 表格 -->
  <div class="container">
  <el-table :data="deptList" border style="width: 100%">
    <el-table-column type = "index" label="序号" width="100" align="center" />
    <el-table-column prop="name" label="部门名称" width="260" align="center" />
    <el-table-column prop="updateTime" label="最后操作时间" width="300" align="center" />
    <el-table-column label="操作" align="center" >
      <template #default="scope">
          <el-button type = "primary" @click = "deit(scope.row.id)"><el-icon><EditPen /></el-icon>编辑</el-button>
          <el-button type = "danger" @click = "delById(scope.row.id)"><el-icon><Delete /></el-icon>删除</el-button>
      </template>
    </el-table-column>
  </el-table>      
  </div>


  <!-- Dualog对话框 -->
   <el-dialog v-model="dialogFormVisible" :title="formTitle" width="500">
    <el-form :model="dept" :rules = "rules" ref="deptFormRef">
      <!-- :rules = "rules" 开启rules属性， prop="name" 绑定rules的name属性 -->
        <!-- ref="deptFormRef"，表单绑定响应式数据，js调用数据就可以直接调用到表单 -->
      <el-form-item label="部门名称" label-width="80px" prop="name">  
        <el-input v-model="dept.name" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="save"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>

</template>

<style scoped>

  .container{
    margin: 10px 0px;
  }
</style>