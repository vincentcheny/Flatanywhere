//var web3 = require('web3');
if (typeof web3 !== 'undefined')
{
    console.warn("Using web3 detected from external source. Metamask")
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider);
}
else
    alert("No external web3 detected! Fail to initialize web3!");
$(document).ready(function(){
  web3.eth.getBalance(web3.eth.accounts[0],function(err,res){
    if(!err){
      $('#balanceid').html(res.c[0]/10000);
    }
  });

  $('.dropdown-menu').on({
    "click":function(e){
      e.stopPropagation();
    }
  });
  // console.log("hello");
  $("#currentUser_info").click(function(){
    var text=this;
    if(window.getSelection().toString().length>0){
      return false;
    }
    else{
      if (document.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
      }
      else if (window.getSelection)
      {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      else {
        alert("none");
      }
    }
  });
})