const MarketplaceMigration = artifacts.require("BookMarketplace");

module.exports = function (deployer) {
  deployer.deploy(MarketplaceMigration);
};
