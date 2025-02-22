var express = require("express");
var mysql = require("../dao/dbConnect.js");
var client = mysql.connect();
var router = express.Router();
var http = require("http").Server(express);
var io = require("socket.io")(http);

/*GET the user account !*/
// router.get('/',function (req,res){
//     res.redirect('/home');
// });

// Define/initialize our global vars
var notes = []; // also called events
var isInitNotes = false;
var socketCount = 0;

io.sockets.on("connection", function(socket) {
  // Socket has connected, increase socket count
  socketCount++;
  // Let all sockets know how many are connected
  io.sockets.emit("users connected", socketCount);

  socket.on("disconnect", function() {
    // Decrease the socket count on a disconnect, emit
    socketCount--;
    io.sockets.emit("users connected", socketCount);
  });

  socket.on("new note", function(data) {
    // New note added, push to all sockets and insert into db
    notes.push(data);
    io.sockets.emit("new note", data);
    // Use node's db injection format to filter incoming data
    mysql.query(
      "INSERT INTO SmartLock VALUES (?,?,?,?,?,?,?,?,?,?)",
      data.a,
      data.b,
      data.c,
      data.d,
      data.e,
      data.f,
      data.g,
      data.h,
      data.i,
      data.j
    );
  });

  // Check to see if initial query/notes are set
  if (!isInitNotes) {
    // Initial app start, run db query
    mysql
      .query("SELECT * FROM SmartLock")
      .on("result", function(data) {
        // Push results onto the notes array
        notes.push(data);
      })
      .on("end", function() {
        // Only emit notes after query has been completed
        socket.emit("initial notes", notes);
      });

    isInitNotes = true;
  } else {
    // Initial notes already exist, send out
    socket.emit("initial notes", notes);
  }
});

/* GET home page. */
router
  .get("/", function(req, res) {
    res.render("Home", req);
  })
  .post("/", function(req, res) {
    req.session.userAccount = req.body.userAccount;
    if (req.body.hidden_state == 0) {
      res.redirect("/BindLock");
    } else if (req.body.hidden_state == 1) {
      res.redirect("/MyLock");
    } else if (req.body.hidden_state == 2) {
      res.redirect("/Store");
    }
  });

router
  .get("/Account", function(req, res) {
    res.render("Account", req);
  });

router
  .get("/Query", function(req, res) {
    // var client = mysql.connect();
    mysql.select_Deal_Unread(client, req.session.userAccount, function(result) {
      return res.send(result);
    });
  })
  .post("/Query", function(req, res) {
    // var client = mysql.connect();
    mysql.update_Deal_Unread(client, req.session.userAccount, function(error) {
      if (error) {
        throw error;
      }
      return res.send("0");
    });
  });

router.post("/RemovalQuery", function(req, res) {
  // var client = mysql.connect();
  mysql.select_SmartLock_Deletable(client, req.body.SLID, function(result) {
    console.log("RemovalQuery result\n", result);
    return res.send(result);
  });
});

router.post("/Removal", function(req, res) {
  // var client = mysql.connect();
  mysql.delete_SmartLock_by_SLID(client, req.body.SLID, function(error) {
    console.log("delete_SmartLock_by_SLID");
    if (error) {
      throw error;
    }
    return res.send("0");
  });
});

router.post("/Withdraw", function(req, res) {
  // var client = mysql.connect();
  mysql.update_Deal_Withdraw(client, req.body.DEALID, function(error) {
    console.log("update_Deal_Withdraw");
    if (error) {
      throw error;
    }
    return res.send("0");
  });
});

router.post("/CheckIn", function(req, res) {
  // var client = mysql.connect();
  mysql.update_Info_Renting(
    client,
    req.body.SLID,
    req.body.DEALID,
    req.session.userAccount,
    function(error) {
      console.log("update_Info_Renting");
      if (error) {
        throw error;
      }
      console.log("num in POST checkin", req.body.num);
      return res.send(req.body.num);
    }
  );
});

router
  .get("/BindLock", function(req, res) {
    if (req.session.userAccount == undefined) {
      return res.redirect("/");
    }
    res.render("BindLock", req);
  })
  .post("/BindLock", function(req, res) {
    // var client = mysql.connect();
    // console.log(
    //   "req.body.isShown:",
    //   req.body.isShown,
    //   req.body.isShown == "hide"
    // );
    // console.log("req.body.stname:", req.body.stname);
    // console.log("req.body", req.body);
    // console.log("info:", req.body.introname);
    // console.log("SLID:", req.body.SLIDname);
    var price = req.body.pricename;
    if (price == "" || price == undefined) {
      price = 0;
    }
    if (req.body.stname != "" && req.body.stname != undefined) {
      req.body.stname += " 12:00:00";
      req.body.etname += " 12:00:00";
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
      price,
      req.body.nickname,
      req.body.addrname,
      req.body.introname,
      req.body.isShown == "show" ? true : false,
      function(error) {
        if (error) {
          throw error;
          res.redirect("/BindLock");
        }
        return res.redirect("/");
      }
    );
  });

router
  .get("/Store", function(req, res) {
    if (req.session.userAccount == undefined) {
      return res.redirect("/");
    }
    // var client = mysql.connect();
    mysql.select_SmartLock_Store(client, function(result) {
      req.StoreLocks = result;
      console.log("intro:\n", result.intro);

      mysql.select_Info_BuyerView(client, function(result) {
        // SLID in result is null ???
        // LEFT JOIN 不行 RIGHT JOIN 却可以？？？
        var st = {},
          et = {};
        for (var i = req.StoreLocks.length - 1; i >= 0; i--) {
          if (!(st[req.StoreLocks[i].SLID] instanceof Object)) {
            st[req.StoreLocks[i].SLID] = new Array();
            et[req.StoreLocks[i].SLID] = new Array();
          }
        }
        var now = new Date().getTime();
        for (var i = result.length - 1; i >= 0; i--) {
          if (new Date(result[i].check_out_time).getTime() >= now) {
            st[result[i].SLID].push(result[i].check_in_time);
            et[result[i].SLID].push(result[i].check_out_time);
          }
        }
        req.arrStartTime = st;
        req.arrEndTime = et;
        console.log("arrStartTime\n", st);
        console.log("arrEndTime\n", et);
        return res.render("Store", req);
      });
    });
  })
  .post("/Store", function(req, res) {
    // var client = mysql.connect();
    console.log("req.body", req.body);
    mysql.insert_Deal(
      client,
      req.body.DEALIDname,
      req.body.SLIDname,
      req.body.sellername,
      req.body.buyerDname,
      req.body.amountname,
      req.body.checkinname + " 12:00:00",
      req.body.checkoutname + " 12:00:00",
      function(error) {
        if (error) {
          throw error;
        }
        return res.redirect("/MyLock");
      }
    );
  });

router
  .get("/MyLock", function(req, res) {
    if (req.session.userAccount == undefined) {
      return res.redirect("/");
    }
    // var client = mysql.connect();
    console.log(
      "userAccount in get/MyLock:",
      req.session.userAccount == "",
      req.session.userAccount
    );
    mysql.select_Info_SoldLockView(client, req.session.userAccount, function(
      result
    ) {
      console.log("WithdrawableDeal:", result);
      req.WithdrawableDeal = result;
      mysql.select_SmartLock_by_Owner(client, req.session.userAccount, function(
        result
      ) {
        req.Ownerlock = result; // we do not care about the exact check-in and check-out time but the current state
        console.log("Ownerlock:\n", result);
        mysql.select_SmartLock_by_CurrentUser(
          client,
          req.session.userAccount,
          function(result) {
            req.Userlock = result;
            console.log("Userlock:\n", result);
            mysql.select_Info_MyLockFutureView(
              client,
              req.session.userAccount,
              function(result) {
                var temp = {};
                for (var i = 0; i < result.length; i++) {
                  temp[result[i].SLID] = result[i].last_check_out_time;
                }
                console.log("mapping result", temp);
                res.locals = {
                  userAccount: req.session.userAccount,
                  LastDeal: temp
                };
                console.log("FutureDeal", res.locals.LastDeal);
                mysql.select_Info_BoughtLockFutureView(
                  client,
                  req.session.userAccount,
                  function(result) {
                    console.log("Futurelock", result);
                    req.Futurelock = result;
                    return res.render("MyLock", req);
                  }
                );
              }
            );
          }
        );
      });
    });
  })
  .post("/MyLock", function(req, res) {
    console.log("req.body", req.body);
    // var client = mysql.connect();
    if (req.body.hidden_state == 3) {
      mysql.update_SmartLock_showStore(
        client,
        req.body.stname,
        req.body.etname,
        req.body.SLIDname,
        req.body.addressname,
        req.body.pricename,
        req.body.introname,
        function(error) {
          if (error) {
            throw error;
          }
          return res.send(req.body.SLIDname);
        }
      );
    } else if (req.body.hidden_state == 4) {
      mysql.update_SmartLock_hideStore(client, req.body.SLIDname, function(
        error
      ) {
        if (error) {
          throw error;
        }
        return res.send("Discontinue Successfully");
      });
    }
  });

module.exports = router;
