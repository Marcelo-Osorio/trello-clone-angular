# Refactor : System of Search & Filter

## Goal
Make search system usable by searching for text and labels

## Users
- Board Owner
- Board Member

## Entities 
> These files already implemented and are part of the refactor
- **BoardComponent** 
- **SearchPanelComponent**
- **BoardNavbarComponent**
- **SearchService**
- **LabelsService**

## Functional Requirements
### REQ-001 : Panel layout
> It's a panel that contains filtering by text search and labels

Acceptance Criteria :
1. Given a click in search icon in BoardNavbarComponent
   Then from BoardComponent will open a SearchPanelComponent that contains MatSidenav from angular material
   Then to MatSidenav:
   - Will be open from right 
   - Its position is over
   - The content is pushed to the left with a slow animation
   - if there's a click outside, will be close
2. Given panel SearchPanelComponent opened 
   Then show chips from angular material of what we're looking:
   - [label | label-name] [search | search content] if it's too much in search add at final three dots like "description of a card and ..." 
3. Given panel SearchPanelComponent opened 
   Then show search input that will search using text
   Then collecting labels info from LabelsService to show in a selection row :
   - label color | label name

### REQ-002 : Polity of searching 
> The searching will affect BoardComponent, by filtering lists and cards

Acceptance Criteria :
1. Given a text put it in the input search text
   When the user doesn't write more or when the user press enter
   Then make a searching by text in each card of all lists :
   - Search by title card
   - Search by general text description
   - Search by checklist group name and their items name
   - It won't search by title list
   Then that will affect BoardComponent only showing lists with at least one coincidence
   Then inside of each list with at least one coincidence show only cards that have that coincidence  

2. Given one or many selected labels
   Then, filter the lists and cards in BoardComponent that have at least one of the labels we are looking for.

## Non-functional Requirements
- Those filters are cumulative so we can filter for labels and text at same time
- To create the text and label search methods, use native higher-order array functions in JavaScript/TypeScript.
- Do not filter archived lists, only visible lists in BoardComponent

## Main Scope 
> ***src/modules/boards/***

## Out of scope
- Searching in the text field by the lists title
- Searching by due dates
- Searching by members
- Searching in archived lists, do not search there


