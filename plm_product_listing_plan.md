```json
{"id":"","brandId":"","brandName":"","planTimeStatr":"","planTimeEnd":"","leadUser":"","leadUserId":"","planNum":"","state":"","cancelReason":"","remarks":"","tenantType":"","tenantId":"","delState":"","addUser":"","addUserId":"","addTime":"","editUser":"","editUserId":"","lastEditTime":"","serverNumber":""}
```

plm_product_listing_plan_dtl
~~~sql
CREATE TABLE `plm_product_listing_plan_dtl` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `plan_id` bigint NOT NULL COMMENT '对应上新计划id',
  `new_pro_id` bigint NOT NULL COMMENT '对应物料id',
  `new_pro_code` varchar(50) NOT NULL COMMENT '对应新品款号',
  `state` tinyint NOT NULL COMMENT '状态 5正常',
  `order_num` int NOT NULL DEFAULT '0' COMMENT '排序号',
  `target_type` tinyint NOT NULL DEFAULT '0' COMMENT '目标类型 1：newArrivalTarget|2：replenishTarget|3：independTarget',
  `class_id` bigint NOT NULL DEFAULT '0' COMMENT '品类id',
  `class_name` varchar(50) NOT NULL DEFAULT '' COMMENT '品类名称',
  `create_id` bigint NOT NULL DEFAULT '0' COMMENT '出款人id',
  `create_name` varchar(50) NOT NULL DEFAULT '' COMMENT '出款人名称',
  `push_type` tinyint NOT NULL DEFAULT '1' COMMENT '是否已推送消息： 1 否 5 是',
  `push_desc` varchar(200) NOT NULL DEFAULT '' COMMENT '推送消息描述',
  `join_time` datetime NOT NULL COMMENT '取消时间',
  `cancel_reason` varchar(100) NOT NULL DEFAULT '' COMMENT '取消原因',
  `img_check_id` bigint NOT NULL DEFAULT '0',
  `img_url` varchar(255) NOT NULL DEFAULT '',
  `remarks` varchar(50) NOT NULL COMMENT '备注',
  `tenant_type` tinyint NOT NULL COMMENT '租户类型 1应用管理者2应用消息者',
  `tenant_id` bigint NOT NULL COMMENT '租户ID',
  `del_state` tinyint NOT NULL COMMENT '有效状态[数据字典=del_state] 1有效  5删除',
  `add_user` varchar(50) NOT NULL COMMENT '添加人',
  `add_user_id` bigint NOT NULL COMMENT '添加人ID',
  `add_time` datetime NOT NULL COMMENT '添加时间',
  `edit_user` varchar(50) NOT NULL COMMENT '最近更新人',
  `edit_user_id` bigint NOT NULL COMMENT '最近更新人ID',
  `last_edit_time` datetime NOT NULL COMMENT '最近更新时间',
  `server_number` smallint NOT NULL COMMENT '服务器编号ID',
  PRIMARY KEY (`id`),
  KEY `AK_key_where` (`del_state`,`tenant_type`,`tenant_id`,`plan_id`,`new_pro_code`)
) ENGINE=InnoDB AUTO_INCREMENT=474 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='选图定款周排品计划明细表

/// 这里的逻辑字段  creatMan
还是去设计师那边去获取吧

~~~