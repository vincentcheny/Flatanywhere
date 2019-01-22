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
})
