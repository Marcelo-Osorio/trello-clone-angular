# Refactor : System of archived **List**

## Goal
Improve and change our actual system of archived, by giving the option to archived list and its cards contained.

## Users
- Board Owner
- Board Member

## Entities 
> These files already implemented and are part of the refactor
- **BoardComponent** : view page list
- **BoardNavbarComponent** : navbar menu 
- **ArchivedModalComponent**
- **ArchivedService**

## Functional Requirements
### REQ-001: Archived a List 
> The user can archived a list in local storage include its cards inside it.

Acceptance Criteria :
1. Given one list from endpoint */api/v1/boards/{{board_id}}* 
   When we click in archived list option, it'll call archived service
   Then will be checked if the list already is in the service 
   Then if is not the list, will be put the list in a session storage and also its id in local storage.

2. Given the success archived of the list 
   Then the list and its cards will be remove its visibility in the view page list

3. Given the fail archived 
   Then the list it won't disappear its visibility

### REQ-002: Collecting archived lists
> When the board is loaded we need to collect ours archived list acknowledge them by their id.

Acceptance Criteria :
1. Given our board info from endpoint */api/v1/boards/{{board_id}}* 
   When there's at least one list id in the archived service, it means that it has to recover that same list again
   Then the list it will be sent to be saved in archived service

2. Given a list sended to archived service
   Then save that list info in session storage

3. Given a success recover list
   Then prevents the rendering of that list in the view page list

4. Given an update of any label which will affect several cards and in consequence lists in a cascading fashion
   When a label is update 
   Then pick up info list updated 
   Then if the list already is in the service update it
   Then if not do nothing

### REQ-003: Management and showing archived lists
> All of our list will be displayed in a modal with a preview of them and the capability to be recovered.

Acceptance Criteria :
1. Given our whole archived lists getting by archived service 
   When we click on archived option in the navbar menu, it'll open the modal ArchivedModalComponent
   Then the modal will display each archived list.

2. Given all archived list into the modal ArchivedModalComponent
   Then show a preview inside of an expansion panel from angular material
   Then show in this format -> Recover button - Title list - nro cards - expansion button
   Then when expanded is true show only title cards

3. Given all list rendered into the modal ArchivedModalComponent
   When there's a click on recover (in some list)
   Then it'll be take off from archived service
   Then it'll be add to view page list to be rendered

## Non-functional Requirements
- The list must disappear without reloading the full page, such as ArchivedModalComponent and BoardComponent
- Recover our archived lists only knowing its id loaded in local storage, when we load a BoardComponent
- Our labels are updated in waterfall affecting a lot of list when is update in BoardComponent, so if our list will be update only  put that update in our service never put it to be render in view page list. As long as we have that list id in our local storage.
- Even though you already have complete list info, ArchivedModalComponent has to show every list but only show title list, nro cards and each card title

## Main Scope 
> ***src/modules/boards/***

## Out of scope
- Use our archived service in others modules that don't are BoardComponent 
- Trying to use an api, archived only works with its service 
- Don't try to archived only cards or just cards separately 

