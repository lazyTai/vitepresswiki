
```js
<div slot="label"><i class="red" style="padding-right: 2px;">*</i>审样通过</div>  
  <el-radio-group v-model="form.checkResult" size="mini" @change="changeCheckResult"  
                  style="margin-left: -45px;"  
  >  
    <el-radio-button :label="1">通过</el-radio-button>  
    <el-radio-button :label="5">不通过</el-radio-button>  
  </el-radio-group>
```

```
选中的select class
src/views/components/Select/classSelect/classSelectMul.vue:86
```
```
如何选择
![[classSelectForMul.vue]]
![[classSelectMul.vue]]
 // ![[classSelectOne.vue]]
 // ![[classSelectOnePlus.vue]]
```

如何使用 class
```js
 <classSelectForMul :_selectClasses="scope.row.exClasseList"  
                              :typeInfo="computedClassTypeInfo()"  
                              props_marginTop="4px"  
                              @change="rows=>{  
   scope.row.exClasseList=(rows||[]).map(item=>{  
       return {  
           ...item,  
           exClassId:item.classId,  
           exClassName:item.className  
       }  
   })  
}"  
           ></classSelectForMul>
```