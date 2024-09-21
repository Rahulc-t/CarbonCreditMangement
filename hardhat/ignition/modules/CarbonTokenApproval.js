const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("CarbonTokenApproval", (m) =>{  
    const CarbonTokenApproval = m.contract("CarbonTokenApproval") 
    return {CarbonTokenApproval}; 
})