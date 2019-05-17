var express = require('express');
var router = express.Router();
var mysql = require('mysql');


// 创建连接
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'todolist' //数据库名称
});



// 连接数据库
// connection.connect();


// router.get('/', function (req, res) {
//   console.log('你好');
// });

// router.get('/todo/add', function (req, res) {
//   console.log('/todo/add');
// });

// router.post('/todo/add', function (req, res) {
//   console.log('/todo/add,post');
//   console.log(req.body,'body');
//   res.setHeader('Content-Type','text/plain; charset=utf-8');
//   let data = {
//     data: {
//       name:'丫头',
//       age: '11'
//     }
//   };

//   // 操作数据库
//   connection.query('select * from users', function(error, results, fields) {
//     if (error) console.log(error, '连接数据库失败');
//     if(results)

//     {

//         for(var i = 0; i < results.length; i++)

//         {

//             console.log("%d\t%s\t%s", results[i].id, results[i].name, results[i].age);

//         }

//     }   
//   // 关闭数据库连接
//   connection.end();
//   });

//   res.json(data);
//   // res.end(JSON.stringify(data));
//   res.end();
// });




// 新增todo
router.post('/todo/addEvent', function (req, res) {
  // 编码
  // res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  // 获取创建时间
  createTime = formatDate(new Date());
  //处理开始的参数
  startTime = formatDate(req.body.startTime);
  // 处理提醒方式的参数
  let interval=0, range=0, targetTotal=0;
  targetTotal = req.body.ownNum;
  interval = req.body.ownInterval;
  range = req.body.ownRange;
 
  let sql = 'insert into event(userId, intervals, ranges, targetTotal,createTime,startTime,nextSTime,nextETime,eventStatus,type,y,m,d,tag,priority,timepoint,remark,eventName) '
  +'values( \''+ req.body.userId +'\', \''+ interval +'\',  \''+ range +'\', \''+ targetTotal +'\',\''+ createTime +'\',\''+ startTime +'\', null, null, 1,\''+ req.body.repeatType +'\',\''+ req.body.type +'\',\''+ req.body.type +'\',\''+ req.body.type +'\',\'['+ req.body.tagData +']\',\''+ req.body.priority +'\',\''+ req.body.deadline +'\',\''+ req.body.remark +'\',\''+ req.body.name +'\')';

    connection.query(sql, function (error, results, fields) {
    let data = {};
    if (error) {
      console.log('查询数据库失败');
      data.success = false;
    }
    else {
      console.log('新增todo成功');
      data.success = true;
    }
    res.end(JSON.stringify(data));
  });


});

// 添加新的标签
router.post('/tagData/add', function (req, res) {
  // 输出接口
  // console.log('接口:',req.url,' 参数：',req.body);
  console.log(req.body.name);
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  connection.query('insert into tag(name) values(\''+ req.body.name +'\')', function (error, results, fields) { //，执行sql,query每次必须输入
    let data = {};
    if (error) {
      console.log('查询数据库失败');
      data.success = false;
    }
    else {
      console.log('添加新的标签成功');
      data.success = true;
    }
    res.end(JSON.stringify(data));
  });
});

// 创建新的todo,查询已有的标签
router.post('/tagData/list', function (req, res) {
  // 输出接口
  // console.log('接口:',req.url,' 参数：',req.body);
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  connection.query('select id,name from tag', function (error, results, fields) {
    let data = {};
    if (error) {
      console.log('查询数据库失败');
      data.success = false;
    }
    else {
      console.log('查询已有的标签成功');
      data.success = true;
      data.data =[];
      for (i = 0; i < results.length; i++) {
        let temp = {};
        temp.label = results[i].name;
        temp.key = results[i].name;
        // temp.id = results[i].id;
        // temp.disabled = true;
        data.data.push(temp);
      }
    res.end(JSON.stringify(data));
    }
  });
});


// 测试函数
router.post('/test', function (req, res) {
  // 编码
  // res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let item = {
    nextSTime: '2018-08-29',
    targetTotal: 1,
  };
  everyY();

});

// 获取下一次提醒时间的方法
function getNextTime(item) {
  item.startTime = '2019-05-29';
  console.log(time(item.startTime));
  switch (item.type) {
    case 'y': {
      switch (item.y) {
        case 'once': todoSleep(item);
        break;
        case 'every': everyY(item);
        break;
        case 'odd': 
        break;
        case 'even':
        break;
        case 'own': 
        break;
      }
    }
    break;
    case 'm': {

    }
    break;
    case 'd': {

    }
    break;
  }
}

// nextTime，一年
function everyY (item) {
  let i = item.targetTotal;
  let temp ={};
  temp.nextSTime = item.nextSTime || item.startTime;
  temp.y = time(temp.nextSTime).getFullYear() +1;
  i--;
  while((temp.y < (new date()).getFullYear()) && i>0) {
    temp.y++;
    i--;
    console.log('插入历史记录，用户错过');
  }
  if (i == 0) {
    console.log('事件触发状态设置成休眠，自然休眠');
  }
  temp.nextSTime = temp.y + '-01-01';
  temp.nextETime = temp.y + '-12-30';
  console.log(temp ,temp);
}

// 事件触发状态设置为休眠
function todoSleep(item) {
  let sql = 'update event set eventIsSleep=2 where eventID='+item.id;
  connection.query (sql, function (error, results, fields) {
    let data;
    if (error) {
      console.log('修改事件为睡眠状态失败');
      data.success = false;
    }
    else {
      console.log('修改事件为睡眠状态成功');
      data.success = true;
    }
    res.end(JSON.stringify(data));
  });
}

// 时间变成毫秒值,ms
function time(date) {
  return (new Date(date)).getTime();
}

// 格式化时间,yyyy-mm-dd
function formatDate(time) {
  date = ''+ (new Date(time)).getFullYear()+ '-';
  date = date + ((new Date(time)).getMonth()+1<10? ('0'+((new Date(time)).getMonth()+1)): ((new Date(time)).getMonth()+1));
  date = date + ((new Date(time)).getDate()<10? ('-0'+ (new Date(time)).getDate()):('-'+(new Date(time)).getDate()));
  return date;
}

 // 关闭数据库连接
//  connection.end();
module.exports = router;