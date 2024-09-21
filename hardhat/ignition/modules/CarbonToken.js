const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("CarbonToken", (m) =>{  
    const CarbonToken = m.contract("CarbonToken") 
    return {CarbonToken}; 
})