import { Action } from '@ngrx/store';

import { type } from '../ngrx/type';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 *
 * The 'type' utility function coerces strings into string
 * literal types and runs a simple check to guarantee all
 * action types in the application are unique.
 */
export const LangSwitchActionTypes = {
  ACTIVATE: type('dspace/lang-switch/ACTIVATE'),
  DEACTIVATE: type('dspace/lang-switch/DEACTIVATE'),
};

/* tslint:disable:max-classes-per-file */
export class LangSwitchActivateAction implements Action {
  type = LangSwitchActionTypes.ACTIVATE;
}

export class LangSwitchDeactivateAction implements Action {
  type = LangSwitchActionTypes.DEACTIVATE;
}
/* tslint:enable:max-classes-per-file */

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type LangSwitchAction
  = LangSwitchActivateAction
  | LangSwitchDeactivateAction
