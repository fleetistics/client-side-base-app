import locationStateReducer from '@/app.Commons/dataLayer/api/other/locationApi';

// App-specific reducers that client-side.Commons' makeStore() mixes into the root store,
// so Commons never has to import app code itself.
export class ExtraStoreProvider {
  static GetReducers() {
    return {
      locationState: locationStateReducer,
    };
  }
}
