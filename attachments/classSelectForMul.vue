<style scoped lang="scss">
::v-deep {
  .el-button--small {
    padding-top: 0px;
    padding-bottom: 0px;
  }
}

.custom-tree-node.disabled {
  color: #ddd;
  cursor: not-allowed;
}
.wrapperInput{
  -webkit-appearance: none;
  background-color: #FFFFFF;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  min-height: 32px;
  outline: none;
  padding-left: 10px;
  -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}
</style>
<template>
  <el-popover
      v-model="visible"
      trigger="click"
      ref="popover"
      @show="onopen"
  >
    <template>
      <div  slot="reference"  class="wrapperInput" >
        <div >
          <template v-if="$props._selectClasses&&$props._selectClasses.length>0">
            <el-tag size="mini"
                    :style="`margin-right: 5px;${$props.props_marginTop?'margin-top:'+$props.props_marginTop:''}`"
                    v-for="(classitem,index)  in $props._selectClasses"
                    type="primary" :key="classitem&&classitem.id"
                    closable
                    @close="()=>{
                  var one=$props._selectClasses.splice(index,1)
                  $emit('delete',one)
                }"
            >{{classitem.name}}</el-tag>
          </template>
          <template v-else>
            <span style="color: #d4d6dc;font-size: 14px;">请选择</span>
          </template>
        </div>

      </div>

    </template>


    <section>
      <div style="margin-bottom: 20px; display: flex">
        <el-input
            placeholder="请输入分类"
            size="small"
            :clearable="$attrs['clearable']"
            v-model="queryParams.name"
            style="margin-right: 5px"
            @keyup.enter.native="
          () => {
           queryParams.parentId=-1;
            ajaxNodeList()
          }
        "
        >
        </el-input>

        <div style="width: 50px; margin-left: 5px; position: relative; top: 2px">
          <el-button
              type="primary"
              icon="el-icon-setting"
              size="mini"
              circle
              v-if="$props.modify"
              @click="$openClassDialog($props.typeInfo)"
          ></el-button>
          <el-button
              @click="resetFunc"
              size="mini"
              icon="el-icon-refresh"
              circle
          ></el-button>
        </div>
      </div>

      <section style="margin-bottom: 5px;">
        <span style="padding-right: 5px;">已选:</span>
        <el-tag size="mini" :style="`margin-right: 5px;margin-bottom: 5px;`"
        v-for="(classitem,index)  in selectClasses"
                type="primary" :key="classitem&&classitem.id"
                closable
                @close.stop.prevent="()=>removeTag(classitem,index)"
        >{{classitem.name}}</el-tag>
      </section>


      <div >
        <el-table :data="dataList" ref="tableRef" border
        @selection-change="selectedRows1=>{
        selectionchange(selectedRows1)

        }"
                  @row-click="(row)=>{
                      $refs['tableRef'].toggleRowSelection(row)
                  }"
        >
        <el-table-column type="selection"  width="44px" align="center">
        </el-table-column>
        <el-table-column
            label="分类名称" prop="code" min-width="120px;">
          <template slot-scope="scope">
            <tip-content v-model="scope.row.name" :overflow="1"></tip-content>
          </template>
        </el-table-column>
      </el-table>
      </div>


      <el-pagination
          :background="false"
          size="mini"
          style="padding: 20px;margin-top: 10px;"
          :page-size="queryParams.pageSize"
          :current-page.sync="queryParams.pageNum"
          layout="sizes,prev, pager, next"
          :total="total"
          @size-change="(pageSize)=>{$data.queryParams.pageSize=pageSize;dataList=[];ajaxNodeList();}"
          @current-change="(pageNum)=>{$data.queryParams.pageNum=pageNum;dataList=[];ajaxNodeList();}"
      />
    </section>


    <div style="display: flex;justify-content: center;margin-top: 10px;">
      <el-button @click="_cancelEvent" size="mini">取消</el-button>
      <el-button @click="_successEvent" size="mini" type="primary">确定</el-button>

    </div>
  </el-popover>
</template>

<script>
import {formData, formMethod, PageData, uniqWithKey} from '@/utils/formcommon'
import {deepClone} from '@/utils'
import * as api from '@/api/manage/class'
import cacheAjaxWrapper from '@/utils/cacheAjaxWrapper'
import {findOneInArray, lodashEmpty, lodashExit} from "@/utils/lodashUtil";

const classApi = require('@/api/manage/class.js')

export default {
  name: 'treeClassTableSelect',
  data() {
    return {
      classApi,
      ...formData,
      queryParams: {
        haveNext: true,
        name: '',
        ...PageData,
        pageSize: 10
      },
      innerValue: '',
      nameForShowBack: '',

      //分类(类别)信息记录
      classData: undefined,

      tableSelectRows: [],
      loading: false,
      visible: false,

      treeClickCount: 0,

      classIds: '',
      classIdsObjArray: [],
      selectClasses:[],
      lodashExit,

    }
  },
  props: {
    /*
    场景 是否有预约单 默认是true有
    */
    props_havereserved:{
      type:[Boolean],
      default(){
        return true
      }
    },
      props_marginTop: {
          type: [String],
      },
    _selectClasses: [Array],
    disabledClassIdArray: {type: [Array]},
    //button  input
    mode: {
      type: [String, Number, Array, Object],
      default() {
        return 'button'
      }
    },
    typeInfo: {
      type: String,
      required: true
    },
    // 显示模式 a->b->c
    showClassNamePath: {
      type: [Boolean],
      default() {
        return false
      }
    },
    // 是否只能选中 末级
    onlySelectLeaf: {
      type: [Boolean],
      default() {
        return false
      }
    }
  },
  mounted() {
  },
  watch: {
    /*classids数组(多选)
    * 1   张开class  勾选已经选中的
    * */
    '$props._selectClasses': {
      handler(_val) {
        // this.selectClasses = deepClone(_val)
      },
      immediate: true
    },


    visible(istrue) {
      if (istrue) {
        this.ajaxNodeList()
      }
    }
  },
  components: {},
  methods: {
    ...formMethod,

    onopen() {
      var self=this;
      this.selectClasses = deepClone(this.$props._selectClasses||[])


      this.ajaxNodeList()
    },
    //展开所有
    explainAll() {

    },
    //勾选已经选中的
    checkSelectedClassIds() {
      if (!lodashEmpty(this.$props._selectClasses)) {
        for (let i = 0; i <this.$props._selectClasses.length ; i++) {
          var exitRow=findOneInArray(this.dataList,item=>item.classId==this.$props._selectClasses[i].classId)
          this.$refs.tableRef.toggleRowSelection(exitRow,true)
        }
      }
    },
    /**
     * @description:  获取分类名称路径 比如 a1->a1.2
     * @params
     * @return str
     */
    getAjaxClassName(_test) {
      var str = ''
      if (!this.$props.showClassNamePath) {
        str = _test || this.className
      }
      return str
    },
    disabledDataForArray(array = []) {
      for (let i = 0; i < array.length; i++) {
        this.disabledData(array[i]);
      }
    },
    sortArray(array = []) {
      return array.sort((a, b) => {
        return a && a.orderNum - b && b.orderNum
      })
    },

    disabledData(nodeData) {
      console.log('-> disabeld tree node data',
          nodeData.id,
          nodeData.name,
          nodeData.disabled
      )
    },
    ajaxNodeList() {
      var self=this
      this.loading = true
      var params = this.queryParams
      params = Object.assign(params, {
        typeInfo: this.$props.typeInfo
      })
      return classApi.getList(params).then((response) => {
        var tempList = (response&&response.data||[]).map(item => {
          // this.disabledData(item)
          item.classId=item.id
          item.className=item.name
          delete item.id
          return item
        });


     /*   if(/!*有预约单
        过滤   无预约单的 class *!/this.$props.props_havereserved){
          tempList=(tempList||[]).filter(item=>item.className!='无预约单')
        }*/

        tempList = this.sortArray(tempList)

        this.dataList = tempList;
        this.total = response.count
        this.loading = false



        /*选table*/
        setTimeout(()=>{
          self.checkSelectedClassIds()
        },100)



      })
    },

    currentChange(currentRow, oldCurrentRow) {
      console.log('table row click ', currentRow)
      this.$refs.table.toggleRowSelection(currentRow)
    },
    resetFunc() {
      this.queryParams && delete this.queryParams.parentId
      this.queryParams.name = ''
      this.ajaxNodeList()
    },

    async handleNodeClick(data) {
      //console.log('是否是末级分类', data);
      if (this.$props.onlySelectLeaf) {
        if (data && data.haveNext) {
          return false
        }
      }

      /*触发勾选这个节点*/
      this.$refs.tree.setCheckedKeys([data.id])


    },
    async getClassNamePath(nodeData) {
      var classIdPath = `${nodeData.parentIdPath},${nodeData.id}`
      var ids = classIdPath && classIdPath.split && classIdPath.split(',').filter(item => (item != '0' || !item))
      var names = []
      if (ids) {
        for (let i = 0; i < ids.length; i++) {
          var id = ids[i]
          var itemParent = await cacheAjaxWrapper(`classApi${id}`, () => classApi.getItem(id).then(res => res.data))
          itemParent && names.push(itemParent.name)
        }
      }

      return names && names.join('->') || ''
    },

    _cancelEvent() {
      this.$emit('cancel')
      this.visible = false
    },
    async _successEvent() {
      var self=this
      this.$emit('change', this.selectClasses)
      this.visible = false
    },
    /*输入修改*/
    inputchange(value) {
      if (!value) {
        this.$emit('change', {})
        this.$emit('update:_classId', "")
        this.$emit('update:_classIdPath', "")
        this.$emit('update:_className', "")
        this.$emit('update:_classNamePath', "")
      }
    },
    removeTag(tagitem,index){
       this.selectClasses.splice(index,1)
      if(tagitem&&tagitem.id){
         this.$emit('deleteTag',tagitem.id )
      }
    },
    selectionchange(selectedRows1){
      var newSelectClasses=[]
      for(let i = 0; i < selectedRows1.length; i++) {
        if(lodashExit(this.selectClasses,item=>item.classId==selectedRows1[i].classId)){
          newSelectClasses.push(this.selectClasses[i])
        }else{
          newSelectClasses.push(selectedRows1[i])
        }
      }
      this.selectClasses=newSelectClasses
    }
  }
}
</script>
<style scoped lang="scss">
.table ::v-deep {
  thead .el-table-column--selection .cell {
    display: none;
  }
}

.overflow1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
