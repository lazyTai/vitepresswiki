<template>
  <el-popover
    v-model="visible"
    trigger="click"
    ref="popover"
  >
    <template>
      <slot slot="reference" v-if="$slots&&$slots.default" />
      <el-button type="text" slot="reference" v-else>
        <span>{{nameForShowBack||$props.text||$attrs['placeholder']}}</span>
      </el-button>
    </template>


    <section>
      <div style="margin-bottom: 20px; display: flex">
        <el-input
          placeholder="请输入分类"
          size="small"
          clearable
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

      <div style="max-height: 300px;overflow-y: auto;">
        <el-tree
          :highlight-current="true"
          :lazy="true"
          :load="loadTreeNode"
          :data="dataList"
          :props="{
            children: 'children',
            label: 'name',
            isLeaf: (data) => !data.haveNext}"
          ref="tree"
          node-key="id"
          @node-click="(data)=>{handleNodeClick(data)}"
        >
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
  import { formData, formMethod, PageData, uniqWithKey } from '@/utils/formcommon';
  import { deepClone } from '@/utils';
  import * as api from '@/api/manage/class';
  import cacheAjaxWrapper from '@/utils/cacheAjaxWrapper';
  import { alertFail } from '@/utils/alertUtil';

  const classApi = require('@/api/manage/class.js');

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
        },
        innerValue: '',
        nameForShowBack: '',

        //分类(类别)信息记录
        classData: undefined,

        tableSelectRows: [],
        loading: false,
        visible: false,

        treeClickCount: 0,
      };
    },
    props: {
      value: [String, Number, Array, Object],
      typeInfo: {
        type: String,
        required: true,
      },
      text: {
       type:[String,Number]
      },
      //是否只有选中最后一个才能选择选中 默认false
      selectReaf: {
        type: [Boolean],
        default() {
          return false;
        },
      },
    },
    mounted() {
      this.$data.innerValue = this.$props.value;
      this.triggerShowBack();
    },
    watch: {
      value(_val) {
        this.$data.innerValue = _val;
        this.triggerShowBack();
      },
      visible(istrue) {
        if (istrue) {
          this.ajaxNodeList();
        }
      },
    /*  "$props.text"(_text){
         this.nameForShowBack=_text
      }
*/
    },
    components: {},
    methods: {
      ...formMethod,

      ajaxNodeList() {
        this.loading = true;
        var params = this.queryParams;
        params = Object.assign(params, {
          typeInfo: this.$props.typeInfo,
        });
        return classApi.getList(params).then((response) => {
          this.dataList = response.data.map(item => {
            return item;
          });
          this.total = response.count;
          this.loading = false;
        });
      },

      currentChange(currentRow, oldCurrentRow) {
        console.log('table row click ', currentRow);
        this.$refs.table.toggleRowSelection(currentRow);
      },
      resetFunc() {
        this.queryParams && delete this.queryParams.parentId;
        this.queryParams.name = '';
        this.ajaxNodeList();
      },


      handleNodeClick(data) {
        //console.log('是否是末级分类', data);
        if (this.$props.selectReaf) {
          if (data && data.haveNext) {
            return false;
          }
        }


        this.$data.selectTreeNode = data;
        this.classIdPath = `${data.parentIdPath},${data.id}`;
        this.classId = data.id;
        this.classData = data;
        this.innerValue = data.id;


        // region  双击事件
        //记录点击次数
        this.treeClickCount++;
        //单次点击次数超过2次不作处理,直接返回,也可以拓展成多击事件
        if (this.treeClickCount >= 2) {
          return;
        }
        //计时器,计算300毫秒为单位,可自行修改
        this.timer = window.setTimeout(() => {
          if (this.treeClickCount == 1) {
            //把次数归零
            this.treeClickCount = 0;
            //单击事件处理
            console.log('单击事件,可在此处理对应逻辑');


          } else if (this.treeClickCount > 1) {
            //把次数归零
            this.treeClickCount = 0;
            //双击事件
            console.log('双击事件,可在此处理对应逻辑');
            this._successEvent();
          }
        }, 300);

        // endregion

      },


      loadTreeNode(node, resolve) {
        //如果节点是根目录 不处理
        if (node && node.level == 0) {
          return resolve([]);
        }
        let nextParams = {
          pageNum: 1,
          pageSize: 100,
          haveNext: true,
          parentId: node.data.id,
          typeInfo: this.$props.typeInfo,
        };
        console.log('nextParams', nextParams);
        api.getList(nextParams).then((response) => {
          resolve(response.data);
        });
      },
      _cancelEvent() {
        this.$emit('cancel');
        this.visible = false;
      },
      async getClassNamePath() {
        var classIdpathName = '';
        if (this.innerValue) {
          var item = await classApi.getItem(this.innerValue).then(res => res.data);
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

            classIdpathName = names && names.join('->') || '';
          }
        } else {
          classIdpathName = '';
        }
        return classIdpathName;
      },

      async triggerShowBack() {
        this.nameForShowBack = await this.getClassNamePath();
        console.log("classselectone triggerShowBack===>",this.nameForShowBack)
      },
      _successEvent() {
        var self = this;
        /*校验是否选中了最后*/
        if (this.$props.selectReaf) {
          if (!this.classData) {
            alertFail('请选择 末级分类');
            return { success: false };
          }
          if (this.classData && this.classData.haveNext == true/*不是选中最后*/) {
            alertFail('请选择 末级分类');
            return { success: false };
          }
        }

        this.$emit('input', this.innerValue);


        var classIdPath = '';
        if (this.classData && this.classData.parentIdPath) {
          classIdPath = `${this.classData && this.classData.parentIdPath},${this.classData.id}`;
        }

        this.classData.classIdPath = classIdPath;
        this.$emit('change', this.classData);
        this.visible = false;
      },
    },
  };
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
