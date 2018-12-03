import htmlElements from './html-elements.js';
import Model from './model.js';
import Handlebars from 'handlebars';

export default {
    render(htmlElement, data) { // имя шаблона, данные
        const renderFn = Handlebars.compile(htmlElement.textContent);

        return renderFn(data);
    },
    displayUnselectedFriends() {
        const unselectedFriends = Model.getUnselectedFriends(htmlElements.unselectedFilter.value.trim());
        htmlElements.unselectedList.innerHTML = this.render(htmlElements.templateElement, unselectedFriends);
    },
    displaySelectedFriends() {
        const selectedFriends = Model.getSelectedFriends(htmlElements.selectedFilter.value.trim());
        htmlElements.selectedList.innerHTML = this.render(htmlElements.templateElement, selectedFriends);
    },
    displayFriends() {
        this.displayUnselectedFriends();
        this.displaySelectedFriends();
    }
};
