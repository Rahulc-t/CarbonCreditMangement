const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("WalletLogin", (m) =>{  //change cert module to game module [random name]
    const WalletLogin = m.contract("WalletLogin") //change cert to gameT since its the contract name
    return {WalletLogin}; 
})