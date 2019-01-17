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
        if (req.body.stname != "") {
          req.body.stname += ' 12:00:00';
          console.log(req.body.stname);
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
            (req.body.isShown == "show"? true : false),
            function(error)
            {
                if(error) {
                    throw error;
                }
                res.redirect('/MyLock');
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
                        mysql.update_SmartLock_Renting(client, result[i].SLID, req.session.userAccount, 1, function(error){
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
                res.redirect('/Store');
            }
            req.arrStartTime = st;
            req.arrEndTime = et;
            console.log("arrStartTime\n",st);
            console.log("arrEndTime\n",et);
            res.render('Store', req);
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
                res.redirect('/Store');
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

    mysql.select_Info_MyLockView(client, req.session.userAccount, function(result){
        var modified = false;
        for (var i = result.length - 1; i >= 0; i--) {
            mysql.update_SmartLock_Renting(client, result[i].SLID, req.session.userAccount, 1, function(error){
                if(error){
                    throw error;
                }
                modified = true;
            });
        }
        // for (var i = result.length - 1; i >= 0; i--) {
        //     if (result[i].isFinished == null || result[i].isFinished == true) {
        //         // no deals or no future deals
        //         continue;
        //     } else {
        //         var now = new Date();
        //         var citime = new Date(result[i].check_in_time);
        //         var cotime = new Date(result[i].check_out_time);
        //         // check each apartment whether it should be available now
        //         if (result[i].state == 0 && citime.getTime() <= now.getTime() && now.getTime() <= cotime.getTime()) {
        //             mysql.update_SmartLock_Renting(client, result[i].SLID, req.session.userAccount, 1, function(error){
        //                 if(error){
        //                     throw error;
        //                 }
        //                 console.log("A flat is newly available for you with SLID: "+result[i].SLID);
        //                 modified = true;
        //             });
        //         }
        //     }
        // }
        if (modified == true) {
            return res.redirect('/MyLock');
        } else {
            mysql.select_SmartLock_by_Owner(client, req.session.userAccount, function(result){
                req.Ownerlock = result; // we do not care about the exact check-in and check-out time but the current state
                console.log("Ownerlock:\n", result);
                mysql.select_SmartLock_by_CurrentUser(client, req.session.userAccount, function(result){
                    req.Userlock = result;
                    console.log("Userlock:\n", result);
                    res.locals = {
                        userAccount:req.session.userAccount
                    };
                    res.render('MyLock',req);
                });
            });
        }
    });
})
    .post('/MyLock', function(req,res)
    {
        var client = mysql.connect();
        if (req.body.hidden_state == 2) {
            mysql.update_SmartLock_Refresh(
                client,
                req.body.SLIDname,
                req.session.userAccount,
                req.body.etname,
                0,
                function(error){
                    if(error) {
                        throw error;
                    }
                    res.redirect('/MyLock');
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
                    res.redirect('/MyLock');
                });
        } else if (req.body.hidden_state == 4) {
            mysql.update_SmartLock_hideStore(
                client,
                req.body.SLIDname,
                function(error){
                    if (error) {
                        throw error;
                    }
                    res.redirect('/MyLock');
                });
        }
    });

module.exports = router;
