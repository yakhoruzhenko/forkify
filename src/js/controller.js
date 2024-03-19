import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable'; // polyfilling everything else
import 'regenerator-runtime/runtime'; // polyfilling async await
import { MODAL_CLOSE_SEC } from './config.js';

// if (module.hot) {
//   // parcel prevents autoreload
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    // 0. Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage(model.state.search.page));

    // 1. Update bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2. Loading recipe
    await model.loadRecipe(id);

    // 3. Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(`Recipes Controller: ${err}`);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1. Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2. Searching for recipes
    await model.loadSearchResults(query);

    // 3. Rendering search results
    resultsView.render(model.getSearchResultsPage(1));

    // 4. Rendering initial pagination buttons
    paginationView.render(model.state);
  } catch (err) {
    console.error(`SearchResults Controller: ${err}`);
    resultsView.renderError();
  }
};

const controlPagination = function (page) {
  resultsView.render(model.getSearchResultsPage(page));
  paginationView.render(model.state);
};

const controlServings = function (servings) {
  model.updateServingsIngredients(servings);
  recipeView.update(model.state.recipe);
};

const controlBookmark = function () {
  if (model.state.recipe.bookmarked)
    model.removeBookmark(model.state.recipe.id);
  else {
    model.addBookmark(model.state.recipe);
  }
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarksRender = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlUploadRecipe = async function (formData) {
  try {
    // Show loading spinner while uploading
    addRecipeView.renderSpinner();

    // upload recipe with an API call
    await model.uploadRecipe(formData);

    // render uploaded recipe
    recipeView.render(model.state.recipe);

    // render success message
    addRecipeView.renderMessage();

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close form window
    setTimeout(function () {
      addRecipeView.toggleHidden();
    }, MODAL_CLOSE_SEC);
  } catch (err) {
    console.error(`Recipes Upload Controller: ${err}`);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarksRender);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerServings(controlServings);
  recipeView.addHandlerBookmark(controlBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerPaginate(controlPagination);
  addRecipeView.addUploadRecipe(controlUploadRecipe);
  console.log('Welcome to the Application 🍗');
};

init();
