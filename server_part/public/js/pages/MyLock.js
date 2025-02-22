function addLock(type, nickname, num, price, SLID, address, isShown, st, et) {
  var resource = {
    icon: [
      "images/lock_unleased.svg",
      "images/lock_rented.svg",
      "images/lock_renting.svg",
      "images/lock_future.svg"
    ],
    classType: ["unleasedDiv", "rentedDiv", "rentingDiv", "futureDiv"]
  };

  var $card_image = $("<div><img><span></span></div>");
  $card_image
    .filter("div")
    .eq(0)
    .attr({
      class: "card-image waves-effect waves-block waves-light",
      style: "border-radius: 20px"
    });
  $card_image.children("img").attr({
    id: "pic" + num,
    class: "activator",
    src: resource.icon[type]
  });

  var $card_content = $(
    '<div><span><p></p><a><i></i></a></span><div class="card-action"><p><span></span><span></span></p></div></div>'
    //lock_open
  );

  $card_content
    .filter("div")
    .eq(0)
    .attr({
      class: "card-content"
    });
  $card_content
    .find("span")
    .eq(0)
    .attr({
      class: "card-title  grey-text text-darken-4 truncate"
    });
  $card_content
    .find("p")
    .eq(0)
    .attr({
      style: "display: inline",
      readonly: "readonly"
    })
    .html(nickname);
  if (type != 3) {
    $card_content
      .find("a")
      .eq(0)
      .attr({
        class: "btn-floating halfway-fab waves-effect waves-light grey right",
        onclick: 'Unlock("' + SLID + '", 0)',
        href: "javascript:void(0)"
      });
    $card_content
      .find("i")
      .eq(0)
      .html("lock_open")
      .attr({
        class: "material-icons hoverable"
      });
  }

  $card_content
    .find("span")
    .eq(1)
    .attr({
      id: "priceid" + num,
      readonly: "readonly"
    })
    .html(
      type < 3 ? price + " ETH" : new Date(arguments[6]).toLocaleDateString()
    );
  if (screen.width > 375) {
    $card_content
      .find("span")
      .eq(1)
      .attr({
        class: "left"
      })
      .end()
      .eq(2)
      .attr({
        class: "right"
      });
  } else {
    $card_content
      .find("span")
      .eq(1)
      .attr({
        style: "display:block"
      })
      .end()
      .eq(2)
      .attr({
        style: "display:block"
      });
  }
  if (
    type < 2 &&
    isShown == true &&
    new Date().getTime() < new Date(et).getTime()
  ) {
    $card_content
      .find("span")
      .eq(2)
      .html("On Sale");
  } else if (type < 2 && new Date().getTime() > new Date(et).getTime()) {
    $card_content
      .find("span")
      .eq(2)
      .css("color", "red")
      .html("Expired");
  }

  var $card_reveal;
  if (type == 0 || type == 1) {
    // own
    $card_reveal = $(
      "<div><span></span><p></p><hr/><a></a><a></a><a></a></div>"
    );
    $card_reveal
      .find("a")
      .eq(0)
      .attr({
        onclick:`toggleStore('${SLID}','${isShown}','${st}','${et}','${num}','${address}')`,
        class: "dropdown-item hoverable center-align"
      })
      .html(isShown == true ? "Remove" : "Publish")
      .end()
      .eq(2)
      .attr({
        onclick: "deleteLock('" + SLID + "', " + num + ")",
        class: "dropdown-item hoverable center-align"
        // 'style': 'background-color: red; color: white;'
      })
      .hover(
        function() {
          $card_reveal
            .find("a")
            .eq(2)
            .css("background-color", "red");
          $card_reveal
            .find("a")
            .eq(2)
            .css("color", "white");
        },
        function() {
          $card_reveal
            .find("a")
            .eq(2)
            .css("background-color", "rgba(0,0,0,0)");
          $card_reveal
            .find("a")
            .eq(2)
            .css("color", "black");
        }
      )
      .html("DELETE");
  } else {
    // renting or booked
    $card_reveal = $("<div><span></span><p></p><a></a></div>");
  }
  if (type == 0 || type == 2) {
    // able to control
    var idx = parseInt((2 - type) / 2);
    $card_reveal
      .find("a")
      .eq(idx)
      .attr({
        onclick: 'Unlock("' + SLID + '", 1)',
        class: "dropdown-item hoverable center-align"
      })
      .html("QR-code Unlock");
  } else if (type == 3) {
    $card_reveal
      .find("a")
      .eq(0)
      .attr({
        id: "opBtn" + num,
        onclick:
          "CheckIn(" +
          num +
          ',"' +
          SLID +
          '","' +
          arguments[6] +
          '","' +
          arguments[7] +
          '")', // [6]:checkintime [7]:DEALID
        class: "dropdown-item hoverable center-align"
      })
      .html("Check In");
  }
  $card_reveal
    .filter("div")
    .eq(0)
    .attr({
      class: "card-reveal ",
      id: "reveal" + num
    });
  $card_reveal
    .find("span")
    .eq(0)
    .attr({
      class: "card-title activator grey-text text-darken-4"
    })
    .html(
      nickname +
        "<i class='material-icons right' id='close" +
        num +
        "'>close</i>"
    );
  $card_reveal
    .find("p")
    .eq(0)
    .html(address);

  var $newLockCard = $('<div><div class="card hoverable"></div></div>');
  $newLockCard
    .filter("div")
    .eq(0)
    .attr({
      id: "lock" + num,
      class: "col s6 m4 l3 lock-item " + resource.classType[type]
    });
  $newLockCard
    .children("div")
    .append($card_image)
    .append($card_content)
    .append($card_reveal);
  $("#lock-list").append($newLockCard);
}

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

function toggleStore(SLID, isOnStore, st, et, num, address) {
  // publish or discontinue from store
  $("#SLIDid_store").val(SLID);
  console.log("isOnStore", isOnStore);
  if (isOnStore == false) {
    // Currently not in store and want to publish
    $("#addressid")[0].value = address;
    Materialize.updateTextFields();
    $("#publishBtn").attr({onclick: `newDateSubmit(${num},'${SLID}')`});
    $('#modal1').modal('open');
  } else {
    // Currently in store and want to discontinue
    if (st == "") {
      alert("Error: Try to hide(Already in store) but start_time undefined!");
    } else {
      // 不能早于当前最后的一个 deal 的 check_out_time
      if (JSON.parse(sessionStorage.getItem(SLID)) == null) {
        // 没有待完成的 Deal
        $("#stid").val("");
        $("#etid").val("");
      } else {
        // 有待完成的 Deal
        $("#stid").val(dateFormat(new Date()));
        $("#etid").val(dateFormat(JSON.parse(sessionStorage.getItem(SLID))));
      }
      $("#hsid_store").val(4);
      sendAJAX("text", num, false, SLID, st, et, address);
    }
  }
}

function sendAJAX(datatype, num, isPublish, SLID, st, et, address) {
  if (!isPublish) {
    $.ajax({
      type: "POST", //方法类型
      dataType: datatype, //预期服务器返回的数据类型
      async: false,
      data: $("form").serialize(),
      success: function(result) {
        console.log(result);
        var currentState = isPublish ? "Publish" : "Remove";
        var newState = isPublish ? "Remove" : "Publish";
        Materialize.toast(currentState + " Successfully!", 4000);
        $("#reveal" + num)
          .find("a")
          .eq(0)
          .attr({
            onclick:`toggleStore('${SLID}',${isPublish},'${st}','${et}','${num}','${address}')`
          });
        $("#reveal" + num)
          .find("a")
          .eq(0)
          .html(newState);
        $("#priceid" + num).html($("#priceid").val() + " ETH");
        $("#close" + num).click();
        $("#stid").val("");
        $("#etid").val("");
      },
      error: function() {
        alert("Error in AJAX!");
      }
    });
    return;
  }
  // toggleStore() and update server DB
  st = new Date(st);
  st = parseInt(st.getTime() / 1000) + 4 * 60 * 60;
  et = new Date(et);
  et = parseInt(et.getTime() / 1000) + 4 * 60 * 60;
  var event = Flatanywhere.UpdateLock({
    filter: {
      SLID: SLID
    }
  });
  Flatanywhere.UpdateSmartLock.sendTransaction(SLID, $("#priceid").val(), st, et, 
    {
      from: sessionStorage.userAccount
    },
    function(error, res) {
      if (!error) {
        event.watch(function(error, result) {
          event.stopWatching();
          if(result.args.success) {
            $.ajax({
              type: "POST", //方法类型
              dataType: datatype, //预期服务器返回的数据类型
              async: false,
              data: $("form").serialize(),
              success: function(result) {
                console.log(result);
                var currentState = isPublish ? "Publish" : "Remove";
                var newState = isPublish ? "Remove" : "Publish";
                Materialize.toast(currentState + " Successfully!", 4000);
                $("#reveal" + num)
                  .find("a")
                  .eq(0)
                  .attr({
                    onclick:`toggleStore('${SLID}',${isPublish},'${st}','${et}','${num}','${address}')`
                  });
                $("#reveal" + num)
                  .find("a")
                  .eq(0)
                  .html(newState);
                $("#priceid" + num).html($("#priceid").val() + " ETH");
                $("#close" + num).click();
                $("#stid").val("");
                $("#etid").val("");
              },
              error: function() {
                alert("Error in AJAX!");
              }
            });
          }
        })
      }
    }
  );
}

function deleteLock(SLID, num) {
  var event = Flatanywhere.DeleteLock({
    filter: {
      SLID: SLID
    }
  });
  $.ajax({
    type: "POST", //方法类型
    dataType: "JSON", //预期服务器返回的数据类型
    url: "/RemovalQuery", //url
    async: false,
    data: {
      SLID: SLID
    },
    success: function(result) {
      console.log(result[0].numOfDeletable);
      if (result[0].numOfDeletable > 0) {
        Materialize.toast(
          SLID.substring(0, 7) + "... is being booked. Cannot delete now.",
          5000
        );
      } else if (result[0].numOfDeletable == undefined) {
        alert("There is an error when trying to delete it.");
      } else {
        Flatanywhere.DeleteSmartLock.sendTransaction(
          SLID,
          sessionStorage.userAccount,
          {
            from: sessionStorage.userAccount
          },
          function(err, result) {
            if (!err) {
              event.watch(function(error, result) {
                event.stopWatching();
                console.log(
                  "result",
                  result.args.success,
                  result.args.success == true
                );
                $.ajax({
                  type: "POST", //方法类型
                  dataType: "text", //预期服务器返回的数据类型
                  url: "/Removal", //url
                  async: false,
                  data: {
                    SLID: SLID
                  },
                  success: function(result) {
                    if (result != "0") {
                      console.log("Abnormal ajax POST response:", result);
                    } else {
                      Materialize.toast(
                        "You delete " + SLID.substring(0, 7) + "...",
                        5000
                      );
                      $("#lock" + num).fadeOut(500);
                      setTimeout(function() {
                        $("#lock" + num).remove();
                      }, 500);
                    }
                  },
                  error: function() {
                    alert("Error in AJAX!");
                  }
                });
              });
            } else {
              console.error(err);
            }
          }
        );
      }
    },
    error: function() {
      alert("Error in AJAX!");
    }
  });
}

function cancelNewDateSubmit() {
  $("#stid").val("");
  $("#etid").val("");
  // $("#newDate").addClass("hide");
  // $(".lock-item, .activator").css({
  //   "pointer-events": "auto"
  // });
}

function resetNewDateSubmit(num, address, st, et, SLID) {
  $("#stid").val(dateFormat(st));
  $("#etid").val(dateFormat(et));
  $("#hsid_store").val(3);
  $(".lock-item, .activator").css({
    "pointer-events": "auto"
  });
  sendAJAX("text", num, true, SLID, st, et, address);
}

function newDateSubmit(num, SLID) {
  // publish and use the new available time
  var stdate = new Date($("#stid").val());
  var eddate = new Date($("#etid").val());
  var address = $("#addressid").val();
  var price = $("#priceid").val();
  if (stdate == "Invalid Date" || eddate == "Invalid Date") {
    alert("Lack of start date or end date!");
    return;
  } else if (stdate >= eddate) {
    alert("Start date should be greater than end date!");
    return;
  } else if (price == "") {
    alert("Empty price!");
    return;
  } else if (address == "") {
    alert("Empty address!");
    return;
  }
  $("#stid").val(dateFormat(stdate));
  $("#etid").val(dateFormat(eddate));
  $("#hsid_store").val(3);
  sendAJAX("text", num, true, SLID, stdate, eddate, address);
}

function CheckIn(num, SLID, checkintime, DEALID) {
  if (new Date() < new Date(checkintime)) {
    Materialize.toast("It is not the check-in time yet.", 5000);
  } else {
    console.log(SLID, DEALID, DEALID.length, SLID.length);
    console.log(sessionStorage.userAccount);
    var event = Flatanywhere.WithdrawableDeal({
      filter: {
        DEALID: DEALID
      }
    });
    Flatanywhere.CheckIn.sendTransaction(
      SLID,
      DEALID,
      {
        from: sessionStorage.userAccount
      },
      function(err, result) {
        if (!err) {
          event.watch(function(error, result) {
            event.stopWatching();
            console.log("See whether SLID can be passed", SLID);
            $.ajax({
              type: "POST", //方法类型
              dataType: "text", //预期服务器返回的数据类型
              url: "/CheckIn", //url
              data: {
                SLID: SLID,
                DEALID: DEALID,
                num: num
              },
              async: false,
              success: function(result) {
                Materialize.toast("Check-in Successfully", 5000);
                $("#pic" + result).attr({
                  src: "images/lock_renting.svg"
                });
                $("#lock" + result).removeClass("futureDiv");
                $("#lock" + result).addClass("rentingDiv");
                $("#lock" + result)
                  .find(".card-content a")
                  .eq(0)
                  .attr({
                    class:
                      "btn-floating halfway-fab waves-effect waves-light grey right",
                    onclick: 'Unlock("' + SLID + '", 0)',
                    href: "javascript:void(0)"
                  });
                $("#lock" + result)
                  .find(".card-content i")
                  .eq(0)
                  .html("lock_open")
                  .attr({ class: "material-icons hoverable" });
                $("#opBtn" + result).attr({
                  onclick: 'Unlock("' + SLID + '", 1)'
                });
                $("#opBtn" + result).html("Unlock");
                $("#close" + result).click();
              },
              error: function() {
                alert("Error in ajax POST!");
              }
            });
          });
        }
      }
    );
  }
}

function Unlock(SLID, type) {
  console.log("SLID", SLID);
  var password = sessionStorage.userAccount.substring(0, 10);
  if (type == 0) {
    var ws = new WebSocket("ws://192.168.137.4:4300");
    ws.onopen = function() {
      ws.send(password);
    };
    ws.onmessage = evt => {
      ws.close();
    };
  } else {
    // show the unlock qrcode
    $("#qrimg").empty();
    $("body").append("<div id='mask'></div>");
    $("#mask")
      .addClass("mask")
      .fadeIn("slow");
    $("#LoginBox").fadeIn("slow");
    var qrcode = new QRCode2.default($("#qrimg")[0], {
      width: 200,
      height: 200
    });
    qrcode.clear();
    qrcode.makeCode(password);
    $("html,body").animate(
      {
        scrollTop: 0
      },
      500
    );
  }

  //   JsBarcode("#barcode", password, {
  //     displayValue: false
  //   });
  // or with jQuery
  // $("#barcode").JsBarcode("Hi!");

  return;

  var ws = new WebSocket("ws://192.168.137.4:4300");
  ws.onopen = function() {
    ws.send(password);
  };
  ws.onmessage = evt => {
    ws.close();
  };

  return;

  Flatanywhere.unlock.sendTransaction(
    SLID,
    {
      from: sessionStorage.userAccount
    },
    function(err, result) {
      if (!err) {
        console.log("Unlock Successfully!");
      } else {
        console.error(err);
      }
    }
  );
}

function showType(className) {
  // display a specific type of lock in MyLock page
  $(".lock-item")
    .not(className)
    .fadeOut(500);
  setTimeout(function() {
    $(".lock-item")
      .not(className)
      .addClass("hide");
    $(".lock-item" + className).fadeIn(500);
    $(".lock-item" + className).removeClass("hide");
  }, 500);
}

function selectType(num) {
  // determine which type of locks to be displayed
  if (num == 0) {
    showType(".unleasedDiv");
  } else if (num == 1) {
    showType(".rentedDiv");
  } else if (num == 2) {
    showType(".rentingDiv");
  } else if (num == 3) {
    showType(".futureDiv");
  } else {
    // show ALL
    $(".lock-item").fadeOut(500);
    setTimeout(function() {
      $(".lock-item").removeClass("hide");
      $(".lock-item").fadeIn(500);
    }, 500);
  }
}

function LongQueryNewDeal() {
  // new deal reminder
  $.ajax({
    type: "GET", //方法类型
    dataType: "json", //预期服务器返回的数据类型
    url: "/Query", //url
    timeout: 10000,
    success: function(result) {
      // console.log(result);//打印服务端返回的数据(调试用)
      if (result[0].count != 0) {
        Materialize.toast(
          "You receive " + result[0].count + " new deals!",
          5000
        );
        $.ajax({
          type: "POST", //方法类型
          dataType: "text", //预期服务器返回的数据类型
          url: "/Query", //url
          async: false,
          success: function(result) {
            if (result != "0") {
              console.log("Abnormal ajax POST response:", result);
            }
          },
          error: function() {
            alert("Error in ajax POST!");
          }
        });
      }
      setTimeout("LongQueryNewDeal()", 3000);
      return;
    },
    error: function() {
      console.log("Error in AJAX GET");
    }
  });
}
$(document).ready(function() {
  $("#userAccount").val(sessionStorage.userAccount);
  $(".dropdown-button").dropdown();
  $(".button-collapse").sideNav();
  $('.modal').modal();
  $(".datepicker").pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 4 // Creates a dropdown of 15 years to control year
  });
  sessionStorage.newDealCount = 0;
  LongQueryNewDeal();
  //关闭二维码
  $(".close_btn")
    .hover(
      function() {
        $(this).css({
          color: "black"
        });
      },
      function() {
        $(this).css({
          color: "#999"
        });
      }
    )
    .on("click", function() {
      $("#LoginBox").fadeOut("fast");
      $("#mask").css({
        display: "none"
      });
    });
});
