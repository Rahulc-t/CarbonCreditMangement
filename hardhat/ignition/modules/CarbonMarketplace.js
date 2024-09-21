const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("CarbonMarketplace", (m) =>{  
    const CarbonMarketplace = m.contract("CarbonMarketplace") 
    return {CarbonMarketplace}; 
})