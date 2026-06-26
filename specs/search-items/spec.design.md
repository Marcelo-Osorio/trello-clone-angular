# Technical Design : System of Search & Filter

## Already implemented **needs a refactor**
### Components
#### BoardNavbarComponent
Responsibilities :
- Emit click to BoardComponent

#### BoardComponent
Responsibilities :
- Use the emit and open SearchPanelComponent
- Those visible lists will update if a filter is applied to this board, so consult SearchService and sent visible lists.
- The SearchService will bring all data filtered ready to displayed

#### SearchPanelComponent
Responsibilities :
- Display search input by text 
- Display search selector by labels, by consulting LabelService
- Sentences that are in input text after a delay of writing or enter, send it to SearchService
- Labels that are chose will be sent to SearchService
- After chose labels or writing in input text show chips of what was selected or wrote, with an x button to take off the filter from SearchPanelComponent and SearchService

### Service
#### SearchService
Responsibilities :
- It'll put the filtering true to a specific board the filter is true if SearchPanelComponent sended something
- Receives the kind of filter including the content, such as labels and text from SearchPanelComponent
- It'll get visible lists from BoardNavbarComponent to apply the filters

