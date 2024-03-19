import { async } from 'regenerator-runtime';
import { API_URL, KEY, PAGE_SIZE } from './config.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: { query: '', results: [], page: 1 },
  resultsPerPage: PAGE_SIZE,
  set bookmarks(_bookmarks) {
    localStorage.setItem('bookmarks', JSON.stringify(_bookmarks));
  },
  get bookmarks() {
    const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks'));
    if (!storedBookmarks) {
      return [];
    }
    return storedBookmarks;
  },
};

export const loadRecipe = async function (id) {
  const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);
  state.recipe = createRecipeObject(data);

  if (state.bookmarks.some(bookmark => bookmark.id === id))
    state.recipe.bookmarked = true;
};

export const loadSearchResults = async function (query) {
  state.search.query = query;
  const {
    data: { recipes },
  } = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
  state.search.results = recipes.map(rec => {
    return {
      id: rec.id,
      title: rec.title,
      publisher: rec.publisher,
      image: rec.image_url,
      ...(rec.key && { key: rec.key }), // conditionally adding properties to the object
    };
  });
};

export const getSearchResultsPage = function (page) {
  state.search.page = page;
  const start = (page - 1) * state.resultsPerPage;
  const end = page * state.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServingsIngredients = function (servings) {
  const curServings = state.recipe.servings;
  const servingsDelta = servings - curServings;
  if (curServings === 1 && servingsDelta <= -1) return;

  state.recipe.servings += servingsDelta;
  const quotient = state.recipe.servings / curServings;
  state.recipe.ingredients.forEach(ing => {
    ing.quantity ? (ing.quantity = ing.quantity * quotient) : ing.quantity;
  });
};

export const addBookmark = function (recipe) {
  const storedBookmarks = state.bookmarks;

  // Avoid bookmarking recipe more than once
  if (storedBookmarks.some(bookRec => bookRec.id === recipe.id)) return;

  // Add boomark
  // state.bookmarks.push(recipe);
  storedBookmarks.push(recipe);
  state.bookmarks = storedBookmarks;

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
};

export const removeBookmark = function (id) {
  const storedBookmarks = state.bookmarks;

  // Find bookmark index
  const index = storedBookmarks.findIndex(book => book.id === id);

  // Delete boomark
  storedBookmarks.splice(index, 1);
  state.bookmarks = storedBookmarks;

  // Mark current recipe as not bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;
};

export const uploadRecipe = async function (formData) {
  const ingredients = Object.entries(formData)
    .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
    .map(ing => {
      const ingArray = ing[1].split(',').map(el => el.trim());
      if (ingArray.length !== 3)
        throw new Error('Wrong ingredient format passed during recipe upload');
      const [quantity, unit, description] = ingArray;
      return { quantity: quantity ? +quantity : null, unit, description };
    });

  const recipe = {
    title: formData.title,
    source_url: formData.sourceUrl,
    image_url: formData.image,
    publisher: formData.publisher,
    cooking_time: +formData.cookingTime,
    servings: +formData.servings,
    ingredients,
  };

  const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
  state.recipe = createRecipeObject(data);
  addBookmark(state.recipe);
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }), // conditionally adding properties to the object
  };
};
