<script setup>
import { ref, watch, onMounted } from 'vue'
import {ElMessage, ElMessageBox } from 'element-plus'
import { queryPageApi, saveApi, queryInfoApi, updateApi, deleteApi } from '@/api/clazz'
import {queryPageApi as findteacher} from '@/api/emp'

const searchClazz = ref({name:'', begin: '', end: '',data: []})

// 添加监听，分配时间
watch(() => searchClazz.value.date, (newVal) => {
  if(newVal.length == 2){
    searchClazz.value.begin = newVal[0];
    searchClazz.value.end = newVal[1];
  }else{
    searchClazz.value.begin = '';
    searchClazz.value.end = '';
  }
})

//分页界面数据
const clazzList = ref([
    {
    "id": null,
    "name": '',
    "room": '',
    "beginDate": '',
    "endDate": '',
    "masterId": null,
    "createTime": '',
    "updateTime": '',
    "masterName": '',
    "status": ''
  }
])

//分页数据
const total = ref(0);
const currentPage = ref(1)
const pageSize = ref(10)
const background = ref(true)
// 每页展示记录数变化
const handleSizeChange = (val) => {
  console.log(`当前页面大小： ${val}`);
  search();
}

// 每页页码变化
const handleCurrentChange = (val) => {
  console.log(`当前页码： ${val}`);
  search();
}

//钩子函数
onMounted(() => {
  loadTeachers();  //获取班主任信息
  search();
})


//====================================================查询操作====================================================

const search = async () => {
  const result = await queryPageApi(searchClazz.value.name, searchClazz.value.begin, searchClazz.value.end, currentPage.value, pageSize.value);
  if(result.code){  //成功
    clazzList.value = result.data.rows;
    total.value = result.data.total;
  }else{
    ElMessage.error(result.msg);
  }
}

//清空
const clear = () =>{
  searchClazz.value = {name:'', begin: '', end: '',data: []};
  search();
}

//====================================================新增操作====================================================
//基础数据
const clazzloyee = ref({  
  "name": '',
  "room": '',
  "beginDate": '',
  "endDate": '',
  "masterId": null,
  "subject": null
});

//学科列表
const subject = ref([{ name: 'Java', value: 1 },{ name: '前端', value: 2 },{ name: '大数据', value: 3 },{ name: 'Python', value: 4 },{ name: 'Go', value: 5 },{ name: '嵌入式', value: 6 }])

//班主任列表
const teacher = ref([])

//获取班主任列表数据
const transformToOptions = (rows) => {
  return rows.map(item => ({
    name: item.name,
    id: item.id   
  }))
}
const loadTeachers = async () => {
  const result = await findteacher('', '', '', '', 1, 10000 );
  if (result.code) {
    teacher.value = transformToOptions(result.data.rows)
  }
}


//Dialog对话框
const dialogVisible = ref(false);
const dialogTitle = ref('');

const addclazz = async () =>{
  clazzloyee.value = {  
    "name": '',
    "room": '',
    "beginDate": '',
    "endDate": '',
    "masterId": null,
    "subject": null
  };
  
  //以及重置表单的校验规则-提示信息
  if(clazzFormRef.value){
    clazzFormRef.value.resetFields();
  }

  dialogTitle.value = "新建班级";
  dialogVisible.value = true;
}

// 表单校验
//表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 20, message: '班级长度应在2到20个字符之间', trigger: 'blur' }
  ],
  room: [
    { required: true, message: '请输入班级教室', trigger: 'blur' },
    { min: 2, max: 4, message: '教室长度应在2到4个字符之间', trigger: 'blur' }
  ],
  beginDate: [
                                                  //值改变事件
    { required: true, message: '请选择开课时间', trigger: 'change' }
  ],
  endDate: [
                                                  //值改变事件
    { required: true, message: '请选择开课时间', trigger: 'change' }
  ],
  subject:[
    {required: true, message:'请选择学科', trigger: 'change' }
  ]
}; 

const clazzFormRef = ref(); //表格响应式数据

//调用API新增/编辑
const save = async () =>{

  if(!clazzFormRef.value) return  

  clazzFormRef.value.validate(async (vaild) => {
    if(vaild){    //通过
      
      let result;
      //判断是新增还是编辑操作
      if(!clazzloyee.value.id){  //新增
        result = await saveApi(clazzloyee.value);
      }else{    //修改
        result = await updateApi(clazzloyee.value);
      }
      if(result.code){
        //1. 提示
        ElMessage.success("操作成功"); 

        //2. 关闭对话框
        dialogVisible.value = false;

        //3. 重新查询
        search();

      }else{
        ElMessage.error(result.msg);
      }
    }else{
      ElMessage.error("表格校验未通过");
    }
  })
}


//====================================================编辑操作====================================================

// 1. 查询回显
const edit = async (id) =>{
  const result = await queryInfoApi(id);
  if(result.code){
    //以及重置表单的校验规则-提示信息
    if(clazzFormRef.value){
      clazzFormRef.value.resetFields();
    }

    dialogTitle.value = "编辑班级";
    clazzloyee.value = result.data;
    dialogVisible.value = true;


  }else{
    ElMessage.error(result.msg);
  }
}

// 2. 实际编辑调用API在添加中实现

//====================================================删除操作====================================================

const deletemethod = async(id) => {
    ElMessageBox.confirm(
    '确定删除该班级吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then( async () => {
      const result = await deleteApi(id);
      if(result.code){
        ElMessage.success("操作成功");
        search();
      }else{
        ElMessage.error(result.msg);
      }
    })
    .catch(() => {
      ElMessage.info("已取消该操作")
    })  
}



</script>

<template>
  <h1>班级管理</h1>
  <!-- 搜索栏 -->
   <div class="container">
    <el-form :inline="true" :model="searchClazz" class="demo-form-inline">
      <el-form-item label="班级名称">
        <el-input v-model="searchClazz.name" placeholder="请输入" clearable />
      </el-form-item>

      <el-form-item label="结课时间">
        <el-date-picker
          v-model="searchClazz.data"
          type="daterange"
          range-separator="到"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>
  </div>

  <!-- 功能按键 -->
   <div class="container">
    <el-button type="success" @click="addclazz">+ 新建班级</el-button>
   </div>

  <!-- 数据展示区 -->
   <div class="container">
    <el-table :data="clazzList" border style="width: 100%" >
      <el-table-column type ="index" label="序号" align="center" width="180" />
      <el-table-column prop="name" label="班级名称" align="center" width="180" />
      <el-table-column prop="room" label="班级教室" align="center" width="180" />
      <el-table-column prop="masterName" label="班主任" align="center" width="180" />
      <el-table-column prop="beginDate" label="开课时间" align="center" width="180" />
      <el-table-column prop="endDate" label="结课时间" align="center" width="180" />
      <el-table-column prop="status" label="状态" align="center" width="180" />
      <el-table-column prop="updateTime" label="最后修改时间" align="center" width="180" />
      <el-table-column label="操作" align="center" >
        <template #default="scope">
          <el-button type="primary" @click="edit(scope.row.id)">编辑</el-button>
          <el-button type="danger" @click="deletemethod(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>      
    </el-table>
   </div>

   <!-- 分页栏 -->
    <div class="con">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 30, 50, 75, 100]"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    </div>

    <!-- Dialog对话框 -->
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
    <el-form :model="clazzloyee" :rules = "rules" ref="clazzFormRef" label-width="100px">
      <el-form-item label="班级名称"  prop="name">
        <el-input v-model="clazzloyee.name"  placeholder="请输入班级名称" />
      </el-form-item>

      <el-form-item label="班级教室" prop="room">
        <el-input v-model="clazzloyee.room" placeholder="请输入班级教室" />
      </el-form-item>

      <el-form-item label="开课时间" prop="beginDate">
        <el-date-picker v-model="clazzloyee.beginDate" type="date" placeholder="请选择开课日期" value-format="YYYY-MM-DD" style="width: 100%" />
      </el-form-item>

      <el-form-item label="结课时间" prop="endDate">
        <el-date-picker v-model="clazzloyee.endDate" type="date" placeholder="请选择结课日期" value-format="YYYY-MM-DD" style="width: 100%" />
      </el-form-item>
      <el-form-item label="班主任 " prop="masterId">
        <el-select v-model="clazzloyee.masterId" placeholder="请选择班主任" style="width: 100%;">
          <el-option v-for="t in teacher" :key="t.id" :label="t.name" :value="t.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="学科" prop = "subject">
        <el-select v-model="clazzloyee.subject" placeholder="请选择学科" style="width: 100%;">
          <el-option v-for="s in subject" :key="s.value" :label="s.name" :value="s.value"></el-option>
        </el-select>
      </el-form-item>

    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="save">确定</el-button>
    </template>
  </el-dialog>


</template>

<style scoped>
  .container{
    margin: 15px 0px;
  }
</style>