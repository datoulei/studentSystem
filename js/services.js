'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource']).
    value('version', '0.1').
    factory('DataBase',[function(){
        return(function(){
            var db;
            function init(){
                var request = indexedDB.open('MyDataBase');
                request.onerror = function(e) {
                    console.log('打开数据库异常:'+ e.target.errorCode);
                };
                request.onsuccess = function(e) {
                    console.log('打开数据库成功');
                    db = e.target.result;
                    console.log(db);
                };
                request.onupgradeneeded = function(e) {
                    console.log('数据库创建成功！');
                    createObjectStore(e.target.result);
                };
            }
            function createObjectStore(db){
                console.log('创建表结构');
                var tableClass = db.createObjectStore('classes', {keyPath: 'id', autoIncrement: true});
                tableClass.createIndex('name', 'name', {unique: true});
                var tableStudent = db.createObjectStore('students', {keyPath: 'id', autoIncrement: true});
                tableStudent.createIndex('name', 'name', {unique: false});
                tableStudent.createIndex('classId', 'classId', {unique: false});
                var tableRecord = db.createObjectStore('records', {keyPath: 'id', autoIncrement: true});
                tableRecord.createIndex('studentId', 'studentId', {unique: false});
                tableRecord.createIndex('classId', 'classId', {unique: false});
                tableRecord.createIndex('date', 'date', {unique: false});
                tableRecord.createIndex('timestamp', 'timestamp', {unique: false});
            }
            function close(){
                db.close();
            }
            function getDb(){
                return db;
            }
            function open(){
                if(db == null) {
                    init();
                }
            }
            function insert(table,data,cb) {
                var transaction = db.transaction(table,'readwrite');
                var store = transaction.objectStore(table);
                var req = store.add(data);
                req.onsuccess = cb;
            }
            function update(table,data,cb){
                var transaction = db.transaction(table,'readwrite');
                var store = transaction.objectStore(table);
                var req = store.put(data);
                req.onsuccess = cb;
            }
            function del(table,key,cb){
                var transaction = db.transaction(table,'readwrite');
                var store = transaction.objectStore(table);
                var req = store.delete(key);
                req.onsuccess = cb;
            }
            function loadAll(table,cb) {
                var list = [];
                var transaction = db.transaction(table);
                var store = transaction.objectStore(table);
                store.openCursor().onsuccess = function(e) {
                    var cursor = e.target.result;
                    if(cursor) {
                        list.push(cursor.value);
                        cursor.continue();
                    }else {
                        cb(list);
                    }
                };
            }
            function loadByIndex(table,iName,iValue,cb) {
                var list = [];
                var transaction = db.transaction(table);
                var store = transaction.objectStore(table);
                store.index(iName).openCursor(IDBKeyRange.only(iValue)).onsuccess = function(e) {
                    var cursor = e.target.result;
                    if(cursor) {
                        list.push(cursor.value);
                        cursor.continue();
                    }else {
                        cb(list);
                    }
                };
            }
            function loadByIndexRange(table,iName,bLeft,bRight,cb){
                var list = [];
                var transaction = db.transaction(table);
                var store = transaction.objectStore(table);
                var boundKeyRange = IDBKeyRange.bound(bLeft, bRight);
                store.index(iName).openCursor(boundKeyRange).onsuccess = function(e){
                    var cursor = e.target.result;
                    if(cursor) {
                        list.push(cursor.value);
                        cursor.continue();
                    }else {
                        cb(list);
                    }
                }
            }
            return{
                open:open,
                getDb: getDb,
                insert: insert,
                update: update,
                del: del,
                loadAll: loadAll,
                loadByIndex:loadByIndex,
                loadByIndexRange: loadByIndexRange
            }
        })();
    }]).
    factory('Class',['$rootScope','DataBase',function($rootScope,DataBase){
        return(function(){
            var classList = [];

            function add(classData){
                var isAllow = true;
                angular.forEach(classList,function(obj) {
                    if(obj.name == classData.name) {
                        isAllow = false;
                    }
                });
                if(isAllow) {
                    DataBase.insert('classes',classData,function(e) {
                        console.log('添加班级成功！');
                        classList.push(classData);
                        $rootScope.$broadcast('class.add', {code: 0, msg: '添加成功', data: classData});
                    });
                }else {
                    console.log('添加班级失败！原因：班级编号或名称已存在');
                    $rootScope.$broadcast('class.add', {code: 1, msg: '班级编号或名称已存在'});
                }
            }
            function update(index,classData){
                var isAllow = true;
                angular.forEach(classList,function(obj,ix) {
                    if(obj.classId == classData.classId || obj.className == classData.className) {
                        if(ix != index) {
                            isAllow = false;
                        }
                    }
                });
                if(isAllow) {
                    classList[index] = classData;
                    DataBase.update('classes',classData,function(){
                        console.log('班级信息已经更新');
                        $rootScope.$broadcast('class.update', {code: 0, msg: '修改成功', data: {index: index, classData: classData}});
                    });
                }else {
                    console.log('修改班级信息失败！原因：班级编号或名称已存在');
                    $rootScope.$broadcast('class.update', {code: 1, msg: '班级编号或名称已存在'});
                }
            }
            function del(index, data){
                var key = data.id;
                //判断该班级内是否还有学生
                DataBase.loadByIndex('students','classId',key,function(list) {
                    if(list.length > 0) {
                        console.log('%s中还有学生，无法删除', data.name);
                        $rootScope.$broadcast('class.del', {code: 1, msg: '班级学生数量不为0，无法删除'});
                    }else {
                        DataBase.del('classes', key, function(){
                            console.log('删除班级【%s】成功。', data.name);
                            classList.splice(index, 1);
                            $rootScope.$broadcast('class.del', {code: 0, msg: '删除成功！', data:{index: index}});
                        });
                    }
                });
            }
            function load(){
                DataBase.loadAll('classes',function(data) {
                    console.log('班级列表加载完毕');
                    classList = data || [];
                    $rootScope.$broadcast('class.load', classList.concat());
                });
            }
            return{
                add: add,
                update: update,
                del: del,
                load: load
            }
        })();
    }]).
    factory('Student',['$rootScope','DataBase',function($rootScope,DataBase){
        return(function(){
            var studentList = [];
            function add(data,classObj){
                var isAllow = true;
                var classId = data.classId;
                angular.forEach(studentList[classId],function(obj) {
                    if(obj.no == data.no) {
                        isAllow = false;
                    }
                });
                if(isAllow) {
                    DataBase.update('students',data,function(e) {
                        console.log('添加学生成功！');
                        studentList[classId].push(data);
                        //更新班级人数
                        classObj.studentCount++;
                        DataBase.update('classes',classObj,function(){
                            console.log('%s学生人数已经更新', classObj.name);
                        });
                        $rootScope.$broadcast('student.add', {code: 0, msg: '添加成功', data: data});
                    });
                }else {
                    console.log('添加学生失败！原因：学号已存在');
                    $rootScope.$broadcast('student.add', {code: 1, msg: '学号已存在'});
                }
            };
            function del(index, data, classObj){
                var studentId = data.id;
                DataBase.loadByIndex('records','studentId',studentId,function(list) {
                    if(list.length == 0) {
                        DataBase.del('students',studentId, function() {
                            console.log('删除学生成功');
                            studentList.splice(index, 1);
                            //更新班级人数
                            classObj.studentCount--;
                            DataBase.update('classes',classObj,function(){
                                console.log('%s学生人数已经更新', classObj.name);
                            });
                            $rootScope.$broadcast('student.del', {code: 0, msg: '删除成功', data: index});
                        });
                    }else {
                        $rootScope.$broadcast('student.del', {code: 1, msg: '学生记录不为空，无法删除'});
                    }
                })
            };
            function update(index,data){
                var isAllow = true;
                var classId = data.classId;
                angular.forEach(studentList[classId],function(obj, ix) {
                    if(obj.no == data.no) {
                        if(ix != index) {
                            isAllow = false;
                        }
                    }
                });
                if(isAllow) {
                    DataBase.update('students',data,function(e) {
                        console.log('修改学生%s信息成功！',data.name);
                        studentList[classId][index] = data;
                        $rootScope.$broadcast('student.update', {code: 0, msg: '添加成功', data: { index: index, studentData: data}});
                    });
                }else {
                    console.log('修改失败！原因：学号已存在');
                    $rootScope.$broadcast('student.update', {code: 1, msg: '学号已存在'});
                }
            };
            function load(classObj){
                DataBase.loadByIndex('students','classId',classObj.id,function(list) {
                    console.log('读取%s学生信息成功！',classObj.name);
                    studentList[classObj.id] = list.concat();
                    $rootScope.$broadcast('student.load', list.concat());
                });
            };
            return{
                add:add,
                update:update,
                del:del,
                load:load
            }
        })();
    }])
    .factory('Record',['$rootScope','DataBase',function($rootScope,DataBase){
        return(function(){
            var recordList = [];
            function add(data){
                var studentId = data.studentId;
                if(studentId != null) {
                    DataBase.insert('records', data, function() {
                        console.log('添加记录成功！');
                        $rootScope.$broadcast('record.add', {code: 0, msg: '添加成功', data: data});
                    });
                }else {
                    console.log('添加记录失败！学生ID不能为空');
                    $rootScope.$broadcast('record.add', {code: 1, msg: '学生编号为空'});
                }
            }
            function update(){}
            function del(index, data){
                DataBase.del('records',data.id,function(e){
                    console.log(e);
                    console.log('删除记录成功');
                    recordList.splice(index, 1);
                    $rootScope.$broadcast('record.del', {code: 0, msg: '删除成功', data: index});
                });
            }
            function load(){
                DataBase.loadAll('records',function(data) {
                    console.log('惩罚记录列表加载完毕');
                    recordList = data || [];
                    $rootScope.$broadcast('record.load', recordList.concat());
                });
            }
            function getListByDateRange(begin,end){
                DataBase.loadByIndexRange('records','date',begin,end,function(list){
                    console.log('读取%s到%s之间的记录成功', begin, end);
                    $rootScope.$broadcast('record.loadByDateRange', list.concat());
                });
            }
            return{
                add: add,
                update: update,
                del: del,
                load: load,
                loadByDateRange: getListByDateRange
            }
        })();
    }]);
