export interface ReduxState {
  data: any;
  loading: boolean;
  error: string | null;
}

export const ReduxStateInit = {
  data: null,
  loading: false,
  error: null
}