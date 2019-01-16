pragma solidity ^0.4.24;

contract Flatanywhere
{
    /*
    * globol variable
    */
    address creator;

    struct SmartLock
    {
      bytes32 SLID;
      address owner;
      address currentUser;
      uint256 unitPrice;
      uint256 startTime;
      uint256 endTime;
      bool isRent;
    }

    struct Deal
    {
      bytes32 DEALID;
      bytes32 SLID;
      address sellerAddr;
      address buyerAddr;
      uint256 totalAmount;
      uint256 checkInTime;
      uint256 checkOutTime;
    }

    mapping(bytes32=>Deal) Deals;
    mapping(bytes32=>SmartLock) SmartLocks;

     /*
     * event declear
     */
     event NewSmartLock(
      bytes32 SLID,
      address indexed owner);

     event NewDeal(
      bytes32 DEALID,
      bytes32 indexed SLID,
      address indexed sellerAddr,
      address buyerAddr,
      uint256 totalAmount,
      uint256 checkInTime,
      uint256 checkOutTime);

     event SmartLockRefresh(
      bytes32 indexed SLID,
      address currentUser,
      uint256 endTime,
      bool isRent);

     event Newunlock(
      address sender,
      address indexed host,
      uint256 time);
     event SetNewUser(
      address sender,
       address indexed host,
       uint256 time);
     event HostRefresh(
      address sender,
      address indexed host,
      uint256 time);
     /**
     * modifier part
     */
    //  modifier ExistSmartLock(bytes32 _SLID)
    //  {
    //   require(SmartLocks[_SLID].owner != address(0),"ExistSmartLock: SmartLock Not Exist!");
    //   _;
    // }

    // modifier OwnSmartLock(bytes32 _SLID, address _owner)
    // {
    //   require(SmartLocks[_SLID].owner == _owner,"OwnSmartLock: Current user does not own this lock!");
    //   _;
    // }

    modifier ValidDuration(bytes32 _SLID, uint256 checkInTime, uint256 checkOutTime)
    {
      require(checkInTime < checkOutTime, "ValidDuration: checkInTime is not greater than checkOutTime!");
      require(SmartLocks[_SLID].startTime <= checkInTime, "ValidDuration: startTime is greater than checkInTime!");
      require(SmartLocks[_SLID].endTime >= checkOutTime, "ValidDuration: checkOutTime is greater than endTime!");
      _;
    }

    modifier ExistDeal(bytes32 _DEALID)
    {
      require(Deals[_DEALID].sellerAddr != address(0),"ExistDeal: Deal Not Exist!");
      _;
    }

    /*
    * contract part
    */
    constructor() public payable
    {
      creator=msg.sender;
    }

    /**
    * Smart Lock functions
    * CreateSmartLock : create smart lock
    * RefreshSmartLock : reset the current user and extend the endTime
    */

    function ExistSmartLock(bytes32 _SLID)
      internal
      view
      returns (bool exist)
    {
      exist = (SmartLocks[_SLID].owner != address(0));
    }
    function OwnSmartLock(bytes32 _SLID, address _owner)
    internal
      view
      returns (bool own)
    {
      own = (SmartLocks[_SLID].owner == _owner);
    }
    function CreateSmartLock(uint256 _unitPrice, uint256 _startTime, uint256 _endTime, uint256 _now)
      external
      returns (bytes32 _lockID)
    {
      _lockID = keccak256(abi.encodePacked(msg.sender, _now)); // keccak256 is cheaper than sha256
      require(SmartLocks[_lockID].owner == address(0),"CreateSmartLock Require: SmartLock Already Exist!");
      SmartLocks[_lockID] = SmartLock(
        _lockID,
        msg.sender,
        msg.sender,
        _unitPrice,
        _startTime,
        _endTime,
        false);
      emit NewSmartLock(_lockID, msg.sender);
    }

    function RefreshSmartLock(bytes32 _SLID)
      public
    {
      require(ExistSmartLock(_SLID) == true, "ExistSmartLock: SmartLock Not Exist!");
      require(OwnSmartLock(_SLID, msg.sender) == true, "OwnSmartLock: Current user does not own this lock!");
      SmartLocks[_SLID].currentUser = SmartLocks[_SLID].owner; // reset the owning state
      SmartLocks[_SLID].endTime = now + 100 * 1 days; // entend the lock time automatically
      SmartLocks[_SLID].isRent = false;
      emit SmartLockRefresh(_SLID, SmartLocks[_SLID].currentUser, SmartLocks[_SLID].endTime, SmartLocks[_SLID].isRent);
    }

    function CreateDeal(bytes32 SLID, address sellerAddr, uint256 checkInTime, uint256 checkOutTime)
      external
      payable
      ValidDuration(SLID, checkInTime, checkOutTime)
      returns (bytes32 DEALID)
    {
      require(ExistSmartLock(SLID) == true, "ExistSmartLock: SmartLock Not Exist!");
      require(OwnSmartLock(SLID, sellerAddr) == true, "OwnSmartLock: Current user does not own this lock!");

      DEALID = keccak256(abi.encodePacked(
        SLID,
        // sellerAddr,
        msg.sender,
        checkInTime,
        // checkOutTime,
        now));
      // require(Deals[DEALID].sellerAddr == address(0), "CreateDeal Require: Deal Already Exist!");
      // uint256 totalAmount = ((checkOutTime - checkInTime) / (60 * 60 * 24)) * SmartLocks[SLID].unitPrice * 10 * 1 finney;
      // transform from second to day; transform the unit of price from 0.01ETH to 1ETH;
      Deals[DEALID] = Deal(
        DEALID,
        SLID,
        sellerAddr,
        msg.sender,
        msg.value,
        checkInTime,
        checkOutTime);
      SmartLocks[SLID].currentUser = msg.sender;
      SmartLocks[SLID].isRent = true;
      sellerAddr.transfer(msg.value);
      emit NewDeal(
        DEALID,
        SLID,
        sellerAddr,
        msg.sender,
        msg.value,
        checkInTime,
        checkOutTime);
    }
    
    /*
    * Get function for checking the contract and lock info
    *
    */

    function getSmartLock(bytes32 _SLID)
      public
      view
      returns(bytes32 SLID, address owner, uint256 unitPrice)
    {
      require(ExistSmartLock(_SLID) == true, "ExistSmartLock: SmartLock Not Exist!");
      SmartLock storage c = SmartLocks[_SLID];
      return (_SLID, c.owner, c.unitPrice);
    }

    function getDeal(bytes32 _DEALID)
      public
      view
      ExistDeal(_DEALID)
      returns(
        bytes32 SLID,
        address sellerAddr,
        address buyerAddr,
        uint256 totalAmount,
        uint256 checkInTime,
        uint256 checkOutTime)
    {
      Deal storage d = Deals[_DEALID];
      return (d.SLID, d.sellerAddr, d.buyerAddr, d.totalAmount, 
        d.checkInTime, d.checkOutTime);
    }

    function getCreator()
      public
      view
      returns(address _c)
    {
      _c = creator;
    }

    function getContractBalance()
      public
      view
      returns(uint256 balance)
    {
      balance = address(this).balance;
    }

    // Smart Lock Control Part
    function unlock(address hostaddr)
      external
    {
      emit Newunlock(msg.sender, hostaddr, now);   
    }
    
    function purchase(address hostaddr)
      external
    {
      emit SetNewUser(msg.sender, hostaddr, now);
    }
    
    function refresh(address hostaddr)
      external
    {
      emit HostRefresh(msg.sender, hostaddr, now);
    }
    
    function checkConnection()
      external
      view
    returns(address a)
    {
      a = address(this);
    }

    function() external payable
    {

    }
    
  }