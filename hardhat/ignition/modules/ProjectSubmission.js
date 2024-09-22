const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("ProjectSubmission", (m) =>{  
    const ProjectSubmission = m.contract("ProjectSubmission") 
    return {ProjectSubmission}; 
})