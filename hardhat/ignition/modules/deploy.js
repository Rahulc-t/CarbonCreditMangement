const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployAllContracts", (m) => {
  // Deploy WalletLogin contract
  const WalletLogin = m.contract("WalletLogin");

  // Deploy CarbonToken contract
  const CarbonToken = m.contract("CarbonToken");

  // Deploy CarbonMarketplace, passing CarbonToken address to constructor
  const CarbonMarketplace = m.contract("CarbonMarketplace", {
    args: [CarbonToken],
  });

  // Deploy ProjectDonation, passing CarbonToken address to constructor
  const ProjectDonation = m.contract("ProjectDonation", {
    args: [CarbonToken],
  });

  // Deploy ProjectNFT (ERC721 contract)
  const ProjectNFT = m.contract("ProjectNFT");

  return {
    WalletLogin,
    CarbonToken,
    CarbonMarketplace,
    ProjectDonation,
    ProjectNFT,
  };
});
