<script setup>
import { ElMessage, ElMessageBox} from 'element-plus';
import { ref, onMounted, watch } from 'vue';
import {queryPageApi, addApi, queryInfoApi, updateApi, deleteApi} from '@/api/emp'
              // 起别名
import {queryAllApi as queryAllDeptApi} from '@/api/dept'


// 元数据
//职位列表数据
const jobs = ref([{ name: '班主任', value: 1 },{ name: '讲师', value: 2 },{ name: '学工主管', value: 3 },{ name: '教研主管', value: 4 },{ name: '咨询师', value: 5 },{ name: '其他', value: 6 }])
//性别列表数据
const genders = ref([{ name: '男', value: 1 }, { name: '女', value: 2 }])
//部门列表数据
const depts = ref([])

// 员工列表数据
const empList = ref([])

//token，因为文件上传不是通过axios发送请求，所以需要自己处理token
const token = ref('');

//获取token  而后可以在钩子函数中调用这个函数获取Token
const getToken = () => { 
  const loginUser = JSON.parse(localStorage.getItem('loginUser'));
  if(loginUser && loginUser.token){
    token.value = loginUser.token;
  }
}


//==========================================查询==========================================

// 查询员工列表
const search = async () =>{
  const result = await queryPageApi(searchEmp.value.name, searchEmp.value.gender, searchEmp.value.begin, searchEmp.value.end, currentPage.value, pageSize.value );
  if(result.code){
    empList.value = result.data.rows;
    total.value = result.data.total;
  }     
}

//钩子函数
onMounted(() => {
  search();         // 查询员工列表数据
  queryAllDepts();  //查询所有部门列表数据
  getToken();       //获取token
})

//搜索栏对象数据
const searchEmp = ref({name: '', gender: '', date: [], begin: '', end: ''})

// 清空
const clear = () => {
  searchEmp.value = {name: '', gender: '', date: [], begin: '', end: ''};
  search();
}

const currentPage = ref(1)   //页码
const pageSize = ref(10)     //每页页数
const background = ref(true)  //背景颜色
const total = ref(0);         //总记录数

// 每页展示记录数变化
const handleSizeChange = (val) => {
  search();
}
// 页码发生变化
const handleCurrentChange = (val) => {
  search();
}

//侦听searchEmp的date属性 -- 将时间范围分发下去
watch(() => searchEmp.value.date, (newVal, oldVal) => {
  if(newVal.length == 2){
    searchEmp.value.begin = newVal[0];
    searchEmp.value.end = newVal[1];
  }else{
    searchEmp.value.begin = '';
    searchEmp.value.end = '';
  }
})


//==========================================新增==========================================

//新增/修改表单
const employee = ref({
  username: '',
  name: '',
  gender: '',
  phone: '',
  job: '',
  salary: '',
  deptId: '',
  entryDate: '',
  image: '',
  exprList: []
})

// 控制弹窗
const dialogVisible = ref(false)
const dialogTitle = ref()


//新增员工  -- 打开Dialog对话框
const addEmp = () => {
  dialogVisible.value = true;
  dialogTitle.value = '新增员工';

  //清空上次保留的数据
  employee.value = {
    username: '',
    name: '',
    gender: '',
    phone: '',
    job: '',
    salary: '',
    deptId: '',
    entryDate: '',
    image: '',
    exprList: []
  }

  //以及重置表单的校验规则-提示信息
  if(empFormRef.value){
    empFormRef.value.resetFields();
  }
}

// 查询所有部门数据 -- 新增表单选择使用
const queryAllDepts = async () => {
  const result = await queryAllDeptApi();
  if(result.code){
    depts.value = result.data;
  }
}

// 文件上传
// 图片上传成功后触发
const handleAvatarSuccess = (response) => {
  employee.value.image = response.data;
}

// 文件上传之前触发
const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('只支持上传图片')
    return false
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('只能上传10M以内图片')
    return false
  }
  return true
}

//添加工作经历
const addExprItem = () => {
  employee.value.exprList.push({company: '', job: '', begin: '', end: '', exprDate: []})

}

//删除工作经历
const delExprItem = (index) => {
  /*
    array.splice(index, howmany, item1, ....., itemX)
    index: 删除的索引
    howmany： 删除的数量
    itemX：要添加回来的新数据（可选）
  */
  employee.value.exprList.splice(index,1)
}

//侦听 - employee 员工对象中的工作经历信息  -- 将时间范围分发下去
watch (() => employee.value.exprList, (newVal, oldVal) => {
  if(employee.value.exprList && employee.value.exprList.length > 0){
    employee.value.exprList.forEach((expr) => { 
      expr.begin = expr.exprDate[0];
      expr.end = expr.exprDate[1];
    })
  }
}, {deep: true}) //深度侦听

// 表单校验
//表单校验规则
const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应在2到20个字符之间', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度应在2到10个字符之间', trigger: 'blur' }
  ],
  gender: [
                                                  //值改变事件
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    /**
     * 正则表达式: / ..... / ;  ^ : 以...开始 ;  $ : 以 ... 结束
     * [3-9] : 范围 3-9 之间
     * \d : 数字, [0-9]
     * {9} : 量词
     */
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ]
});   //记得申明校验规则后要去保存的代码中完善是否通过校验，以及表单对应的响应式对象

//表单引用的响应式对象
const empFormRef = ref();

// 保存数据
const save = async () =>{
  //表单校验
  if(!empFormRef.value) return;
  empFormRef.value.validate(async (valid) => {  //valid 表示是否校验通过：true 通过 / false 不通过
      if(valid){  //通过

        let result;
        if(employee.value.id){   //通过id是否存在判断是新增还是修改操作， 此时是修改操作
          result = await updateApi(employee.value);
        }else{    //新增操作
          result = await addApi(employee.value);
        }

        if(result.code){  //成功了
          // 1. 提示信息
          ElMessage.success('保存成功');
          // 2. 关闭对话框
          dialogVisible.value = false;
          // 3. 重新查询新数据
          search();
        }else{  //失败了
          ElMessage.error(result.msg);
        }
      }else{  //不通过
        ElMessage.error('表单校验失败')
      }
  })
}

//==========================================修改==========================================
//编辑操作 -- 查询回显
const edit = async (id) => {
  // 清除上次预留的提示校验信息
  if(empFormRef.value){
    empFormRef.value.clearValidate();
  }

  //查询员工信息
  const result = await queryInfoApi(id);
  if(result.code){
  //打开Dialog对话框 并附入数据
    dialogVisible.value = true;
    dialogTitle.value = '修改员工';
    employee.value = result.data;

  //特殊处理工作经历
   let exprList = employee.value.exprList;
    if(exprList && exprList.length > 0){
      exprList.forEach((expr) => {
        expr.exprDate = [expr.begin, expr.end];
      })
    }
  }
}

//修改员工与新增员工复用的是同一个dialog对话框，所以修改员工的调用API需要在保存员工的函数中添加

//==========================================删除==========================================
//删除员工
const delectById = (id) =>{
  //弹出确认框
  ElMessageBox.confirm('您确认删除该员工吗?','提示',
    { confirmButtonText: '确认',cancelButtonText: '取消',type: 'warning'}
  ).then(async () => { //确认
    const result = await deleteApi(id);
    if(result.code){
      ElMessage.success('删除成功');
      search();
    }else{
      ElMessage.error(result.msg);
    }
  }).catch(() => { //取消
    ElMessage.info('您已取消删除');
  })
}

// 批量删除的数组，记录勾选员工的id
const ids = ref([]);

//复选框勾选发生变化时触发 - val: 当前选中的记录
const handleSelectionChange = (val) => {
  ids.value = val.map(item => item.id);

  // val.forEach((emp) => {
  //   ids.value.push(emp.id);     //这样写会导致ids.value重复
  // })
}

// 批量删除
const deleteByIds = () =>{
  ElMessageBox.confirm('您确认删除选中的这些员工吗?','提示',
    { confirmButtonText: '确认',cancelButtonText: '取消',type: 'warning'}
  ).then(async () => { //确认
    if(ids.value && ids.value.length > 0){
       const result = await deleteApi(ids.value);
      if(result.code){
        ElMessage.success('删除成功');
        search();
      }else{
        ElMessage.error(result.msg);
      }
    }else{
      ElMessage.info('您没有选择任何要删除的数据');
    }
  }).catch(() => { //取消
    ElMessage.info('您已取消删除');
  })
}

/*
// watch侦听 ============================================演示============================================
// 1. 侦听一个响应式数据
  const a = ref('')
  watch(a, (newVal , oldVal) => { //侦听a的变化！
    console.log(`a的值为：新的值为: ${newVal}, 旧的值为: ${oldVal}`);
  })

// 2. 侦听一个对象（侦听对象的全部属性值）
  const user = ref({name:'', age:10})
  watch(user, (newVal , oldVal) => { //侦听user对象中的全部属性的变化
    console.log(`a的值为：newVal: ${newVal}, oldVal: ${oldVal}`);
  }, {deep: true})

// 3. 侦听对象中的某一个属性
  const user = ref({name:'', age:10})
  watch( () => user.value.name , (newVal , oldVal) => { //侦听user对象中name的变化
    console.log(`a的值为：newVal: ${newVal}, oldVal: ${oldVal}`);
  })

*/
</script>

<template>
  <h1>员工管理</h1>
  <!-- 搜索栏 -->
  <div class="container">
    <el-form :inline="true" :model="searchEmp" class="demo-form-inline">
      <el-form-item label="姓名">
        <el-input v-model="searchEmp.name" placeholder="请输入员工姓名"/>
      </el-form-item>

      <el-form-item label="性别">
        <el-select v-model="searchEmp.gender" placeholder="请选择">
          <el-option label="男" value="1" />
          <el-option label="女" value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="入职时间">
        <el-date-picker
          v-model="searchEmp.date"
          type="daterange"
          range-separator="到"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format = "YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>
  </div>

  <!-- 功能按钮 -->
  <div class="container">
    <el-button type="primary" @click="addEmp">新增员工</el-button>
    <el-button type="danger" @click="deleteByIds">批量删除</el-button>
  </div>

  <!-- 数据展示表格 -->
  <el-table :data="empList" border style="width: 100%" @selection-change="handleSelectionChange">
    <!-- 复选框 -->
    <el-table-column type="selection" width="55" align="center"/>
    <el-table-column prop="name" label="姓名" width="120" align="center"/>
    
    <el-table-column prop="gender" label="性别" width="120" align="center">
      <template #default="scope">
        {{scope.row.gender == 1 ? "男" : "女" }}
      </template>
    </el-table-column>

    <el-table-column prop="image" label="头像" width="120" align="center">
      <template #default="scope">
        <img :src="scope.row.image" height="40px">  
      </template>
    </el-table-column>

    <el-table-column prop="deptName" label="所属部门" width="120" align="center"/>
    <el-table-column prop="job" label="职位" width="120" align="center">
      <template #default="scope">
        <span v-if="scope.row.job == 1">班主任</span>
        <span v-else-if="scope.row.job == 2">讲师</span>
        <span v-else-if="scope.row.job == 3">学工主管</span>
        <span v-else-if="scope.row.job == 4">教研主管</span>
        <span v-else-if="scope.row.job == 5">咨询师</span>
        <span v-else>其他</span>
      </template>
    </el-table-column>
    <el-table-column prop="entryDate" label="入职日期" width="180" align="center"/>
    <el-table-column prop="updateTime" label="最后操作日期" width="200" align="center"/>
    <el-table-column label="操作" align="center">
      <template #default="scope">
        <el-button type = "primary" @click = "edit(scope.row.id)"><el-icon><EditPen /></el-icon>编辑</el-button>
        <el-button type = "danger"  @click = "delectById(scope.row.id)"><el-icon><Delete /></el-icon>删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页条 -->
  <div class="container">
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

  <!-- 新增员工/修改员工的对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form :model="employee" :rules="rules" ref="empFormRef" label-width="80px">
      <!-- 基本信息 -->
      <!-- 第一行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="employee.username" placeholder="请输入员工用户名，2-20个字"></el-input>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="employee.name" placeholder="请输入员工姓名，2-10个字"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第二行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别"  prop="gender">
            <el-select v-model="employee.gender" placeholder="请选择性别" style="width: 100%;">
              <el-option v-for="g in genders" :key="g.value" :label="g.name" :value="g.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="employee.phone" placeholder="请输入员工手机号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="职位">
            <el-select v-model="employee.job" placeholder="请选择职位" style="width: 100%;">
              <el-option v-for="j in jobs" :key="j.value" :label="j.name" :value="j.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="薪资">
            <el-input v-model="employee.salary" placeholder="请输入员工薪资"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第四行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属部门">
            <el-select v-model="employee.deptId" placeholder="请选择部门" style="width: 100%;">
              <el-option v-for="d in depts" :key="d.id" :label="d.name" :value="d.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入职日期">
            <el-date-picker v-model="employee.entryDate" type="date" style="width: 100%;" placeholder="选择日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第五行 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="头像">
            <el-upload
              class="avatar-uploader"
              action="/api/upload"
              :headers="{'token': token}"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              >
              <img v-if="employee.image" :src="employee.image" class="avatar" height="150px"/>
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 工作经历 -->
      <!-- 第六行 -->
      <el-row :gutter="10">
        <el-col :span="24">
          <el-form-item label="工作经历">
            <el-button type="success" size="small" @click="addExprItem">+ 添加工作经历</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 第七行 ...  工作经历 -->
      <el-row :gutter="3" v-for="(expr,index) in employee.exprList">
        <el-col :span="10">
          <el-form-item size="small" label="时间" label-width="80px">
            <el-date-picker type="daterange" v-model="expr.exprDate" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" ></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item size="small" label="公司" label-width="60px">
            <el-input placeholder="请输入公司名称" v-model="expr.company"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item size="small" label="职位" label-width="60px">
            <el-input placeholder="请输入职位" v-model="expr.job"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="2">
          <el-form-item size="small" label-width="0px">
            <el-button type="danger" @click="delExprItem(index)">- 删除</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <!-- 底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.container{
  margin: 15px 0px;
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 78px;
  height: 78px;
  text-align: center;
  border-radius: 10px;
  /* 添加灰色的虚线边框 */
  border: 1px dashed var(--el-border-color);
}

</style>