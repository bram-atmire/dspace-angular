export const MY_DEFINITION_FORM_JSON: any = {
  mandatory: false,
  fields: [
    {
      label: 'Authors',
      mandatory: false,
      repeatable: true,
      hints: 'Enter the names of the authors of this item.',
      input: {
        type: 'name'
      },
      selectableMetadata: [
        {
          metadata: 'dc.contributor.author',
          authority: 'LCNameAuthority',
          closed: false
        }
      ]
    },
    {
      label: 'Title',
      mandatory: true,
      repeatable: false,
      mandatoryMessage: 'You must enter a main title for this item.',
      hints: 'Enter the main title of the item.',
      input: {
        type: 'onebox'
      },
      selectableMetadata: [
        {
          metadata: 'dc.title'
        }
      ]
    },
    {
      label: 'Other Titles',
      mandatory: false,
      repeatable: true,
      hints: 'If the item has any alternative titles, please enter them here.',
      input: {
        type: 'onebox'
      },
      selectableMetadata: [
        {
          metadata: 'dc.title.alternative',
          authority: 'SRJournalTitle',
          closed: false
        }
      ]
    },
    {
      label: 'Date of Issue',
      mandatory: true,
      repeatable: false,
      mandatoryMessage: 'You must enter at least the year.',
      hints: "Please give the date of previous publication or public distribution.\n                        You can leave out the day and/or month if they aren't\n                        applicable.",
      input: {
        type: 'date'
      },
      selectableMetadata: [
        {
          metadata: 'dc.date.issued'
        }
      ]
    },
    {
      label: 'Publisher',
      mandatory: false,
      repeatable: false,
      hints: 'Enter the name of the publisher of the previously issued instance of this item.',
      input: {
        type: 'onebox'
      },
      selectableMetadata: [
        {
          metadata: 'dc.publisher',
          authority: 'SRPublisher',
          closed: false
        }
      ]
    },
    {
      label: 'Citation',
      mandatory: false,
      repeatable: false,
      hints: 'Enter the standard citation for the previously issued instance of this item.',
      input: {
        type: 'onebox'
      },
      selectableMetadata: [
        {
          metadata: 'dc.identifier.citation'
        }
      ]
    },
    {
      label: 'Series/Report No.',
      mandatory: false,
      repeatable: true,
      hints: 'Enter the series and number assigned to this item by your community.',
      input: {
        type: 'series'
      },
      selectableMetadata: [
        {
          metadata: 'dc.relation.ispartofseries'
        }
      ]
    },
    {
      label: 'Identifiers',
      mandatory: false,
      repeatable: true,
      hints: 'If the item has any identification numbers or codes associated with\nit, please enter the types and the actual numbers or codes.',
      input: {
        type: 'onebox'
      },
      selectableMetadata: [
        {
          metadata: 'dc.identifier.issn',
          label: 'ISSN'
        },
        {
          metadata: 'dc.identifier.other',
          label: 'Other'
        },
        {
          metadata: 'dc.identifier.ismn',
          label: 'ISMN'
        },
        {
          metadata: 'dc.identifier.govdoc',
          label: "Gov't Doc #"
        },
        {
          metadata: 'dc.identifier.uri',
          label: 'URI'
        },
        {
          metadata: 'dc.identifier.isbn',
          label: 'ISBN'
        }
      ]
    },
    {
      label: 'Type',
      mandatory: false,
      repeatable: true,
      hints: "Select the type(s) of content of the item. To select more than one value in the list, you may have to hold down the \'CTRL\' or \'Shift\' key.",
      input: {
        type: 'dropdown'
      },
      selectableMetadata: [
        {
          metadata: 'dc.type',
          authority: 'common_types',
          closed: false
        }
      ]
    },
    {
      label: 'Language',
      mandatory: false,
      repeatable: false,
      hints: "Select the language of the main content of the item.  If the language does not appear in the list, please select 'Other'.  If the content does not really have a language (for example, if it is a dataset or an image) please select 'N/A'.",
      input: {
        type: 'dropdown'
      },
      selectableMetadata: [
        {
          metadata: 'dc.language.iso',
          authority: 'common_iso_languages',
          closed: false
        }
      ]
    }
  ]
}
