/**
 * Charge transaction processor function.
 * @param {org.tailian.insurance.ChangeTransaction} tx The sample transaction instance.
 * @transaction
 */
function changeTransaction(tx) {
  var factory = getFactory();
  var NS = "org.tailian.insurance";
  var user = tx.user;
  //用户是否存在
  var userFlag;
  return getUserFlag(tx.user.userId).then(function (flag) {
    userFlag = flag;
  }).then(function () {
    return getAssetRegistry(NS + ".User");
  }).then(function (assetRegistry) {
    var amount = tx.amount;
    if (userFlag) {
      // 用户不存在
      var balance = tx.user.balance;
      if (tx.type) {
        //充值
        user.balance = balance + amount;
      } else {
        //扣款
        user.balance = balance - amount;
      };

      var change = factory.newConcept(NS, 'Change');
      change.time = new Date();
      change.amount = amount;
      change.balance = user.balance;
      change.type = tx.type;
      change.pid = tx.pid;
      user.changeList = user.changeList.concat(change);
      return assetRegistry.update(user);
    } else {
      // 用户存在
      user = factory.newResource(NS, 'User', user.userId);
      user.balance = amount;
      var change = factory.newConcept(NS, 'Change');
      change.time = new Date();
      change.amount = amount;
      change.balance = amount;
      change.type = tx.type;
      change.pid = tx.pid;
      user.changeList = [change];
      return assetRegistry.add(user);
    }
  }).catch(function (e) {
    alert(e)
  });
}

/*
用户是否存在
*/
function getUserFlag(userId) {
  return getAssetRegistry('org.tailian.insurance.User')
    .then(function (assetRegistry) {
      return assetRegistry.exists(userId);
    });
}