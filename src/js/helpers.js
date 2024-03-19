import { TIMEOUT_SEC } from './config';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

/**
 * Make AJAX call to the API
 * @param {str} url The url that will be used by the fetch function
 * @param {Object} [data=undefined] The data to be sent to the API. If undefined sends GET request, otherwise POST
 * @returns {Object} Promise with the data from the API call response
 */
export const AJAX = async function (url, uploadData = undefined) {
  const fetchPro = uploadData
    ? fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData),
      })
    : fetch(url);

  const resp = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
  const data = await resp.json();
  if (!resp.ok) throw new Error(`${data.message} (code: ${resp.status})`);

  return data;
};

// 5ed6604591c37cdc054bcafb - borscht
