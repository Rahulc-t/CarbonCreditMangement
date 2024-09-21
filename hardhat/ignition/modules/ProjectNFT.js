const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("ProjectNFT", (m) =>{  
    const ProjectNFT = m.contract("ProjectNFT") 
    return {ProjectNFT}; 
})