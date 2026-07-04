<script setup>
import { ref, watch, onMounted } from 'vue'
import {ElMessage, ElMessageBox } from 'element-plus'
import {queryPageApi, saveApi, queryInfoApi, updateApi, deleteApi, handleViolationApi} from '@/api/student'
import {findAllApi} from '@/api/clazz'


// 数据表实体
const studentList = ref([
  {
    "id": 3,
    "name": "Lily",
    "no": "2023001003",
    "gender": 2,
    "phone": "13309230912",
    "degree": 4,
    "idCard": "110090110090110090",
    "isCollege": 0,
    "address": "回龙观东大街110号",
    "graduationDate": "2020-07-01",
    "violationCount": 2,
    "violationScore": 5,
    "clazzId": 21,
    "createTime": "2023-06-01T18:35:23",
    "updateTime": "2023-06-01T19:37:42",
    "clazzName": "黄埔班一期"
  }
])

//钩子函数
onMounted(() => {
  loadTeachers();   //获取班级名称信息
  search();
})


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


//===============================================查询操作===============================================
// 查询数据实体
const searchStudent = ref({name:'', statu:'', clazzname:''})

// 获取学历信息
const status = ref([{name:'初中', value:1}, {name:'高中', value:2}, {name:'大专', value:3}, {name:'本科', value:4}, {name:'硕士', value:5},{name:'博士', value:6}]);

// 获取班级名称实体
const clazzList = ref([]);

//获取班级列表数据
const transformToOptions = (rows) => {
  return rows.map(item => ({
    name: item.name,
    id: item.id   
  }))
}
const loadTeachers = async () => {
  const result = await findAllApi();
  if (result.code) {
    clazzList.value = transformToOptions(result.data)
  }
}

//查询数据
const search = async () => {
  const result = await queryPageApi(searchStudent.value.name,searchStudent.value.statu,searchStudent.value.clazzname,currentPage.value,pageSize.value);
  if(result.code){
    total.value = result.data.total;
    studentList.value = result.data.rows;
  }else{
    ElMessage.error(result.msg);
  }
}

const clear = () => {
  searchStudent.value = {name:'', statu:'', clazzname:''};
  search();
}

//===============================================新增学员===============================================
//Dialog对话框数据
const studentloyee = ref(
  {
  "name": "阿大",
	"no": "2024010801",
	"gender": 1,
	"phone": "15909091235",
	"idCard": "159090912351590909",
	"isCollege": 1,
	"address": "昌平回龙观",
	"degree": 4,
	"graduationDate": "2024-01-01",
	"clazzId": 9
  }
)

const dialogVisible = ref(false);
const dialogTitle = ref('');

//打开Dialog对话框
const addstudent = () => {
  //重置表单数据
  studentloyee.value = {
    "name": "",
    "no": "",
    "gender": '',
    "phone": "",
    "idCard": "",
    "isCollege": '',
    "address": "",
    "degree": '',
    "graduationDate": "",
    "clazzId": ''
  }
  

  //以及重置表单的校验规则-提示信息
  if(studentFormRef.value){
    studentFormRef.value.resetFields();
  }

  dialogVisible.value = true;
  dialogTitle.value = '新增学员';
}

//表格实体
const studentFormRef = ref();

//指定表单校验
const rules = {
  name: [
    { required: true, message: '请输入学员姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '学员姓名应在2到20个字符之间', trigger: 'blur' }
  ],
  no: [
    { required: true, message: '请输入学员学号', trigger: 'blur' },
    { pattern: /^\d{10}$/, message: '学员学号必须为10位数字', trigger: 'blur' }
  ],
  gender: [
                                                  //值改变事件
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号码', trigger: 'blur' },
    { pattern: /^\d{18}$/, message: '请输入有效的身份证号', trigger: 'blur' }
  ],
  isCollege: [
  { required: true, message: '请选择', trigger: 'change' }
  ],
  clazzId:[
    { required: true, message: '请选择班级', trigger:'change'}
  ]
}; 

const save = async () =>{
  //表单校验
  if(!studentFormRef.value) return;
  studentFormRef.value.validate( async (vaild) => {
    if(vaild){    //通过

      //判断是新增操作还是编辑操作
      let result;

      if(studentloyee.value.id){  //编辑操作
        result = await updateApi(studentloyee.value);
      }else{    //新增操作
        result = await saveApi(studentloyee.value)
      }

      if(result.code){
        // 1.提示信息
        ElMessage.success("操作成功");

        // 2.关闭对话框
        dialogVisible.value = false;

        // 3.重新查询
        search();
      }else{
        ElMessage.error(result.msg);
      }
    }else{
      ElMessage.error('表单校验失败')
    }
  })
}

//===============================================编辑学员===============================================
// 1. 查询回显
const edit = async (id) => {
  const result = await queryInfoApi(id);
  if(result.code){
    // 1. 更新数据
    studentloyee.value = result.data;

    // 2. 打开对话框
    dialogVisible.value = true;
    dialogTitle.value = '编辑学员'
  }else{
    ElMessage.error(result.msg);
  }
}

// 2. 修改数据，具体在新增方法中实行

//===============================================删除和批量删除===============================================
// 单个删除
const deletemethod = async (id) =>{
  // 提示框
      ElMessageBox.confirm(
    '确定删除该学员吗?',
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
      ElMessage.success('操作成功');
      search();
      }else{
      ElMessage.error(result.msg)
      }
    })
    .catch(() => {
      ElMessage.info("已取消该操作")
    })  
}

//批量删除的数据实体
const ids = ref([]);

//复选框勾选发生变化时触发 - val: 当前选中的记录
const handleSelectionChange = (val) => {
  ids.value = val.map(item => item.id);
}

//批量删除
const deleteByIds = async () =>{
  // 提示框
      ElMessageBox.confirm(
    '确定删除这些学员吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then( async () => {
    if(ids.value && ids.value.length > 0){ 
      const result = await deleteApi(ids.value);
      if(result.code){
        ElMessage.success('删除成功');
        search();
      }else{
        ElMessage.error(result.msg)
      }
    }else{
      ElMessage.info('您没有选择任何要删除的数据');
    }
    })
    .catch(() => {
      ElMessage.info("已取消该操作")
    })  
}

//===============================================违规扣分===============================================
const openViolation = (id) => {
  ElMessageBox.prompt('请输入违纪扣分', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern:/^\d{1,3}$/,   //可以输入0-999
    //inputPattern:/^\d+$/, 可以输入任意数量的数字 
    inputErrorMessage: '数据无效',
  })
  .then(async (val) => {    
    let result = await handleViolationApi(id, val.value);
    if(result.code) {
      ElMessage.success('处理成功')
      search()
    }else {
      ElMessage.error(result.msg)
    }
  })
  .catch(() => {
      ElMessage.info("已取消该操作")
  })  
}

</script>

<template>
  <h1>学员管理</h1>

  <!-- 查询页头 -->
  <div class="container">
    <el-form :inline="true" :model="searchClazz" class="demo-form-inline">
      <el-form-item label="学员名称">
        <el-input v-model="searchStudent.name" placeholder="请输入" clearable />
      </el-form-item>

    <el-form-item label="学历">
      <el-select v-model="searchStudent.statu" placeholder="请输入" clearable>
        <el-option v-for="s in status" :key="s.value" :label="s.name" :value="s.value"/>
      </el-select>
    </el-form-item>

    <el-form-item label="班级名称">
      <el-select
        v-model="searchStudent.clazzname" placeholder="请选择" clearable>
        <el-option v-for="c in clazzList" :key="c.id" :label="c.name" :value="c.id"/>
      </el-select>
    </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>
  </div>

  <!-- 功能按键区 -->
  <div class="container">
    <el-button type="success" @click="addstudent">+ 新增学员</el-button>
    <el-button type="danger" @click="deleteByIds">- 批量删除</el-button>
  </div>

  <!-- 数据列表 -->
  <div class="container">
    <el-table :data="studentList" border style="width: 100%" @selection-change="handleSelectionChange">

       <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="姓名" align="center" width="180" />

      <el-table-column prop="clazzId" label="班级" align="center" width="180">
        <template #default="{ row }">
          {{ clazzList.find(item => item.id === row.clazzId)?.name || '未知' }}
        </template>
      </el-table-column>
      
      <el-table-column prop="no" label="学号" align="center" width="180" />
      <el-table-column prop="gender" label="性别" align="center" width="180" >
        {{ gender == 1 ? '男' : '女' }}
      </el-table-column>
      <el-table-column prop="phone" label="电话号码" align="center" width="180" />
      
      <el-table-column prop="degree" label="最高学历" align="center" width="180" >
        <template #default="{ row }">
          {{ status.find(item => item.value === row.degree)?.name || '未知' }}
        </template>
      </el-table-column>
      
      <el-table-column prop="violationCount" label="违纪次数" align="center" width="180" />
      <el-table-column prop="violationScore" label="违纪扣分" align="center" width="180" />
      <el-table-column prop="updateTime" label="最后修改时间" align="center" width="180" />
      <el-table-column label="操作" align="center" >
        <template #default="scope">
          <el-button type="primary" @click="edit(scope.row.id)">编辑</el-button>
          <el-button type="warning" @click="openViolation(scope.row.id)">违规</el-button>
          <el-button type="danger" @click="deletemethod(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>      
    </el-table>
   </div>

   <!-- 分页表 -->
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
    <el-form :model="studentloyee" :rules = "rules" ref="studentFormRef" label-width="100px">
      <!-- 第一行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="studentloyee.name" placeholder="请输入学员姓名"></el-input>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="学号" prop="no">
            <el-input v-model="studentloyee.no" placeholder="请输入学员学号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 第二行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="studentloyee.gender" placeholder="请选择" style="width: 100%;">
               <el-option label="男" :value="1" />
               <el-option label="女" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="studentloyee.phone" placeholder="请输入手机号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 第三行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="studentloyee.idCard" placeholder="请输入身份证号"></el-input>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="是否院校" prop="isCollege">
            <el-select v-model="studentloyee.isCollege" placeholder="请选择" style="width: 100%;">
               <el-option label="是" :value="1" />
               <el-option label="否" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第四行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系地址" prop="address">
            <el-input v-model="studentloyee.address" placeholder="请输入联系地址"></el-input>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="最高学历" prop="degree">
            <el-select v-model="studentloyee.degree" placeholder="请选择" style="width: 100%;">
             <el-option v-for="s in status" :key="s.value" :label="s.name" :value="s.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第五行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="毕业时间" prop="graduationDate">
        <el-date-picker v-model="studentloyee.graduationDate" type="date" placeholder="请选择毕业时间" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="所属班级" prop="clazzId">
            <el-select v-model="studentloyee.clazzId" placeholder="请选择" style="width: 100%;">
             <el-option v-for="c in clazzList" :key="c.id" :label="c.name" :value="c.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
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