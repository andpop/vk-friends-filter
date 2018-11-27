const htmlElements = {
    selectedFilter: document.querySelector('#selected-filter'),
    unselectedFilter: document.querySelector('#unselected-filter'),
    selectedContainer: document.querySelector('#selected-container'),
    selectedList: document.querySelector('#selected-list'),
    unselectedList: document.querySelector('#unselected-list'),
    saveButton: document.querySelector('#save'),
    closeButton: document.querySelector('#close'),
    templateElement: document.querySelector('#friend-template')
}

//Создаем объект с друзьями, сохраненными в local storage
let allFriends = Model.loadFriendsFromLocalStorage();

Controller.addListeners();

(async () => {
    //Добавляем в объект с друзьями записи о друзьях из ВК
    await Model.addFriendsFromVK(allFriends);

    View.displayFriends();
})();
