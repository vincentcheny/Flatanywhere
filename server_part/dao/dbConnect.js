var mysql=require('mysql');
// this file define all the MYSQL query we use in index.js
function connectServer(){
    var pool = mysql.createPool({
        host:'localhost',
        user:'root',
        password:'root',
        port:'3306',
        database:'Flatanywhere',
    });
    console.log("Create connection pool successfully.");
    return pool;
    // var client=mysql.createConnection({
    //     host:'localhost',
    //     user:'root',
    //     password:'root',
    //     port:'3306',
    //     database:'Flatanywhere'
    // });
    // console.log("connect success");
    // return client;
    // let conn=mysql.createConnection({
    //     host:'localhost',
    //     user:'root',
    //     password:'root',
    //     port:'3306',
    //     database:'Flatanywhere'
    // });
    // // let conn = mysql.createConnection(mysql_config);
    // conn.connect(err => {
    //     (err) && setTimeout(function() {
    //       connectServer();
    //     }, 2000);
    // });
    //
    // conn.on('error', err => {
    //     if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    //         // db error 重新連線
    //         //connectServer();
    //     } else {
    //         throw err;
    //     }
    // });
    // exports.conn = conn;
    // console.log("connect success");
    // return conn;
}

function insert_SmartLock(client, SLID, owner, currentUser, start_time, end_time, unit_price, nickname, address, isShown, callback) {
    client.getConnection(function(err, connection) {
        connection.query('insert into SmartLock value(?,?,?,?,?,?,?,?,?)',
            [SLID, owner, currentUser, start_time, end_time, unit_price, nickname, address, isShown],
            function (err) {
                if (err) {
                    console.log("insert_SmartLock error: " + err.message);
                    return err;
                }
                callback(err);
                connection.release();
            });
    });
}

function select_SmartLock_Store(client, callback) {
    client.getConnection(function(err, connection) {
        connection.query('select SLID, unit_price, owner, start_time, end_time, address from SmartLock WHERE isShown=true AND end_time > NOW()',
            function (err, result, field) {
                if (err)
                    throw err;
                else
                    callback(result);
                connection.release();
            });
    });
}

function select_SmartLock_by_Owner(client, owner, callback) {
    client.getConnection(function(err, connection) {
        connection.query('select SLID, nickname, currentuser, isShown, start_time, end_time, unit_price, address from SmartLock WHERE owner="' + owner + '" ORDER BY isShown ASC, end_time ASC, nickname ASC',
            function (err, result) {
                if (err)
                    throw err;
                else
                    callback(result);
                connection.release();
            });
    });
}

function select_SmartLock_by_CurrentUser(client, currentUser, callback) {
    client.getConnection(function(err, connection) {
        connection.query('select s.SLID, s.nickname, s.currentuser, s.isShown, s.unit_price, s.address from SmartLock s JOIN Deal d ON s.SLID=d.SLID WHERE s.owner <> "' + currentUser + '" AND s.currentuser="' + currentUser + '" AND d.isCheckedIn=true',
            function (err, result) {
                if (err)
                    throw err;
                else
                    callback(result);
                connection.release();
            });
    });
}

function insert_Deal(client, DEALID, SLID, sellerAddr, buyerAddr, totalAmount, checkInTime, checkOutTime, callback) {
    client.getConnection(function(err, connection) {
        connection.query('insert into Deal (DEALID, SLID, seller_Addr, buyer_Addr, total_Amount, check_in_time, check_out_time, isRead, isWithdraw, isCheckedIn) value(?,?,?,?,?,?,?,?,?,?)',
            [DEALID, SLID, sellerAddr, buyerAddr, totalAmount, checkInTime, checkOutTime, false, false, false],
            function (err) {
                if (err) {
                    console.log("insert_Deal error:" + err.message);
                    return err;
                }
                callback(err);
                connection.release();
            });
    });
}

function select_Deal_Unread(client, currentUser, callback) {
    client.getConnection(function(err, connection) {
        connection.query('select COUNT(*) AS count from Deal d where d.seller_Addr="' + currentUser + '" AND d.isRead=false', function(err, result) {
            if (err)
                throw err;
            else
                callback(result);
            connection.release();
        });
    });
}

function select_Info_BuyerView(client, callback) {
    client.getConnection(function(err, connection) {
        connection.query('select s.SLID, d.check_in_time, d.check_out_time from Deal d right JOIN SmartLock s ON d.SLID = s.SLID WHERE s.isShown = true AND s.end_time > NOW() ',
        // client.query('select * from SmartLock s LEFT JOIN Deal d ON d.SLID = s.SLID WHERE DATE(s.end_time) > CURRENT_DATE()',
            // LEFT JOIN: return all rows in left table even if no corresponding right table
            function (err, result) {
                if (err)
                    throw err;
                else
                    callback(result);
                connection.release();
            });
    });
    // client.query('select s.SLID, d.check_in_time, d.check_out_time from Deal d right JOIN SmartLock s ON d.SLID = s.SLID WHERE s.isShown = true AND s.end_time > NOW() ',
    // // client.query('select * from SmartLock s LEFT JOIN Deal d ON d.SLID = s.SLID WHERE DATE(s.end_time) > CURRENT_DATE()',
    //     // LEFT JOIN: return all rows in left table even if no corresponding right table
    //     function (err, result) {
    //         client.release();
    //         if (err)
    //             throw err;
    //         else{
    //             callback(result);
    //         }
    //     });
}

// function select_Info_BoughtLockView(client, currentUser, callback) {
//     // client.query('select s.state, s.isFinished, s.SLID, d.check_in_time, d.check_out_time from SmartLock s JOIN Deal d ON s.SLID = d.SLID WHERE d.buyer_Addr = "' + currentUser + '" AND DATE(s.end_time) > CURRENT_DATE()',
//     client.query('select s.SLID from SmartLock s JOIN Deal d ON s.SLID = d.SLID WHERE d.buyer_Addr = "' + currentUser
//         + '" AND DATE(d.check_in_time) <= CURRENT_DATE() AND CURRENT_DATE() <= DATE(d.check_out_time) AND s.state = 0',
//         // check whether any lock of mine is within a period of available time
//         function (err, result) {
//             if (err)
//                 throw err;
//             else
//                 callback(result);
//         });
// }

function select_Info_SoldLockView(client, currentUser, callback) {
    client.getConnection(function(err, connection) {
        connection.query('SELECT d.DEALID FROM Deal d WHERE d.seller_Addr = "' + currentUser+ '" AND d.isWithdraw=false AND d.check_in_time <= NOW()', function(err, result) {
            if (err)
                throw err;
            else
                callback(result);
            connection.release();
        });
    });
}

// last deal of each lock
function select_Info_MyLockFutureView(client, owner, callback) {
    client.getConnection(function(err, connection) {
        connection.query('select d.SLID, MAX(d.check_out_time) AS last_check_out_time FROM (select check_out_time, SLID from Deal WHERE seller_Addr="' + owner + '" ORDER BY check_out_time DESC) AS d GROUP BY d.SLID',
            // client.query('select d.check_in_time, d.check_out_time FROM SmartLock s JOIN Deal d ON s.SLID = d.SLID WHERE s.owner="' + owner + '" AND CURRENT_DATE() <= DATE(d.check_out_time) ORDER BY d.check_out_time DESC',
            function(err, result) {
                if (err)
                    throw err;
                else
                    callback(result);
                connection.release();
            });
    });
}

function select_Info_BoughtLockFutureView(client, owner, callback) {
    client.getConnection(function(err, connection) {
        connection.query('select s.SLID, s.nickname, s.unit_price, s.address, d.check_in_time, d.DEALID FROM SmartLock s JOIN Deal d ON s.SLID = d.SLID WHERE d.buyer_Addr="' + owner + '" AND d.isWithdraw=false AND d.isCheckedIn=false ORDER BY d.check_in_time ASC',
            function(err, result) {
                if (err)
                    throw err;
                else
                    callback(result);
                connection.release();
            });
    });
}

function update_Deal_Unread(client, currentUser, callback){
    client.getConnection(function(err, connection) {
        connection.query('UPDATE Deal d SET d.isRead=true WHERE d.seller_Addr="' + currentUser + '"',
            function(err){
                if(err)
                {
                    console.log( "update_Deal_Unread error:" + err.message);
                    return err;
                }
                callback(err);
                connection.release();
            });
    });
}

function update_Info_Renting(client, SLID, DEALID, currentUser, callback){
    client.getConnection(function(err, connection) {
        connection.query('UPDATE Deal SET isCheckedIn = true WHERE DEALID="' + DEALID +'"', function(err) {
            if(err)
            {
                console.log( "update_Info_Renting 1 error:" + err.message);
                return err;
            }
            connection.query('UPDATE SmartLock SET currentUser ="' + currentUser + '" WHERE SLID = "'+SLID+'"', function(err){
                if(err)
                {
                    console.log( "update_Info_Renting 2 error:" + err.message);
                    return err;
                }
                callback(err);
                connection.release();
            });
        });
    });
}

function update_SmartLock_showStore(client, SLID, callback){
    client.getConnection(function(err, connection) {
    // client.query('UPDATE SmartLock SET isShown = true, start_time="' + st + '", end_time="' + et + '" WHERE SLID = "'+SLID+'"',
        connection.query('UPDATE SmartLock SET isShown = true WHERE SLID = "'+SLID+'"',
            function(err){
                if(err)
                {
                    console.log( "update_SmartLock_showStore error:" + err.message);
                    return err;
                }
                callback(err);
                connection.release();
            });
    });
}

function update_SmartLock_hideStore(client, SLID, callback){
    client.getConnection(function(err, connection) {
// client.query('UPDATE SmartLock SET isShown = false, start_time = ' + st + ', end_time = ' + et + ' WHERE SLID = "'+SLID+'"',
        connection.query('UPDATE SmartLock SET isShown = false WHERE SLID = "'+SLID+'"', function(err){
            if(err) {
                console.log( "update_SmartLock_hideStore error:" + err.message);
                return err;
            }
            callback(err);
            connection.release();
        });
    });
}

function update_Deal_Withdraw(client, DEALID, callback) {
    client.getConnection(function(err, connection) {
        connection.query('UPDATE Deal SET isWithdraw=true WHERE DEALID = "'+DEALID+'"', function(err) {
            if(err)
            {
                console.log( "update_Deal_Withdraw error:" + err.message);
                return err;
            }
            callback(err);
            connection.release();
        });
    });
}

function select_SmartLock_Deletable(client, SLID, callback) {
    client.getConnection(function(err, connection) {
        connection.query('SELECT COUNT(*) AS numOfDeletable FROM Deal WHERE SLID = "' + SLID + '" AND check_out_time>=CURRENT_DATE()', function(err, result) {
            if (err)
                throw err;
            else
                callback(result);
            connection.release();
        });
    });
}

function delete_SmartLock_by_SLID(client, SLID, callback){
    client.getConnection(function(err, connection) {
        connection.query('DELETE FROM SmartLock WHERE SLID = "'+SLID+'"', function(err){
            if(err)
            {
                console.log( "delete_SmartLock_by_SLID error:" + err.message);
                return err;
            }
            callback(err);
            connection.release();
        });
    });
}

exports.connect = connectServer;

exports.insert_SmartLock = insert_SmartLock;
exports.select_SmartLock_Store = select_SmartLock_Store;
exports.delete_SmartLock_by_SLID = delete_SmartLock_by_SLID;
exports.select_SmartLock_by_Owner = select_SmartLock_by_Owner;
exports.select_SmartLock_Deletable = select_SmartLock_Deletable;
exports.select_SmartLock_by_CurrentUser = select_SmartLock_by_CurrentUser;

exports.insert_Deal = insert_Deal;
exports.select_Deal_Unread = select_Deal_Unread;
exports.select_Info_BuyerView = select_Info_BuyerView;
exports.select_Info_SoldLockView = select_Info_SoldLockView;
// exports.select_Info_BoughtLockView = select_Info_BoughtLockView;
exports.select_Info_MyLockFutureView = select_Info_MyLockFutureView;
exports.select_Info_BoughtLockFutureView = select_Info_BoughtLockFutureView;

exports.update_Deal_Unread = update_Deal_Unread;
exports.update_Info_Renting = update_Info_Renting;
exports.update_SmartLock_showStore = update_SmartLock_showStore;
exports.update_SmartLock_hideStore = update_SmartLock_hideStore;
exports.update_Deal_Withdraw = update_Deal_Withdraw;
