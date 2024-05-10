<style scoped lang="scss">
  ::v-deep {
    .el-button--small {
      padding-top: 0px;
      padding-bottom: 0px;
    }
  }
  .custom-tree-node.disabled{
    color: #ddd;
    cursor: not-allowed;
  }
</style>
<template>
  <el-popover
    v-model="visible"
    trigger="click"
    ref="popover"
    :width="350"
    @show="onopen"
  >
    <section slot="reference"
             :style="`display: inline-block ${$el&&$el.style&&$el.style.cssText} ${$props.props_input_width?'width:'+$props.props_input_width:''}`"

    >
      <slot  v-if="$slots&&$slots.default"/>
      <el-button type="text"  v-else-if="$props.mode=='button'">
        <tip-content :overflow="1" style="max-width: 220px;" placement="top-start"
                     :value="nameForShowBack||$attrs['placeholder']||'请选分类'"
        ></tip-content>
      </el-button>
      <el-button type="text" v-else-if="$props.mode=='input'">
        <el-input v-model="nameForShowBack" :size="$attrs['size']"
                  :disabled="$attrs['disabled']"
                  :placeholder="$attrs['placeholder']"
                  :clearable="$attrs['clearable']"
                  :style="`${$el&&$el.style&&$el.style.cssText} ${$props.props_input_width?'width:'+$props.props_input_width:''}`"
                  @submit.native.prevent
                  @change="inputchange"
                  @keydown.enter.native="()=>{
                      visible=true
                      queryParams.pageNum=1
                       queryParams.parentId=-1;
                      ajaxNodeList()
                  }"
        ></el-input>
      </el-button>
     </section>


    <section >
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

        <div style="width:88px; margin-left: 5px; position: relative; top: 2px">
          <el-button
            type="primary"
            icon="el-icon-setting"
            size="mini"
            circle
            v-if="$props.props_modify"
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

      <div style="max-height: 300px;overflow-y: auto;">
        <el-tree
          :highlight-current="true"
          :lazy="true"
          :load="loadTreeNode"
          :data="dataList"
          :props="{
            children: 'children',
            label: 'name',
            disabled:(data)=>data.disabled,
            isLeaf: (data) => !data.haveNext}"
          ref="tree"
          node-key="id"
          @node-click="(data)=>{handleNodeClick(data)}"
        >
<!--          :class="{disabled:data.disabled}"-->
          <div class="custom-tree-node"  slot-scope="{ node, data }">
            <span>{{ data.name }}</span>
          </div>
        </el-tree>
      </div>


      <el-pagination
        :background="true"
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
  import { formData, formMethod, PageData, uniqWithKey } from '@/utils/formcommon'
  import { deepClone } from '@/utils'
  import * as api from '@/api/manage/class'
  import cacheAjaxWrapper from '@/utils/cacheAjaxWrapper'

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
          pageSize: 10,
          sortType:this.$props.props_sortType||"asc",
          sortField:"order_num"
        },
        innerValue: '',
        nameForShowBack: '',

        //分类(类别)信息记录
        classData: undefined,

        tableSelectRows: [],
        loading: false,
        visible: false,

        treeClickCount: 0,

        classId: '',
        classPath: '',
        className: '',
        classNamePath: ''

      }
    },
    props: {
      _classId: [String, Number, Array, Object],
      _classPath: [String, Number, Array, Object],
      _className: [String, Number, Array, Object],
      _classNamePath: [String, Number, Array, Object],
      disabledClassIdArray:{type:[Array]},
      props_sortType: {
        type: [String],
        default() {
          return 'asc'
        }
      },
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
      },
      //是否显示 编辑按钮
      props_modify:{
       type:[Boolean],default(){return false}
      },
      props_input_width:{
       type:[String,Number],
      }
    },
    mounted() {
    },
    watch: {
      '$props._classId': {
        handler(_val) {
          this.classId = _val
        },
        immediate: true
      },
      '$props._classPath': {
        handler(_val) {
          this.classPath = _val
        },
        immediate: true
      },
      '$props._className': {
        async handler(_val) {
          this.className = _val
          this.nameForShowBack = await this.getAjaxClassName(_val)
        },
        immediate: true
      },
      '$props._classNamePath': {
        handler(_val) {
          this.classNamePath = _val
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
        // this.queryParams.name = this.nameForShowBack
        this.ajaxNodeList()
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
         return array.sort((a,b)=>{
            return a&&a.orderNum-b&&b.orderNum
         })
        },

      disabledData(nodeData) {
       /* if ((nodeData && nodeData.id) == this.$props._classId/!*已存在 不需选择*!/) {
          nodeData.disabled = true
        }
        if(/!*id在禁止选择的列表中*!/this.$props.disabledClassIdArray&&
          this.$props.disabledClassIdArray.map(classid=>parseInt(classid)).includes(nodeData.id)){
          nodeData.disabled = true
        }*/

        console.log('-> disabeld tree node data',
          nodeData.id,
          nodeData.name,
          nodeData.disabled
        )
      },
      ajaxNodeList() {
        this.loading = true
        var params = this.queryParams
        params = Object.assign(params, {
          typeInfo: this.$props.typeInfo,

        })
        return classApi.getList(params).then((response) => {
          var tempList=response.data.map(item => {
            // this.disabledData(item)
            return item
          });

          tempList=this.sortArray(tempList)

          this.dataList = tempList;


          this.total = response.count
          this.loading = false
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

        //region 不能重复选择自己
        if((this.$props._classId)&&this.$props._classId==data.id){
          console.warn('已选择'+this.$props._classId+'不需要重新选择')
          return false
        }
        //endregion

        this.$data.selectTreeNode = data
        this.classIdPath = `${data.parentIdPath},${data.id}`
        this.classId = data.id
        this.classData = data
        this.className = data.name

        // region  双击事件
        //记录点击次数
        this.treeClickCount++
        //单次点击次数超过2次不作处理,直接返回,也可以拓展成多击事件
        if (this.treeClickCount >= 2) {
          return
        }
        //计时器,计算300毫秒为单位,可自行修改
        this.timer = window.setTimeout(() => {
          if (this.treeClickCount == 1) {
            //把次数归零
            this.treeClickCount = 0
            //单击事件处理
            console.log('单击事件,可在此处理对应逻辑')

          } else if (this.treeClickCount > 1) {
            //把次数归零
            this.treeClickCount = 0
            //双击事件
            console.log('双击事件,可在此处理对应逻辑')
            this._successEvent()
          }
        }, 200)

        // endregion

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
      loadTreeNode(node, resolve) {
        //如果节点是根目录 不处理
        if (node && node.level == 0) {
          return resolve([])
        }
        let nextParams = {
          pageNum: 1,
          pageSize: 100,
          haveNext: true,
          parentId: node.data.id,
          typeInfo: this.$props.typeInfo
        }
        console.log('nextParams', nextParams)
        api.getList(nextParams).then((response) => {
          var tempList = response.data
          // this.disabledDataForArray(tempList)
          tempList=this.sortArray(tempList)
          resolve(tempList)
        })
      },
      _cancelEvent() {
        this.$emit('cancel')
        this.visible = false
      },
      /*      async triggerShowBack() {
              var value = this.innerValue;
              if (value) {
                var item = await classApi.getItem(value).then(res => res.data);
                if (item) {
                  var classIdPath = `${item.parentIdPath},${item.id}`;
                  var ids = classIdPath && classIdPath.split && classIdPath.split(',').filter(item => (item != '0' || !item));
                  var names = [];
                  if (ids) {
                    for (let i = 0; i < ids.length; i++) {
                      var id = ids[i];
                      var itemParent = await cacheAjaxWrapper(`classApi${id}`, () => classApi.getItem(id).then(res => res.data));
                      itemParent && names.push(itemParent.name);
                    }
                  }

                  this.nameForShowBack = names && names.join('->') || '';
                }
              } else {
                this.nameForShowBack = '';
              }

            },*/


      async _successEvent() {
        var self = this
        this.$emit('input', this.innerValue)

        var classIdPath = ''
          if(!this.classData){
              this.classData={
                  id:"",
                  classIdPath:"",
                  name:"",
                  classNamePath:"",
              }
          }
        if (this.classData && this.classData.parentIdPath) {
          classIdPath = `${this.classData && this.classData.parentIdPath},${this.classData.id}`
        }

        if (this.$props.showClassNamePath) {
          this.classData.classNamePath = await this.getClassNamePath(this.classData)
        }

        this.classData.classIdPath = classIdPath
        this.$emit('change', this.classData)
        this.$emit('update:_classId', this.classData && this.classData.id)
        this.$emit('update:_classIdPath', this.classData && this.classData.classIdPath)
        this.$emit('update:_className', this.classData && this.classData.name)
        this.$emit('update:_classNamePath', this.classData && this.classData.classNamePath)

        this.visible = false
      },
      /*输入修改*/
      inputchange(value){
        if(!value){
          this.$emit('change',{})
          this.$emit('update:_classId', "")
          this.$emit('update:_classIdPath', "")
          this.$emit('update:_className', "")
          this.$emit('update:_classNamePath', "")
        }
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
