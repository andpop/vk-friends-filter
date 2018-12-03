import Model from './model.js';
import View from './view.js';
import Controller from './controller.js';

//Создаем объект Model.allFriends с друзьями, сохраненными в local storage
Model.loadFriendsFromLocalStorage();

(async () => {
    //Добавляем в объект Model.allFriends с друзьями записи о друзьях из ВК
    await Model.addFriendsFromVK();
    View.displayFriends();
    Controller.addListeners();
})();
