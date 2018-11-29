let Model = require('./model.js');
const View = require('./view.js');
const Controller = require('./controller.js');

//Создаем объект Model.allFriends с друзьями, сохраненными в local storage
Model.loadFriendsFromLocalStorage();

(async () => {
    //Добавляем в объект Model.allFriends с друзьями записи о друзьях из ВК
    await Model.addFriendsFromVK();
    View.displayFriends();
    Controller.addListeners();
})();
