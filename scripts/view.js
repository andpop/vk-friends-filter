window.View = {
    render(htmlElement, data) { // имя шаблона, данные
        const renderFn = Handlebars.compile(htmlElement.textContent);

        return renderFn(data);
    },
    displayUnselectedFriends() {
        const unselectedFriends = Model.getUnselectedFriends(allFriends, htmlElements.unselectedFilter.value.trim());
        htmlElements.unselectedList.innerHTML = this.render(htmlElements.templateElement, unselectedFriends);
    },
    displaySelectedFriends() {
        const selectedFriends = Model.getSelectedFriends(allFriends, htmlElements.selectedFilter.value.trim());
        htmlElements.selectedList.innerHTML = this.render(htmlElements.templateElement, selectedFriends);
    },
    displayFriends() {
        this.displayUnselectedFriends();
        this.displaySelectedFriends();
    }


};
