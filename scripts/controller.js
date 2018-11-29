const Model = require('./model.js');
const View = require('./view.js');
const htmlElements = require('./html-elements.js');

module.exports = {
    addDrugAndDropListeners() {
        htmlElements.unselectedList.addEventListener('dragstart', e => {
            // Запоминаем id перемещаемого друга
            e.dataTransfer.setData('id', e.target.dataset.friend_id);
        });

        // Делаем контейнер способным принять перемещаемые объекты
        htmlElements.selectedContainer.addEventListener('dragover', e => {
            e.preventDefault();
        });

        htmlElements.selectedContainer.addEventListener('drop', e => {
            // id перемещенного друга
            const id = e.dataTransfer.getData('id');

            Model.toggleFriendStatus(id);
            View.displayFriends();
        });
    },
    // Переключение статуса друга (выбран/невыбран) при щелчке на значок + или x, потом отрисовка списков
    toggleStatusHandler(e) {
        if (e.target.tagName === 'IMG') {
            const id = e.target.dataset.friend_id;

            Model.toggleFriendStatus(id);
            View.displayFriends();
        }
    },
    addListeners() {
        this.addDrugAndDropListeners();
        // Переключение статуса друга (выбран/невыбран) при щелчке на значок + или x
        htmlElements.unselectedList.addEventListener('click', this.toggleStatusHandler);
        htmlElements.selectedList.addEventListener('click', this.toggleStatusHandler);
        // Фильтрация соответстующего списка при изменении текста в фильтре
        htmlElements.unselectedFilter.addEventListener('keyup', () => View.displayUnselectedFriends());
        htmlElements.selectedFilter.addEventListener('keyup', () => View.displaySelectedFriends());

        htmlElements.saveButton.addEventListener('click', () => {
            Model.saveFriendsToLocalStorage();
        });
        htmlElements.closeButton.addEventListener('click', () => window.close());
        // htmlElements.closeButton.addEventListener('click', () => {
        //Окно не закрывается!
        // window.close();
        // window.open(document.location.href, '_self', '');
        // window.close();
        // });
    }
};
