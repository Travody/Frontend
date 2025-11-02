import { State, City, IState, ICity } from 'country-state-city';

// India country code (ISO 3166-1 alpha-2)
const INDIA_COUNTRY_CODE = 'IN';

/**
 * Get all Indian states/provinces
 */
export const getIndianStates = (): IState[] => {
  return State.getStatesOfCountry(INDIA_COUNTRY_CODE);
};

/**
 * Get state names as string array
 */
export const getIndianStateNames = (): string[] => {
  return getIndianStates().map(state => state.name);
};

/**
 * Get cities by state name
 */
export const getCitiesByState = (stateName: string): ICity[] => {
  const state = getIndianStates().find(s => s.name === stateName);
  if (!state || !state.isoCode) return [];
  return City.getCitiesOfState(INDIA_COUNTRY_CODE, state.isoCode);
};

/**
 * Get city names as string array by state name
 */
export const getCityNamesByState = (stateName: string): string[] => {
  return getCitiesByState(stateName).map(city => city.name);
};

/**
 * Get state ISO code by state name
 */
export const getStateCodeByName = (stateName: string): string | undefined => {
  const state = getIndianStates().find(s => s.name === stateName);
  return state?.isoCode;
};

/**
 * Get state name by ISO code
 */
export const getStateNameByCode = (isoCode: string): string | undefined => {
  const state = getIndianStates().find(s => s.isoCode === isoCode);
  return state?.name;
};

// Export for backward compatibility
export const indianStates = getIndianStateNames();

// Helper to check if a state exists
export const isValidState = (stateName: string): boolean => {
  return getIndianStates().some(s => s.name === stateName);
};

// Helper to check if a city exists in a state
export const isValidCityForState = (cityName: string, stateName: string): boolean => {
  return getCitiesByState(stateName).some(c => c.name === cityName);
};
