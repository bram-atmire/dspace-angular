import { Component, Inject } from '@angular/core';

import { ViewMode } from '../../../../core/shared/view-mode.model';
import { Item } from '../../../../core/shared/item.model';
import { WorkflowItem } from '../../../../core/submission/models/workflowitem.model';
import { SearchResultDetailElementComponent } from '../search-result-detail-element.component';
import { MyDspaceItemStatusType } from '../../../object-collection/shared/mydspace-item-status/my-dspace-item-status-type';
import { Observable } from 'rxjs/internal/Observable';
import { RemoteData } from '../../../../core/data/remote-data';
import { find } from 'rxjs/operators';
import { isNotUndefined } from '../../../empty.util';
import { listableObjectComponent } from '../../../object-collection/shared/listable-object/listable-object.decorator';
import { WorkflowItemSearchResult } from '../../../object-collection/shared/workflowitem-search-result.model';

/**
 * This component renders workflowitem object for the search result in the detail view.
 */
@Component({
  selector: 'ds-workflow-item-search-result-detail-element',
  styleUrls: ['../search-result-detail-element.component.scss'],
  templateUrl: './workflow-item-search-result-detail-element.component.html',
})

@listableObjectComponent(WorkflowItemSearchResult, ViewMode.DetailedListElement)
export class WorkflowItemSearchResultDetailElementComponent extends SearchResultDetailElementComponent<WorkflowItemSearchResult, WorkflowItem> {

  /**
   * The item object that belonging to the result object
   */
  public item: Item;

  /**
   * Represent item's status
   */
  public status = MyDspaceItemStatusType.WORKFLOW;

  /**
   * Initialize all instance variables
   */
  ngOnInit() {
    this.initItem(this.dso.item as Observable<RemoteData<Item>>);
  }

  /**
   * Retrieve item from result object
   */
  initItem(item$: Observable<RemoteData<Item>>) {
    item$.pipe(
      find((rd: RemoteData<Item>) => rd.hasSucceeded && isNotUndefined(rd.payload))
    ).subscribe((rd: RemoteData<Item>) => {
      this.item = rd.payload;
    });
  }

}
