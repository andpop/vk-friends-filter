let Model = require('./model.js');
const View = require('./view.js');
const Controller = require('./controller.js');

//Создаем объект с друзьями, сохраненными в local storage
let allFriends = Model.loadFriendsFromLocalStorage();

// console.log(Model.allFriends);

(async () => {
    //Добавляем в объект с друзьями записи о друзьях из ВК
    await Model.addFriendsFromVK(allFriends);
    View.displayFriends(allFriends);
    Controller.addListeners(allFriends);
})();
