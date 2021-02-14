const StarNotary = artifacts.require("StarNotary");

var accounts;
var user1;
var user2;

contract("StarNotary", (accs) => {
  accounts = accs;
  user1 = accounts[0];
  user2 = accounts[1];
});

it("can Create a Star", async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId, { from: user1 });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it("can add the star name and star symbol properly", async () => {
  // 1. create a Star with different tokenId - ??? why do you need this ???
  let instance = await StarNotary.deployed();
  // let starId = 6;
  // await instance.createStar("awesome star", starId, { from: owner });
  // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
  assert.equal(await instance.name.call(), "Star Notary");
  assert.equal(await instance.symbol.call(), "STN");
});

it("lets 2 users exchange stars", async () => {
  // 1. create 2 Stars with different tokenId
  let instance = await StarNotary.deployed();

  let starId1 = 7;
  await instance.createStar("Star7", starId1, { from: user1 });

  let starId2 = 8;
  await instance.createStar("Star8", starId2, { from: user2 });

  // 2. Call the exchangeStars functions implemented in the Smart Contract
  await instance.exchangeStars(starId1, starId2, { from: user1 });

  // 3. Verify that the owners changed
  const newOwnerOfStar7 = await instance.ownerOf.call(starId1);
  assert.equal(newOwnerOfStar7, user2);

  const newOwnerOfStar8 = await instance.ownerOf.call(starId2);
  assert.equal(newOwnerOfStar8, user1);
}).timeout(15000);

it("lets a user transfer a star", async () => {
  // 1. create a Star with different tokenId
  let instance = await StarNotary.deployed();

  let starId = 9;
  await instance.createStar("Star9", starId, { from: user1 });

  // 2. use the transferStar function implemented in the Smart Contract
  await instance.transferStar(user2, starId, { from: user1 });

  // 3. Verify the star owner changed.
  const newOwner = await instance.ownerOf.call(starId);
  assert.equal(newOwner, user2);
});

it("lookUptokenIdToStarInfo test", async () => {
  // 1. create a Star with different tokenId
  let instance = await StarNotary.deployed();

  let starId = 10;
  await instance.createStar("Star10", starId, { from: user1 });

  // 2. Call your method lookUptokenIdToStarInfo
  const starName = await instance.lookUptokenIdToStarInfo.call(starId);

  // 3. Verify if you Star name is the same
  assert.equal(starName, "Star10");
});
