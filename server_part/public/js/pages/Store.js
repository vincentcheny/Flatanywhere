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
  var date = time.getFullYear() + "-" + (month) + "-" + (day);
  return date;
}


function Order(num) {
  var result = checkDate(num);
  if (result == undefined) {
    return;
  } else if (result == false) {
    alert("Sorry, the selected time slot is not available.");
    return;
  }
  var cidate = new Date($('#checkinid').val()).getTime() + 4 * 60 * 60 * 1000;
  var codate = new Date($('#checkoutid').val()).getTime() + 4 * 60 * 60 * 1000;
  var day_diff = (codate - cidate) / (24 * 60 * 60 * 1000); // from millisecond to day
  var amount = day_diff * $('#priceid' + num).html().substring(0, $('#priceid' + num).html().length - 4);
  if (amount <= 0) {
    alert("The price is abnormal.");
    return;
  }
  $('#checkinid').val(dateFormat(cidate));
  $('#checkoutid').val(dateFormat(codate));
  var SLID = $("#SLIDid" + num).val();
  var owner = $("#ownerid" + num).val();
  var cisecond = parseInt(cidate / 1000);
  var cosecond = parseInt(codate / 1000);
  console.log(amount, SLID, owner, cisecond, cosecond);
  var newDeal = Flatanywhere.NewDeal({
    filter: {
      SLID: SLID
    }
  });
  Flatanywhere.CreateDeal.sendTransaction(
    SLID,
    owner,
    cisecond,
    cosecond, {
      from: sessionStorage.userAccount,
      gasLimit: "1000000000000",
      value: amount * 1000000000000000000
    }, //1ETH = 10^18wei
    function(err, result) {
      if (!err) {
        newDeal.watch(function(error, result) {
          if (!error) {
            newDeal.stopWatching();
            console.log("Create Deal Successfully!");
            setTimeout(function() {
              $('#DEALID').val(result.args.DEALID);
              $('#SLIDid').val(SLID);
              $('#sellerid').val(owner);
              $('#buyerid').val(sessionStorage.userAccount);
              $('#amountid').val(amount);
              $('form').submit();
            }, 3000);
          } else {
            console.error(err);
          }
        });
      } else {
        console.error(err);
      }
    });
}

function checkDate(num) {
  if ($('#checkinid').val() == "") {
    alert("Please fill in check-in date!");
    return;
  } else if ($('#checkoutid').val() == "") {
    alert("Please fill in check-out date!");
    return;
  }
  var cidate = new Date($('#checkinid').val()).getTime() + 12 * 60 * 60 * 1000;
  var codate = new Date($('#checkoutid').val()).getTime() + 12 * 60 * 60 * 1000;
  if (cidate >= codate) {
    alert("Check-out date should be greater than check-in date!");
    return;
  }
  var startdate = new Date($('.st' + num)[0].innerHTML).getTime();
  var enddate = new Date($('.et' + num)[0].innerHTML).getTime();
  if (codate > enddate || cidate < startdate) {
    console.log(cidate, codate, startdate, enddate);
    return false;
  }
  for (var i = 0; i < $('.in' + num).length; i++) {
    var s = new Date($('.in' + num)[i].innerHTML).getTime();
    var e = new Date($('.out' + num)[i].innerHTML).getTime();
    if (!((cidate < s) && (codate <= s) || (cidate >= e) && (codate > e))) {
      console.log(new Date(cidate), new Date(codate), s, e, (cidate < s) && (codate <= s), (cidate >= e) && (codate > e));
      return false;
    }
  }
  return true;
}

function search() {
  for (var i = 0; i < $('.lock').length; i++) {
    var result = checkDate(i);
    if (result == undefined) {
      return;
    } else if (result == true) {
      $("#lockid" + i).removeClass("hide");
    } else if (result == false) {
      $("#lockid" + i).addClass("hide");
    }
  }
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
        Materialize.toast("You receive " + (result[0].count - sessionStorage.newDealCount) + " new deals!", 5000);
        sessionStorage.newDealCount = result[0].count;
        $("#mylock").html('MyLock ' + '<span class="new badge">' + result[0].count + '</span>');
      } else if (sessionStorage.newDealCount > 0) {
        $("#mylock").html('MyLock ' + '<span class="new badge">' + result[0].count + '</span>');
      }
      setTimeout("LongQuery()", 1000);
      return;
    },
    error: function() {
      console.log("Error in AJAX GET");
    }
  });
}

$(document).ready(function() {
  $('#userAccount').val(sessionStorage.userAccount);
  $(".button-collapse").sideNav();
  $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 4 // Creates a dropdown of 15 years to control year
  });
  sessionStorage.newDealCount = 0;
  LongQuery();
});
