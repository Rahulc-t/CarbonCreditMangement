const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("WalletLogin", (m) =>{  
    const WalletLogin = m.contract("WalletLogin")
    return {WalletLogin}; 
})