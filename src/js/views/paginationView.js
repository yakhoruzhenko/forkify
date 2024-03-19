import View from './View';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  _generateMarkupPage(direction) {
    let page;
    let arrow;
    let text;
    switch (direction) {
      case 'next':
        page = this._data.search.page + 1;
        arrow = 'right';
        text = `
            <span>Page ${page}</span>
            <svg class="search__icon">
            <use href="${icons}#icon-arrow-${arrow}"></use>
            </svg>
        `;
        break;
      case 'prev':
        page = this._data.search.page - 1;
        arrow = 'left';
        text = `
            <svg class="search__icon">
            <use href="${icons}#icon-arrow-${arrow}"></use>
            </svg>
            <span>Page ${page}</span>
        `;
    }
    return `
    <button data-goto=${page} class="btn--inline pagination__btn--${direction}">
    ${text}
    </button>
  `;
  }

  _generateMarkup() {
    const numPages = Math.ceil(
      this._data.search.results.length / this._data.resultsPerPage
    );
    if (numPages <= 1 || this._data.search.page > numPages) return '';
    if (this._data.search.page === 1) {
      return this._generateMarkupPage('next');
    } else if (this._data.search.page === numPages) {
      return this._generateMarkupPage('prev');
    } else {
      return (
        this._generateMarkupPage('next') + this._generateMarkupPage('prev')
      );
    }
  }

  addHandlerPaginate(handler) {
    this._parentElement.addEventListener('click', function (e) {
      e.preventDefault();
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      const goToPage = +btn.dataset.goto; // converting to int
      handler(goToPage);
    });
  }
}

export default new PaginationView();
