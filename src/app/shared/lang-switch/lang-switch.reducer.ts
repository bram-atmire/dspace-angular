import { LangSwitchAction, LangSwitchActionTypes } from './lang-switch.actions';

export interface LangSwitchState {
  currentLanguage: string;
  activeLanguages: string[];
  inactiveLanguages: string[];
}

const initialState: LangSwitchState = {
  currentLanguage: 'en',
  activeLanguages: ['en','de','cs','nl'],
  inactiveLanguages: [],
};

export function langSwitchReducer(state = initialState, action: LangSwitchAction): LangSwitchState {
  switch (action.type) {

    case LangSwitchActionTypes.ACTIVATE: {
      return Object.assign({}, state, {
        navCollapsed: true
      });
    }

    case LangSwitchActionTypes.DEACTIVATE: {
      return Object.assign({}, state, {
        navCollapsed: false
      });

    }

    default: {
      return state;
    }
  }
}
