# PDA 端接口文档 (V 1.1.20260213.002)

本文档定义了维修 SOP 系统 PDA 端（工程师端）各页面所需的数据结构及接口协议。

---

## 1. 认证与登录 (APP_LOGIN)

### 1.1 RFID 工卡识别登录
**描述**: 工程师通过 PDA 感应区读取 RFID 工卡进行登录。
- **输入**: `{"rfid": "RFID_TAG_ID_001"}`
- **返回数据**: [User](file:///d%3A/%E5%85%B6%E4%BB%96%E9%A1%B9%E7%9B%AE/NXP/%E5%BD%92%E6%A1%A3/%E8%B5%B5%E9%94%90/%E7%BB%B4%E4%BF%AESOP%E7%B3%BB%E7%BB%9F/WEIXIU-SOP-V1.0/-SOP--main/types.ts#L22)
  ```json
  {
    "id": "u1",
    "name": "张工程师",
    "role": "SENIOR_ENGINEER",
    "employeeId": "E1024",
    "status": "active",
    "assignedDeviceIds": ["d1", "d2", "d3"],
    "permissions": {
      "dashboard": "view",
      "sopLibrary": "view",
      "userManagement": "none",
      "records": "manage",
      "notifications": "view"
    }
  }
  ```

---

## 2. 资产识别与主页 (HOME / SCAN)

### 2.1 获取资产列表 (最近操作)
**描述**: 获取工程师有权限且最近维护过的设备列表。
- **接口**: `GET /api/devices/authorized`
- **返回**: `Device[]`
  ```json
  [
    {
      "id": "d1",
      "type": "封装机",
      "model": "Eagle-X1",
      "subModel": "Gen-3",
      "sn": "NX-2024-001",
      "status": "active",
      "boundSopIds": ["g1", "g2"]
    }
  ]
  ```

### 2.2 扫描二维码识别资产
**描述**: 扫描机台上的二维码获取设备详情。
- **输入**: `{"qrContent": "DEVICE_ID_d1"}`
- **返回**: `Device`
  ```json
  {
    "id": "d1",
    "type": "封装机",
    "model": "Eagle-X1",
    "sn": "NX-2024-001",
    "status": "active"
  }
  ```

### 2.3 获取进行中的维修任务
**描述**: 检查当前工程师是否有未完成的维修记录。
- **接口**: `GET /api/records/ongoing`
- **返回**: `RepairRecord | null`
  ```json
  {
    "id": "r1",
    "guideId": "g1",
    "engineerId": "u1",
    "startTime": "2026-02-14 10:00:00",
    "status": "ongoing",
    "completedSteps": ["s1", "s2"],
    "context": {
      "deviceId": "d1",
      "faultCode": "E-001",
      "isNewIssue": false
    }
  }
  ```

---

## 3. 故障选择 (ALARM_SELECT)

### 3.1 获取设备关联的 SOP (报警代码)
**描述**: 根据识别到的设备 ID，获取该机台所有关联的维修指南。
- **接口**: `GET /api/guides?deviceId={id}`
- **查询参数**: `alarmSearchQuery` (可选)
- **返回**: `MaintenanceGuide[]`
  ```json
  [
    {
      "id": "g1",
      "deviceId": "d1",
      "faultCode": "E-001",
      "faultCategory": "机械故障",
      "scope": "模组A",
      "faultPhenomenon": "电机异响",
      "version": "1.0.1",
      "totalOccurrenceCount": 45,
      "steps": []
    }
  ]
  ```

---

## 4. 维修引导与步骤 (STEP_LIST / GUIDE)

### 4.1 获取 SOP 步骤详情
**描述**: 获取选定 SOP 的所有执行步骤。
- **接口**: `GET /api/guides/{guideId}/steps`
- **返回**: `GuideStep[]`
  ```json
  [
    {
      "id": "s1",
      "stage": "诊断阶段",
      "title": "检查皮带张紧度",
      "description": "使用张力计测量皮带 A 的张力值",
      "instruction": "张力值应在 150-180N 之间",
      "imageUrls": ["https://example.com/img1.jpg"],
      "videoUrls": ["https://example.com/video1.mp4"],
      "pdfUrls": ["https://example.com/manual.pdf"],
      "isConfirmationRequired": true,
      "historyRepairCount": 12
    }
  ]
  ```

### 4.2 提交步骤疑问/反馈
**描述**: 在维修过程中提交疑问或反馈。
- **接口**: `POST /api/inquiries`
- **输入**: 
  ```json
  {
    "engineerId": "u1",
    "guideId": "g1",
    "stepId": "s1",
    "deviceId": "d1",
    "question": "测量值偏低，是否需要更换皮带？",
    "photoUrl": "https://example.com/feedback_img.jpg",
    "isNewIssue": true,
    "context": {
      "faultCode": "E-001",
      "stepTitle": "检查皮带张紧度",
      "isStepRelated": true
    }
  }
  ```
- **返回**: `{"success": true, "id": "inq_001"}`

---

## 5. 完工提交 (FINAL_SUBMIT)

### 5.1 提交维修记录
**描述**: 维修完成后，提交最终的维修结果。
- **接口**: `POST /api/records`
- **输入**:
  ```json
  {
    "guideId": "g1",
    "engineerId": "u1",
    "faultReason": "皮带老化磨损",
    "treatment": "更换了新的同步皮带并调整张力",
    "photos": ["https://example.com/after_1.jpg"],
    "status": "completed",
    "submissionSource": "CLOSE",
    "context": {
      "deviceId": "d1",
      "faultCode": "E-001",
      "isNewIssue": false
    }
  }
  ```
- **返回**: `{"success": true, "recordId": "r_final_001"}`

---

## 6. 个人中心与历史 (PROFILE / LOG)

### 6.1 获取个人维修历史
**描述**: 查看当前工程师的历史记录。
- **接口**: `GET /api/records/history?engineerId={id}`
- **返回**: `RepairRecord[]`
  ```json
  [
    {
      "id": "r101",
      "guideId": "g1",
      "startTime": "2026-02-13 14:00",
      "endTime": "2026-02-13 15:30",
      "status": "completed",
      "faultReason": "传感器松动",
      "treatment": "重新紧固传感器"
    }
  ]
  ```

### 6.2 获取多媒体资源说明 (备注显示)
**描述**: 获取媒体资源的备注信息。
- **接口**: `GET /api/media/resources`
- **返回**: `MediaResource[]`
  ```json
  [
    {
      "id": "m1",
      "name": "电机结构图",
      "type": "image",
      "url": "https://example.com/motor.jpg",
      "description": "这是 Eagle-X1 型号的主电机防爆结构示意图",
      "tags": ["电机", "结构"]
    }
  ]
  ```
