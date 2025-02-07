import { Package } from "../redux/reducers/productsSlice";

export const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

export const formatPrice = (price: string, currency = 'USD') => {
  const locale = navigator.language;
  let formattedPrice = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(price));

  if (formattedPrice.endsWith('.00')) {
    formattedPrice = formattedPrice.slice(0, -3);
  }

  return formattedPrice;
};

export const packageName = (pkg: Package) => {
  if (pkg.name.toLowerCase().includes('small')) {
    return 'Basic';
  } else if (pkg.name.toLowerCase().includes('medium')) {
    return 'Advanced';
  } else if (pkg.name.toLowerCase().includes('large')) {
    return 'Gold';
  }
};
export const getUserLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const locationData = await response.json();
    return locationData.country_code;
  } catch (error) {
    return 'US';
  }
}

export const getCurrencyBasedOnLocation = async () => {
  const userCountry = await getUserLocation();

  let newCurrency = 'USD';
  if (userCountry === 'ZA') newCurrency = 'ZAR';
  else if (['AT', 'BE', 'FR', 'DE', 'IT', 'ES', 'NL', 'PT'].includes(userCountry)) newCurrency = 'EUR';

  return newCurrency;
};

/**
 * Return as a string
 * If it is null, return as ''
 */
export const returnAsString = (input: string) => {
  return input ? input : ''
}


/** Header with token */
export const headerWithToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Token ${token}` }
  }
  return {}

}

/*** Return url params */
export const urlParameters = (url?: string | null) => {
  if (!url) {
    url = window.location.href
  }
  const urls = url.split('?')

  if (urls[1]) {
    const parameters = urls[1].split('#')[0].split('&')
    const paramDict = {}
    parameters.map(param => {
      const splitParam = param.split('=')
      paramDict[splitParam[0]] = decodeURI(splitParam.slice(1).join('='))
    })
    return paramDict
  } else {
    return {}
  }
}