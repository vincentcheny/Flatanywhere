# Flatanywhere

A decentralized application interacting with Ethereum and smart locks.

---

## Introduction

Flatanywhere is a decentralized application (Dapp) that enables you to control a smart lock via the blockchain network, specifically Ethereum. You can rent or rent out a flat anywhere as long as it is equipped with a smart lock that we embed some public functionalities inside.

## Characteristic

- Simple and user-friendly GUI
- Anonymous and safe operations via Ethereum
- Unsupervised shopping experience

## Deployment

```bash
$ git clone https://github.com/vincentcheny/Flatanywhere.git
$ cd Flatanywhere/truffle_part
$ npm install truffle@0.4.15 -g
$ npm install ganache-cli -g
$ ganache-cli # copy any private key and import it in Chrome extension Metamask
$ # open a new terminal
$ truffle compile
$ truffle migrate # copy the contract address to Flatanywhere/server_part/public/js/base.js to replace the original address
$ cd Flatanywhere/server_part
$ npm install
$ npm start # visit http://localhost:3000
```

## Change Log

### v0.7.0 (2019.01.21)

- "CreateLock"页面重命名为"BindLock"，使用Materialize CSS framework重构，新增是否公开房源选项，新增余额读取检测
- "MyLock"页面使用新图标，新增类型筛选功能，新增公开房源时长选项，修复撤销房源时的时间更新问题
- 修复首页在不同屏幕大小下排版错乱的问题

### v0.6.1 (2019.01.15)

- 修复购买而来的锁存在"Show in Store"选项的问题

### v0.6.0 (2019.01.14)

- 完成 createSmartLock 功能分离,新增 createLock 页面,原 Seller 页面改名为 MyLock, 原 Buyer 页面改名为 Store
- 新增"Display in Store"的选项

### v0.5.3 (2019.01.13)

- 未确定解锁码内容情况下使用用户账户作为二维码解锁码
- 完成将 createSmartLock 功能从 Seller 页面分离出去的准备工作

### v0.5.0 (2019.01.12)

- 将 Seller 页面解锁功能由发送以太坊 Transaction 改为用二维码显示解锁码
- 为简化调试过程暂时取消 valid time slot 检查
- 解决 Remix 转账出现 revert 的问题
