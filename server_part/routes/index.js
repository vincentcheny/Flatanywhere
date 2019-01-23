var express = require('express');
var mysql = require('dao/dbConnect.js');
var router = express.Router();

/*GET the user account !*/
// router.get('/',function (req,res){
//     res.redirect('/home');
// });

/* GET home page. */
router.get('/', function(req, res)
{
    res.render('Home',req);
})
    .post('/', function(req,res)
    {
        req.session.userAccount = req.body.userAccount;
        if (req.body.hidden_state == 0) {
            res.redirect('/BindLock');
        } else if (req.body.hidden_state == 1) {
            res.redirect('/MyLock');
        } else if (req.body.hidden_state == 2) {
            res.redirect('/Store');
        }
    });

router.get('/Query', function(req,res)
    {
        var client = mysql.connect();
        mysql.select_Deal_Unread(client, req.session.userAccount, function(result){
          return res.send(result);
        });
    })
    .post('/Query', function(req, res){
      var client = mysql.connect();
      mysql.update_Deal_Unread(client, req.session.userAccount, function(error){
        if(error) {
            throw error;
        }
        return res.send('0');
      });
    });

router.post('/RemovalQuery', function(req,res)
    {
      console.log(req.body.SLID, typeof(req.body.SLID));
        var client = mysql.connect();
        mysql.select_SmartLock_Deletable(client, req.body.SLID, function(result){
          console.log("RemovalQuery result\n", result);
          return res.send(result);
        });
    });

router.post('/Removal', function(req,res)
    {
        var client = mysql.connect();
        mysql.delete_SmartLock_by_SLID(client, req.body.SLID, function(error){
            console.log("delete_SmartLock_by_SLID");
            if(error){
                throw error;
            }
            return res.send('0');
        });
    });
router.get('/BindLock', function(req, res)
{
    if(req.session.userAccount == undefined){
        return res.redirect('/');
    }
    res.render('BindLock', req);
})
    .post('/BindLock', function(req,res)
    {
        var client = mysql.connect();
        console.log("req.body.isShown:",req.body.isShown);
        console.log("req.body.stname:", req.body.stname);
        if (req.body.stname != "" && req.body.stname != undefined) {
          req.body.stname += ' 12:00:00';
          req.body.etname += ' 12:00:00';
        } else {
          req.body.stname = null;
          req.body.etname = null;
        }
        mysql.insert_SmartLock(
            client,
            req.body.SLIDname,
            req.body.ownername,
            req.body.ownername,
            req.body.stname,
            req.body.etname,
            req.body.pricename,
            0, // state
            req.body.nickname,
            (req.body.isShown == "hide"? false : true),
            function(error)
            {
                if(error) {
                    throw error;
                    res.redirect('/BindLock');
                }
                return res.redirect('/MyLock');
            });
    });

router.get('/Store', function(req, res)
{
    if(req.session.userAccount == undefined){
        return res.redirect('/');
    }
    var client = mysql.connect();
    mysql.select_SmartLock_Store(client, function (result){
        req.StoreLocks = result;
        mysql.select_Info_BuyerView(client, function (result){
            // SLID in result is null ???
            // LEFT JOIN 不行 RIGHT JOIN 却可以？？？
            var st = {}, et = {};
            for (var i = req.StoreLocks.length - 1; i >= 0; i--) {
                if (!(st[req.StoreLocks[i].SLID] instanceof Object)) {
                    st[req.StoreLocks[i].SLID] = new Array;
                    et[req.StoreLocks[i].SLID] = new Array;
                }
            }
            var modified = false;
            for (var i = result.length - 1; i >= 0; i--) {
                if (result[i].isFinished == null) {
                    st[result[i].SLID] = undefined;
                    et[result[i].SLID] = undefined;
                } else if(result[i].isFinished == false){
                    st[result[i].SLID].push(result[i].check_in_time);
                    et[result[i].SLID].push(result[i].check_out_time);
                    var now = new Date();
                    var citime = new Date(result[i].check_in_time);
                    var cotime = new Date(result[i].check_out_time);
                    if (result[i].state == 0 && citime.getTime() <= now.getTime() && now.getTime() <= cotime.getTime() ) {
                        console.log("decide to update: "+result[i].SLID, result[i]);
                        mysql.update_SmartLock_Renting(client, result[i].SLID, req.session.userAccount, function(error){
                            // indicate that the msg sender is the new "current_user"
                            console.log("update_SmartLock_Renting");
                            if(error){
                                throw error;
                            }
                            modified = true;
                        });
                    }
                }
            }
            if (modified == true) {
                return res.redirect('/Store');
            }
            req.arrStartTime = st;
            req.arrEndTime = et;
            console.log("arrStartTime\n",st);
            console.log("arrEndTime\n",et);
            return res.render('Store', req);
        });
    });

})
    .post('/Store', function(req,res)
    {
        var client = mysql.connect();
        mysql.insert_Deal(
            client,
            req.body.DEALIDname,
            req.body.SLIDname,
            req.body.sellername,
            req.body.buyerDname,
            req.body.amountname,
            req.body.checkinname+' 12:00:00',
            req.body.checkoutname+' 12:00:00',
            function(error){
                if(error){
                    throw error;
                }
                //there should be unlock_code in a specific deal
                return res.redirect('/MyLock');
            }
        );
    });

router.get('/MyLock', function(req, res)
{
    if(req.session.userAccount == undefined){
        return res.redirect('/');
    }
    var client = mysql.connect();
    console.log("userAccount in get/MyLock:", req.session.userAccount);

    mysql.select_Info_BoughtLockView(client, req.session.userAccount, function(result){
        var modified = false;
        // 将时间改成当前或以后,当前的则更新,以后的则传到前端
        req.session.MyLockInfo = result
        for (var i = result.length - 1; i >= 0; i--) {
            mysql.update_SmartLock_Renting(client, result[i].SLID, req.session.userAccount, function(error){
                if(error){
                    throw error;
                }
                modified = true;
            });
        }
        if (modified == true) {
            return res.redirect('/MyLock');
        } else {
            mysql.select_SmartLock_by_Owner(client, req.session.userAccount, function(result){
                req.Ownerlock = result; // we do not care about the exact check-in and check-out time but the current state
                console.log("Ownerlock:\n", result);
                mysql.select_SmartLock_by_CurrentUser(client, req.session.userAccount, function(result){
                    req.Userlock = result;
                    console.log("Userlock:\n", result);

                    mysql.select_Info_MyLockFutureView(client, req.session.userAccount, function(result){
                        var temp = {};
                        for (var i = 0; i < result.length; i++) {
                          temp[result[i].SLID] = result[i].last_check_out_time;
                        }
                        console.log("mapping result", temp);
                        res.locals = {
                            userAccount:req.session.userAccount,
                            LastDeal: temp
                        };
                        console.log("FutureDeal", res.locals.LastDeal);
                        mysql.select_Info_BoughtLockFutureView(client, req.session.userAccount, function(result){
                          console.log("Futurelock",result);
                          req.Futurelock = result;
                          return res.render('MyLock',req);
                        });
                    });
                });
            });
        }
    });
})
    .post('/MyLock', function(req,res)
    {
      console.log("req.body", req.body);
      // console.log("res", res);
        var client = mysql.connect();
        if (req.body.hidden_state == 2) {
            mysql.update_SmartLock_Refresh(
                client,
                req.body.SLIDname,
                req.session.userAccount,
                req.body.etname,
                function(error){
                    if(error) {
                        throw error;
                    }
                    return res.redirect('/MyLock');
                });
        } else if (req.body.hidden_state == 3) {
          mysql.update_SmartLock_showStore(
              client,
              req.body.SLIDname,
              req.body.stname,
              req.body.etname,
              function(error){
                  if (error) {
                      throw error;
                  }
                  return res.send(req.body.SLIDname);
              });
        } else if (req.body.hidden_state == 4) {
          mysql.update_SmartLock_hideStore(
              client,
              req.body.SLIDname,
              req.body.stname == "" ? "null" : '"' + req.body.stname + ' 12:00:00"',
              req.body.etname == "" ? "null" : '"' + req.body.etname + ' 12:00:00"',
              function(error){
                  if (error) {
                      throw error;
                  }
                  // res.redirect('/MyLock');
                  return res.send("Discontinue Successfully");
              });
        }
    });

module.exports = router;
