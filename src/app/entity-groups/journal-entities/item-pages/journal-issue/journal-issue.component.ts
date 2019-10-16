import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from '../../../../core/shared/item.model';
import { isNotEmpty } from '../../../../shared/empty.util';
import { ItemComponent } from '../../../../+item-page/simple/item-types/shared/item.component';
import { getRelatedItemsByTypeLabel } from '../../../../+item-page/simple/item-types/shared/item-relationships-utils';
import { ViewMode } from '../../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../shared/object-collection/shared/listable-object/listable-object.decorator';

@listableObjectComponent('JournalIssue', ViewMode.StandalonePage)
@Component({
  selector: 'ds-journal-issue',
  styleUrls: ['./journal-issue.component.scss'],
  templateUrl: './journal-issue.component.html'
})
/**
 * The component for displaying metadata and relations of an item of the type Journal Issue
 */
export class JournalIssueComponent extends ItemComponent {
  /**
   * The volumes related to this journal issue
   */
  volumes$: Observable<Item[]>;

  /**
   * The publications related to this journal issue
   */
  publications$: Observable<Item[]>;

  /**
   * Initialize the instance variables
   */
  ngOnInit(): void {
    super.ngOnInit();

    if (isNotEmpty(this.resolvedRelsAndTypes$)) {
      this.volumes$ = this.resolvedRelsAndTypes$.pipe(
        getRelatedItemsByTypeLabel(this.object.id, 'isJournalVolumeOfIssue')
      );
      this.publications$ = this.resolvedRelsAndTypes$.pipe(
        getRelatedItemsByTypeLabel(this.object.id, 'isPublicationOfJournalIssue')
      );
    }
  }
}
