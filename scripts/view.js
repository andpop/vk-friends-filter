const htmlElements = require('./html-elements.js');
const Model = require('./model.js');

module.exports = {
    render(htmlElement, data) { // имя шаблона, данные
        const renderFn = Handlebars.compile(htmlElement.textContent);

        return renderFn(data);
    },
    displayUnselectedFriends(allFriends) {
        const unselectedFriends = Model.getUnselectedFriends(allFriends, htmlElements.unselectedFilter.value.trim());
        htmlElements.unselectedList.innerHTML = this.render(htmlElements.templateElement, unselectedFriends);
    },
    displaySelectedFriends(allFriends) {
        const selectedFriends = Model.getSelectedFriends(allFriends, htmlElements.selectedFilter.value.trim());
        htmlElements.selectedList.innerHTML = this.render(htmlElements.templateElement, selectedFriends);
    },
    displayFriends(allFriends) {
        this.displayUnselectedFriends(allFriends);
        this.displaySelectedFriends(allFriends);
    }


};
