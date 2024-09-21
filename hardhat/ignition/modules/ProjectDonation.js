const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("ProjectDonation", (m) => {
    const ProjectDonation = m.contract("ProjectDonation")
    return { ProjectDonation };
})