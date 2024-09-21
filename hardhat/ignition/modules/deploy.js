const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MultiContractDeployment", (m) => {
  // Deploy WalletLogin first
  const WalletLogin = m.contract("WalletLogin");

  // Deploy CarbonToken (ERC20 Token)
  const CarbonToken = m.contract("CarbonToken");

  // Deploy CarbonMarketplace, which requires the address of CarbonToken
  const CarbonMarketplace = m.contract("CarbonMarketplace", {
    args: [CarbonToken]
  });

  // Deploy ProjectDonation, which also requires the address of CarbonToken
  const ProjectDonation = m.contract("ProjectDonation", {
    args: [CarbonToken]
  });

  // Deploy ProjectNFT, which is an independent ERC721 contract
  const ProjectNFT = m.contract("ProjectNFT");

  return {
    WalletLogin,
    CarbonToken,
    CarbonMarketplace,
    ProjectDonation,
    ProjectNFT
  };
});
