<!--
      <classSelectMul
          style="width: 220px;"
          :props_select_class_list="selectClassList"
          @deleteOne="classone=>{

          }"
          @success="(_selectlist)=>{
            selectClassList=_selectlist
          }"
          typeInfo="productNew"></classSelectMul>
-->
<style scoped lang="scss">
.overflow1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mockinput {
  position: relative;;
  -webkit-appearance: none;
  background-color: #FFF;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  box-sizing: border-box;
  color: #606266;
  padding-left: 10px;
  outline: 0;
  -webkit-transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
  transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
  cursor: pointer;
  min-height: 30px;
  line-height: 30px;
  .svgicon{
    position: absolute;top: 10px;right: 10px;font-size: 12px;color: #ced1d7;
  }
  &.mini{
    min-height: 25px;
    line-height: 25px;
    .svgicon{
      position: absolute;top:7px;
    }
  }
}
</style>
<template>
  <div>
    <el-popover
        ref="popover"
        width="444"
        v-model="showDialog"
        trigger="manual"
        placement="top-start"
        @show="()=>{
          onshow()
        }"

    >
      <!--弹出框 显示分类tree+ 已经选的分类-->
      <div>

        <section style="margin-bottom: 5px;">
          <span style="padding-right: 10px;">已选</span>
          <el-tag
              :key="index" style="margin-right: 5px;margin-bottom: 5px;"
              v-for="(selectedItemclass,index)  in selectClassList"
              closable size="mini"
              @close="()=>closetag(selectedItemclass,index)"
          >
            {{ selectedItemclass.className }}
          </el-tag>
        </section>

        <div >
          <div style="max-height: 300px;overflow-y: auto">
            <el-tree
                ref="treeRef"
                :node-key="$props.props_id_key"
                :data="dataList"
                :props="defaultProps"
                :load="loadNode"
                lazy
                :check-on-click-node="true"
                show-checkbox
                :check-strictly="$props.checkStrictly"
                @check-change="chencghange"
            >
            </el-tree>
          </div>

          <el-pagination
              style="margin: 5px 0px;margin-top: 15px"
              :page-size="queryParams.pageSize"
              :current-page.sync="queryParams.pageNum"
              layout="sizes,prev, pager, next"
              :total="total"
              @size-change="(pageSize)=>{$data.queryParams.pageSize=pageSize;dataList=[];getInfoList();}"
              @current-change="(pageNum)=>{$data.queryParams.pageNum=pageNum;dataList=[];getInfoList();}"
          >
          </el-pagination>
        </div>

        <div style="margin-top: 5px;text-align: right;">
          <el-button type="default" size="mini" @click="()=>{
            showDialog=false
          }">取消
          </el-button>
          <el-button type="primary" size="mini"
                     @click="submitByDialog"
          >确定
          </el-button>
        </div>
      </div>

      <div slot="reference"
           style="display: inline;"
           @click.stop="()=>{
           triggerShow()
          }">
        <div desc="模拟input"
             v-if="!($scopedSlots&&$scopedSlots.default)"
             :class="`mockinput ${$props['size']}`"

        >
          <div v-if="$props.props_select_class_list&&$props.props_select_class_list.length" class="overflow1">
            <el-tag
                size="mini"
                :key="index" style="margin-right: 5px;margin-bottom: 5px;margin-top: 5px;"
                v-for="(selectedItemclass,index)  in $props.props_select_class_list"
                closable
                @close.stop.prevent="()=>{
                  $emit('closeTag',{item:selectedItemclass,index})
                      $props.props_select_class_list.splice(index,1)
              }"

            >
              {{ selectedItemclass.className}}
            </el-tag>
          </div>
          <small v-else style="color:#c0c4d6;font-size: 12px;">{{ $attrs['placeholder'] || '请选分类(多选)' }}</small>
          <svg-icon icon-class="down" class="svgicon"
          ></svg-icon>
        </div>
        <slot></slot>
      </div>

    </el-popover>


  </div>
</template>
<script>
import * as classApi from '@/api/manage/class.js'
import { deepClone } from '@/utils'
import { alertFail } from '@/utils/alertUtil'

function adapterClassData(array = []) {
  for (let i = 0; i < array.length; i++) {
    array[i].className = array[i].name
    array[i].classId = array[i].id
    delete array[i].id
  }
}

export default {
  data() {
    var self = this
    return {
      total: 0,
      queryParams: {
        haveNext: true,
        pageSize: 10,
        typeInfo: self.$props.typeInfo,
        pageNum: 1
      },
      selectClassList: deepClone(this.$props.props_select_class_list || []),
      dataList: [],
      showDialog: false,
      defaultProps: {
        children: 'children',
        label: 'className',
        isLeaf(row) {
          return !row.haveNext
        }
      }
    }
  },
  components: {},

  props: {
    typeInfo: {
      type: [String]
    },
    checkStrictly: {
      type: [Boolean],
      default(){
       return false
      }
    },
 /*   /!*是否可以选择 *!/
    isSelectLeaf: {
      type: [Boolean],
      default() {
        return true
      }
    },*/
    props_select_class_list: {
      type: [Array],
      default() {
        return []
      }
    },
    size:{
      type: [String],
    },
    //使用什么属性来判断唯一
    props_id_key:{
     type:[String],
     default(){
     return 'classId'
     }
    }
  },
  methods: {
    async getInfoList() {
      var datalistresult = await classApi.getList({
        parentId: 0,
        pageSize: 10,
        ...this.queryParams
      })
      var temList = datalistresult && datalistresult.data || []
      adapterClassData(temList)
      this.dataList = temList
      this.total = datalistresult && datalistresult.count

    },
    async loadNode(node, resolve) {
      var self = this
      var data = node && node.data
      if (data && data.classId) {
        var datalistresult = await classApi.getList({
          'pageNum': 1,
          'haveNext': true,
          parentId: data.classId,
          pageSize: 999
        })
        var temList = datalistresult && datalistresult.data || []
        adapterClassData(temList)
        setTimeout(() => {
          self.checkKeys(self.selectClassList.map(item => item[this.$props.props_id_key]))
        })
        resolve(temList)
      }

    },

    chencghange(nodeData, isselected, iscildselected) {
      if (/*存在子集 不能选择*/iscildselected) {
        return false
      }
      if (/*存在子集 不能选择*/nodeData && nodeData.haveNext) {
        return false
      }

      var index = this.selectClassList.findIndex(item => item[this.$props.props_id_key] == nodeData[this.$props.props_id_key])
      if (isselected) {
        if (index >= 0) {

        } else {
          this.selectClassList.push(nodeData)
        }
      } else {
        //取消勾选
        if (index >= 0) {
          this.selectClassList.splice(index, 1)
        }
      }

    },
    submitByDialog() {
      /*if (this.selectClassList && this.selectClassList.length <= 0) {
        alertFail("请先选择")
        return {success: false}
      }*/
      this.$emit('success', this.selectClassList || [])
      this.$emit('change', this.selectClassList || [])
      this.showDialog = false
      return { success: true, data: this.selectClassList || [] }
    },
    /*勾选tree*/
    checkKeys(treeIds = []) {
      this.$refs['treeRef'].setCheckedKeys(treeIds, true)
    },
    onshow() {
      this.queryParams.pageNum = 1
      this.selectClassList = deepClone(this.$props.props_select_class_list || [])
      this.getInfoList()
      this.addEventLisent()

      var checkids=[...this.selectClassList.map(item=>item[this.$props.props_id_key])]
      console.log("-> 打开弹出框 需要勾选的 checkids", checkids);
      this.checkKeys(checkids)
    },
    async closetag(tag, index) {
      // await alertConfirm('确定删除吗？')
      this.selectClassList.splice(index, 1)

      this.$refs['treeRef'].setChecked(tag[this.$props.props_id_key], false)

      this.$emit('deleteOne', tag)
    },
    clickBodyEvent(e) {
      var self = this
      if (!$(e.target).is(this.$refs['popover']) && $(this.$refs['popover']).has(e.target).length === 0) {
        // console.log('是不是点击了我内部的元素', this.visible, e.target, this.$refs['popover']);
        self.showDialog = false
        self.removeEvenLisen()
      }
    },
    addEventLisent() {
      document.removeEventListener('click', this.clickBodyEvent)
      document.addEventListener('click', this.clickBodyEvent)
    },
    removeEvenLisen() {
      document.removeEventListener('click', this.clickBodyEvent)
    },
    triggerShow(){
    var self=this;
      this.showDialog=true
      setTimeout(()=>{
         this.$refs['popover']?.updatePopper()
      },100)
    }
  }
}
</script>
