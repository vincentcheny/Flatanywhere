function dateFormat(time, addDay) {
  if (addDay == undefined) {
    addDay = 0;
  }
  time = new Date(time);
  time = new Date(time.getTime() + 24 * 60 * 60 * 1000 * addDay);
  //格式化日，如果小于9，前面补0
  var day = ("0" + time.getDate()).slice(-2);
  //格式化月，如果小于9，前面补0
  var month = ("0" + (time.getMonth() + 1)).slice(-2);
  //拼装完整日期格式
  var date = time.getFullYear() + "-" + month + "-" + day;
  return date;
}

function bind() {
  
  if ($("#serialnumid")[0].value == "") {
    alert("Serial number is empty!");
    return;
  }
  var st = 0;
  var et = 0;
  if ($('input[type="checkbox"]')[0].checked == true) {
    // choose public mode
    if ($("#priceid").val() <= 0) {
      alert("Price should be a positive number!");
      return;
    }
    if ($("#resultAddr")[0].value == "") {
      alert(
        "Address is empty! Please move the red pointer in the map to the location of lock."
      );
      return;
    }
    var inputBox = {
      "#stid": "Start time",
      "#etid": "End time",
      "#addrnameid": "Address"
    };
    for (var id in inputBox) {
      if (!inputBox.hasOwnProperty(id) || $(id).val() == "") {
        alert(inputBox[id] + " is empty. Please fill it in before binding.");
        return;
      }
    }
    st = new Date($("#stid").val());
    st = parseInt(st.getTime() / 1000) + 4 * 60 * 60; //默认位于+8时区，+4 hours 统一控制为中午12点整
    et = new Date($("#etid").val());
    et = parseInt(et.getTime() / 1000) + 4 * 60 * 60;
    if (st >= et) {
      alert("Check-out date should be greater than check-in date!");
      return;
    }

    $("#stid").val(
      new Date($("#stid").val()).toLocaleDateString().replace(/\//g, "-")
    );
    $("#etid").val(
      new Date($("#etid").val()).toLocaleDateString().replace(/\//g, "-")
    );
  }
  var serialNum = $("#serialnumid")[0].value;
  var now = new Date().getTime();
  var price = parseInt($("#priceid").val() * 100); // keep two decimal places 精确到0.01ETH
  console.log("price", price);
  
  $("#submitRow").html("");
  $("#submitRow").append(
    '<div class="progress"><div class="indeterminate"></div></div>'
  ); // 无限读取进度条
  var event = Flatanywhere.NewSmartLock({
    filter: {
      owner: sessionStorage.userAccount
    }
  });
  console.log(serialNum, price, st, et, now);
  Flatanywhere.CreateSmartLock.sendTransaction(serialNum,price,st,et,now,
    {
      from: sessionStorage.userAccount
    },
    function(error, res) {
      if (!error) {
        event.watch(function(error, result) {
          event.stopWatching();
          console.log("SLID", result.args.SLID);
          $("#self0").val(sessionStorage.userAccount);
          $("#SLIDid").val(result.args.SLID);
          setTimeout(function() {
            $("form")[0].submit();
          }, 3000);
        });
      } else {
        location.reload();
      }
    }
  );
}

function pressEnter(e) {
  if (!e) e = window.event; //火狐中是 window.event
  if ((e.keyCode || e.which) == 13) {
    bind();
  }
}

function checkboxOnclick(checkbox) {
  if (checkbox.checked == true) {
    checkbox.value = "show";
    $("#dateRow").removeClass("hide");
    $("#infoDiv").removeClass("hide");
    $("#nicknameDiv").removeClass("m12");
    $("#nicknameDiv").addClass("m6");
  } else {
    checkbox.value = "hide";
    $("#dateRow").addClass("hide");
    $("#infoDiv").addClass("hide");
    $("#stid, #etid, #priceid, #introid").val("");
    $("#nicknameDiv").removeClass("m6");
    $("#nicknameDiv").addClass("m12");
  }
}

function end30days() {
  if ($("#stid").val() == "") {
    $("#stid").val(new Date().toLocaleDateString().replace(/\//g, "-"));
  } else {
    $("#stid").val(
      new Date($("#stid").val()).toLocaleDateString().replace(/\//g, "-")
    );
  }
  $("#etid").val(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 30)
      .toLocaleDateString()
      .replace(/\//g, "-")
  );
}

function LongQuery() {
  $.ajax({
    type: "GET", //方法类型
    dataType: "json", //预期服务器返回的数据类型
    url: "/Query", //url
    timeout: 10000,
    success: function(result) {
      // console.log(result);//打印服务端返回的数据(调试用)
      if (result[0].count > sessionStorage.newDealCount) {
        Materialize.toast(
          "You receive " +
            (result[0].count - sessionStorage.newDealCount) +
            " new deals!",
          5000
        );
        sessionStorage.newDealCount = result[0].count;
        $("#mylock").html(
          "MyLock " + '<span class="new badge">' + result[0].count + "</span>"
        );
      } else if (sessionStorage.newDealCount > 0) {
        $("#mylock").html(
          "MyLock " + '<span class="new badge">' + result[0].count + "</span>"
        );
      }
      setTimeout("LongQuery()", 3000);
      return;
    },
    error: function() {
      console.log("Error in AJAX GET");
    }
  });
}

$(document).ready(function() {
  setTimeout(function() {
    if ($("#balanceid").html() == "") {
      web3.eth.getBalance(web3.eth.accounts[0], function(err, res) {
        if (!err) {
          $("#balanceid").html(res.c[0] / 10000);
        }
      });
    }
  }, 500);
  sessionStorage.newDealCount = 0;
  $("#userAccount").val(sessionStorage.userAccount);
  $(".dropdown-button").dropdown();
  $(".button-collapse").sideNav();
  $(".datepicker").pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 4 // Creates a dropdown of 15 years to control year
  });
  LongQuery();
});
