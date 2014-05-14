'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    /* 首页控制器 */
    .controller('homeCtrl', ['$scope',function($scope) {
        $scope.getTodoList = function(){
            chrome.storage.local.get('__TODO_LIST', function(item){
                console.log('待办事项读取成功');
                $scope.todoList = item['__TODO_LIST'] || [];
                $scope.$apply();
            });
        }
        $scope.saveTodoList = function(){
            var data = angular.copy($scope.todoList);
            chrome.storage.local.set({'__TODO_LIST':data},function(){
                console.log('待办事项保存成功');
            });
        }
        $scope.todoDel = function(index){
            $scope.todoList.splice(index,1);
            $scope.saveTodoList()
        }
        $scope.todoSave = function(e){
            if(!e || e.keyCode == '13'){
                $scope.todoList.push({content:$scope.content});
                $scope.saveTodoList();
                $scope.content = '';
            }
        }
    }])
    .controller('classCtrl', ['$scope','Class',function($scope, Class) {
        /**
         * 获取班级列表
         */
        $scope.getClassList = function(){
            Class.load();
        }
        /**
         * 创建新班级
         */
        $scope.create = function(){
            $('#classModal').modal('show');
            $scope.modal = undefined;
            $scope.oper = 'create';
        }
        /**
         * 修改班级信息
         * @param index
         */
        $scope.update = function(index){
            $scope.modal = angular.copy($scope.classList[index]);
            $('#classModal').modal('show');
            $scope.oper = 'update';
            $scope.index = index;
        }
        /**
         * 删除班级
         */
        $scope.delete = function(index){
            var data = angular.copy($scope.classList[index]);
            var text = '确定删除 ' + data.name + ' 吗?';
            var msg = Messenger().post({
                    message: text,
                    type: 'info',
                    actions: {
                        done:{
                            label: '删除',
                            action: function(){
                                Class.del(index, data);
                                msg.hide();
                            }
                        },
                        cancel:{
                            label: '取消',
                            action: function(){
                                msg.hide();
                            }
                        }
                    }
                });
        }
        /**
         * 保存班级信息（新增或修改）
         */
        $scope.save = function(){
            var data = angular.copy($scope.modal);
            if(data && data.name != '') {
                if($scope.oper == 'create'){
                    data.studentCount = 0;
                    Class.add(data);
                }else if($scope.oper == 'update'){
                    Class.update($scope.index, data);
                }
            }else {
                Messenger().post({
                    message: '班级编号和名称不能为空',
                    type: 'error',
                    showCloseButton: true
                });
            }
        }
        /**
         * 班级列表加载事件
         */
        $scope.$on('class.load',function(e,data){
            console.log(data);
            $scope.classList = data;
            $scope.$apply();
        });
        /**
         * 班级添加回调事件
         */
        $scope.$on('class.add',function(e,data) {
            console.log('添加班级回调');
            console.log(data);
            if(data.code == 0) {
                $scope.modal = undefined;
                $scope.classList.push(data.data);
                $('#classModal').modal('hide');
                $scope.$apply();
                Messenger().post({
                    message: '添加成功',
                    showCloseButton: true
                });
            }else {
                Messenger().post({
                    message: data.msg,
                    type: 'error',
                    showCloseButton: true
                });
            }
        });
        /**
         * 班级更新回调事件
         */
        $scope.$on('class.update',function(e,data) {
            console.log('修改班级回调');
            console.log(data);
            if(data.code == 0) {
                $scope.modal = undefined;
                $scope.classList[data.data.index] = data.data.classData;
                $('#classModal').modal('hide');
                $scope.$apply();
                Messenger().post({
                    message: '修改成功',
                    showCloseButton: true
                });
            }else {
                Messenger().post({
                    message: data.msg,
                    type: 'error',
                    showCloseButton: true
                });
            }
        });
        $scope.$on('class.del', function(e,data) {
            console.log(data);
            if(data.code == 0) {
                $scope.classList.splice(data.data.index, 1);
                $scope.$apply();
                Messenger().post({
                    message: data.msg,
                    showCloseButton: true
                });
            }else {
                Messenger().post({
                    message: data.msg,
                    type: 'error',
                    showCloseButton: true
                });
            }
        })
    }])
     .controller('studentCtrl', ['$scope','Class','Student',function($scope,Class,Student) {
        /**
         * 获取班级列表
         */
        $scope.getClassList = function(){
            Class.load();
        }
        /**
         * 切换学生列表
         */
        $scope.toggleStudentList = function(data){
            if(data != null) {
                Student.load(data);
            }else {
                $scope.studentList = [];
            }
        }
        /**
         * 创建新学生
         */
        $scope.create = function(){
            $('#studentModal').modal('show');
            $scope.modal = undefined;
            $scope.oper = 'create';
        }
        /**
         * 修改学生信息
         * @param index
         */
        $scope.update = function(index){
            $scope.modal = angular.copy($scope.studentList[index]);
            $('#studentModal').modal('show');
            $scope.oper = 'update';
            $scope.index = index;
        }
        $scope.delete = function(index){
            var data = angular.copy($scope.studentList[index]);
            var text = '确定删除 ' + data.name + ' 吗?';
            var msg = Messenger().post({
                message: text,
                type: 'info',
                actions: {
                    done:{
                        label: '删除',
                        action: function(){
                            Student.del(index, data, $scope.classObj);
                            msg.hide();
                        }
                    },
                    cancel:{
                        label: '取消',
                        action: function(){
                            msg.hide();
                        }
                    }
                }
            });
        }
        /**
         * 保存学生信息（新增或修改）
         */
        $scope.save = function(){
            var data = angular.copy($scope.modal);
            if(data.name != '' && data.no != '') {
                if($scope.oper == 'create'){
                    data.classId = $scope.classObj.id;
                    Student.add(data,$scope.classObj);
                }else if($scope.oper == 'update'){
                    Student.update($scope.index, data);
                }
            }else {
                Messenger().post({
                    message: '学号和姓名不能为空',
                    type: 'error',
                    showCloseButton: true
                });
            }
        }
        /**
         * 班级列表加载事件
         */
        $scope.$on('class.load',function(e,data){
            console.log(data);
            $scope.classList = data;
            $scope.classObj = $scope.classList[0];
            $scope.toggleStudentList($scope.classObj);
            $scope.$apply();
        });
        /**
         * 学生列表加载事件
         */
        $scope.$on('student.load',function(e,data){
            console.log(data);
            $scope.studentList = data;
            $scope.$apply();
        });
        /**
         * 学生添加回调事件
         */
        $scope.$on('student.add',function(e,data) {
            console.log('添加班级回调');
            console.log(data);
            if(data.code == 0) {
                $scope.studentList.push(data.data);
                if($scope.multi != null && $scope.multi == true) {
                    $scope.modal = undefined;
                }else{
                    $('#studentModal').modal('hide');
                }
                Messenger().post({
                    message: data.msg,
                    showCloseButton: true
                });
                $scope.$apply();
            }else {
                Messenger().post({
                    message: data.msg,
                    type: 'error',
                    showCloseButton: true
                });
            }
        });
        /**
         * 学生更新回调事件
         */
        $scope.$on('student.update',function(e,data) {
            console.log(data);
            if(data.code == 0) {
                $scope.modal = undefined;
                $scope.studentList[data.data.index] = data.data.studentData;
                $('#studentModal').modal('hide');
                Messenger().post({
                    message: data.msg,
                    showCloseButton: true
                });
                $scope.$apply();
            }else {
                Messenger().post({
                    message: data.msg,
                    type: 'error',
                    showCloseButton: true
                });
            }
        });
        $scope.$on('student.del', function(e, data) {
            console.log(data);
            if(data.code == 0) {
                $scope.studentList.splice(data.data, 1);
                $scope.$apply();
                Messenger().post({
                    message: data.msg,
                    showCloseButton: true
                });
            }else {
                Messenger().post({
                    message: data.msg,
                    type: 'error',
                    showCloseButton: true
                });
            }
        })
    }])
     .controller('recordCtrl',['$scope','Class','Student','Record',function($scope,Class,Student,Record){
        /**
         * 获取班级列表
         */
        $scope.getRecordList = function(){
            Record.load();
        }
        /**
         * 获取班级列表
         */
        $scope.getClassList = function(){
            Class.load();
        }
        /**
         * 切换学生列表
         */
        $scope.toggleStudentList = function(data){
            if(data != null) {
                Student.load(data);
            }else {
                $scope.studentList = [];
                $scope.modal.student = null;
            }
        }
        /**
         * 创建新记录
         */
        $scope.create = function(){
            if($scope.classList == null) {
                $scope.getClassList();
            }
            $('#recordModal').modal('show');
            var now = new Date();
            $scope.modal = {};
            $scope.modal.date = now.Format('yyyy-MM-dd');
            $scope.modal.timeType = 0;
            $scope.modal.type = 0;
            $scope.oper = 'create';
        }
        /**
         * 修改记录信息
         * @param index
         */
        $scope.update = function(index){
            $scope.modal = angular.copy($scope.recordList[index]);
            $('#recordModal').modal('show');
            console.log($scope.modal);
            $scope.oper = 'update';
            $scope.index = index;
        }
        /**
         * 删除记录
         * @param index
         */
        $scope.delete = function (index){
            var data = angular.copy($scope.recordList[index]);
            var text = '确定删除该条记录吗?';
            var msg = Messenger().post({
                message: text,
                type: 'info',
                actions: {
                    done:{
                        label: '删除',
                        action: function(){
                            Record.del(index, data);
                            msg.hide();
                        }
                    },
                    cancel:{
                        label: '取消',
                        action: function(){
                            msg.hide();
                        }
                    }
                }
            });
        }
        /**
         * 保存记录信息（新增或修改）
         */
        $scope.save = function () {
            var data = angular.copy($scope.modal);
            if (data.student != null && data.date != '') {
                if ($scope.oper == 'create') {
                    data.classId = data.class.id;
                    data.studentId = data.student.id;
                    data.timestamp = (new Date()).getTime();
                    Record.add(data);
                } else if ($scope.oper == 'update') {
                    Record.update($scope.index, data);
                }
            } else {
                Messenger().post({
                    message: '学生和日期不能为空',
                    type: 'error',
                    showCloseButton: true
                });
            }
        };
        /**
         * 记录添加回调事件
         */
        $scope.$on('record.add',function(e,data) {
            console.log('添加记录回调');
            console.log(data);
            if(data.code == 0) {
                $scope.recordList.push(data.data);
                if($scope.multi != null && $scope.multi == true) {
                    $scope.create();
                }else{
                    $('#recordModal').modal('hide');
                }
                Messenger().post({
                    message: data.msg,
                    showCloseButton: true
                });
                $scope.$apply();
            }else {
                Messenger().post({
                    message: data.msg,
                    type: 'error',
                    showCloseButton: true
                });
            }
        });
        /**
         * 记录更新回调事件
         */
        $scope.$on('record.update',function(e,data) {
            console.log(data);
            if(data.code == 0) {
                $scope.modal = undefined;
                $scope.recordList[data.data.index] = data.data.recordData;
                $('#recordModal').modal('hide');
                Messenger().post({
                    message: data.msg,
                    showCloseButton: true
                });
                $scope.$apply();
            }else {
                Messenger().post({
                    message: data.msg,
                    type: 'error',
                    showCloseButton: true
                });
            }
        });
        $scope.$on('record.del', function(e,data) {
            console.log(data);
            if(data.code == 0) {
                $scope.recordList.splice(data.data, 1);
                $scope.$apply();
                Messenger().post({
                    message: data.msg,
                    type: 'error',
                    showCloseButton: true
                });
            }
        });
        /**
         * 记录列表加载事件
         */
        $scope.$on('record.load',function(e,data){
            console.log(data);
            $scope.recordList = data;
            $scope.$apply();
        });
        /**
         * 班级列表加载事件
         */
        $scope.$on('class.load',function(e,data){
            console.log(data);
            $scope.classList = data;
            $scope.$apply();
        });
        /**
         * 学生列表加载事件
         */
        $scope.$on('student.load',function(e,data){
            console.log(data);
            $scope.studentList = data;
            $scope.$apply();
        });
    }])
    .controller('statisticCtrl',['$scope','Record', function($scope,Record){
        /* 图表选项(默认) */
        var chartOptions = {
            chart: {type: 'column'},
            credits: {enabled: false},
            title: {text:'学生记录报表'},
            xAxis: {},
            yAxis: {min: 0,title: {text: '次数',rotation:0,y:-150}},
            series: []
        };
        function createRecordChart(list){
            var option = angular.copy(chartOptions);
            var categories = [];
            var dataArray = {
                type_0:{},
                type_1:{},
                type_2:{},
                type_3:{}
            };
            angular.forEach(list, function (obj){
                var date = obj['date'].slice(5);//获得日期（MM-dd)
                categories.push(date);
                switch (obj.type) {
                    case 0:
                        //迟到记录
                        dataArray['type_0'][date] = dataArray['type_0'][date] || 0;
                        dataArray['type_0'][date]++;
                        break;
                    case 1:
                        //早退记录
                        dataArray['type_1'][date] = dataArray['type_1'][date] || 0;
                        dataArray['type_1'][date]++;
                        break;
                    case 2:
                        //请假记录
                        dataArray['type_2'][date] = dataArray['type_2'][date] || 0;
                        dataArray['type_2'][date]++;
                        break;
                    case 3:
                        //旷课记录
                        dataArray['type_3'][date] = dataArray['type_3'][date] || 0;
                        dataArray['type_3'][date]++;
                        break;
                }
            });
            option.xAxis.categories = _.uniq(categories,true);//横向坐标
            option.plotOptions = {column: {stacking: 'normal'}};//堆积柱状图
            option.title.text = '学生记录报表';
            var subTitle = $scope.date.begin + '至' + $scope.date.end;
            option.subtitle = {text: subTitle};
            var dataBase = _.object(option.xAxis.categories,[]);//
            option.series.push({data: _.pairs(_.extend(angular.copy(dataBase),dataArray['type_0'])), name: '迟到'});
            option.series.push({data: _.pairs(_.extend(angular.copy(dataBase),dataArray['type_1'])), name: '早退'});
            option.series.push({data: _.pairs(_.extend(angular.copy(dataBase),dataArray['type_2'])), name: '请假'});
            option.series.push({data: _.pairs(_.extend(angular.copy(dataBase),dataArray['type_3'])), name: '旷课'});
            console.log('开始绘制图表');
            $('#chart').highcharts(option);
            //保存数据
            $scope.recordList = angular.copy(list);
            console.log($scope.recordList);
        }
        $scope.currentDate = new Date();
        $scope.queryRecord = function(date){
            var strFirstDayOfWeek = Date.firstDayOfWeek(date).Format('yyyy-MM-dd');
            var strLastDayOfWeek = Date.lastDayOfWeek(date).Format('yyyy-MM-dd');
            $scope.date = {begin: strFirstDayOfWeek, end: strLastDayOfWeek};
            Record.loadByDateRange(strFirstDayOfWeek, strLastDayOfWeek);
        }
        $scope.lastWeek = function(){
            var date = $scope.currentDate;
            date.setDate(date.getDate() - 7);
            $scope.queryRecord(date);
        }
        $scope.nextWeek = function(){
            var date = $scope.currentDate;
            date.setDate(date.getDate() + 7);
            $scope.queryRecord(date);
        }
        /**
         * 导出数据
         */
        $scope.export = function(){
            var textArray = ['姓名,迟到,早退,请假,旷课'];
            var userArray = {};
            angular.forEach($scope.recordList, function(obj) {
                if(!userArray[obj.student.name]){
                    userArray[obj.student.name] = [0,0,0,0];
                }
                userArray[obj.student.name][obj.type]++;
            });
            angular.forEach(userArray,function(obj, key){
                var text = key + ',' + obj.join(',');
                textArray.push(text);
                console.log(text);
            })
            var fileName = $scope.date.begin + '至' + $scope.date.end + '记录导出.csv';
            chrome.fileSystem.chooseEntry({
                type: 'saveFile',
                suggestedName: fileName
            },function(writableFileEntry){
                writableFileEntry.createWriter(function(writer) {
                    console.log(writer);
                    writer.onerror = function(e){
                        console.log(e);
                    };
                    writer.onwriteend = function(e) {
                        console.log('数据已导出');
                        Messenger().post('数据已成功导出!');
                    };
                    writer.write(new Blob([textArray.join('\r\n')], {type: 'text/plain'}));
                }, function(e){console.log(e)});
            });
        }
        $scope.$on('record.loadByDateRange',function(e,list) {
            createRecordChart(list);
        });
    }]);