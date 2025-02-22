if (typeof web3 !== "undefined") {
  console.warn("Using web3 detected from external source. Metamask");
  // Use Mist/MetaMask's provider
  web3 = new Web3(web3.currentProvider);
  // 配上require("Web3");
  // web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.137.118:8545"));
} else alert("No external web3 detected! Fail to initialize web3!");

const abi = [
  {
    inputs: [],
    payable: true,
    stateMutability: "payable",
    type: "constructor"
  },
  { payable: true, stateMutability: "payable", type: "fallback" },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "SLID", type: "bytes32" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "serialNum", type: "bytes32" }
    ],
    name: "NewSmartLock",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "DEALID", type: "bytes32" },
      { indexed: true, name: "SLID", type: "bytes32" },
      { indexed: true, name: "sellerAddr", type: "address" },
      { indexed: false, name: "buyerAddr", type: "address" },
      { indexed: false, name: "totalAmount", type: "uint256" },
      { indexed: false, name: "checkInTime", type: "uint256" },
      { indexed: false, name: "checkOutTime", type: "uint256" }
    ],
    name: "NewDeal",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "SLID", type: "bytes32" },
      { indexed: false, name: "success", type: "bool" }
    ],
    name: "DeleteLock",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "DEALID", type: "bytes32" },
      { indexed: false, name: "SLID", type: "bytes32" },
      { indexed: false, name: "totalAmount", type: "uint256" },
      { indexed: true, name: "sellerAddr", type: "address" }
    ],
    name: "WithdrawableDeal",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "sender", type: "address" },
      { indexed: true, name: "host", type: "address" },
      { indexed: false, name: "time", type: "uint256" }
    ],
    name: "Newunlock",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "sender", type: "address" },
      { indexed: true, name: "host", type: "address" },
      { indexed: false, name: "time", type: "uint256" }
    ],
    name: "SetNewUser",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "sender", type: "address" },
      { indexed: true, name: "host", type: "address" },
      { indexed: false, name: "time", type: "uint256" }
    ],
    name: "HostRefresh",
    type: "event"
  },
  {
    constant: false,
    inputs: [
      { name: "serialNum", type: "bytes32" },
      { name: "_unitPrice", type: "uint256" },
      { name: "_startTime", type: "uint256" },
      { name: "_endTime", type: "uint256" },
      { name: "_now", type: "uint256" }
    ],
    name: "CreateSmartLock",
    outputs: [{ name: "_lockID", type: "bytes32" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "SLID", type: "bytes32" },
      { name: "owner", type: "address" }
    ],
    name: "DeleteSmartLock",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "SLID", type: "bytes32" },
      { name: "sellerAddr", type: "address" },
      { name: "checkInTime", type: "uint256" },
      { name: "checkOutTime", type: "uint256" }
    ],
    name: "CreateDeal",
    outputs: [{ name: "DEALID", type: "bytes32" }],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "SLID", type: "bytes32" },
      { name: "DEALID", type: "bytes32" }
    ],
    name: "CheckIn",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "_SLID", type: "bytes32" }],
    name: "getSmartLock",
    outputs: [
      { name: "SLID", type: "bytes32" },
      { name: "owner", type: "address" },
      { name: "unitPrice", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "_DEALID", type: "bytes32" }],
    name: "getDeal",
    outputs: [
      { name: "SLID", type: "bytes32" },
      { name: "sellerAddr", type: "address" },
      { name: "buyerAddr", type: "address" },
      { name: "totalAmount", type: "uint256" },
      { name: "checkInTime", type: "uint256" },
      { name: "checkOutTime", type: "uint256" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getCreator",
    outputs: [{ name: "_c", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getContractBalance",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "hostaddr", type: "address" }],
    name: "unlock",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "hostaddr", type: "address" }],
    name: "purchase",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [{ name: "hostaddr", type: "address" }],
    name: "refresh",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "checkConnection",
    outputs: [{ name: "a", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];
const address = "0x65c14dc45e75c2b0a3f363f81a30389652e3ef07";
const FlatanywhereABI = web3.eth.contract(abi);
const Flatanywhere = FlatanywhereABI.at(address);

web3.eth.getCoinbase(function(error, result) {
  if (!error) {
    $("#currentUser_info").html(result);
    sessionStorage.userAccount = result; // To be used in *.ejs/*.js
  } else console.error(error);
});

var int = self.setInterval("check()", 1000);
function check() {
  if (sessionStorage.userAccount !== "undefined") {
    web3.eth.getCoinbase(function(error, result) {
      if (!error) {
        if (sessionStorage.userAccount !== result) {
          alert("Metamask Account change! Redirect to Home Page!");
          sessionStorage.userAccount = result;
          window.location.href = "/";
        }
      } else console.error(error);
    });
  }
}
