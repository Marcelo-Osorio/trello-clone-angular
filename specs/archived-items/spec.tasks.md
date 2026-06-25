# Tasks : Archive Feature
> Every task-00x resolves one requirement req-00y
> Sometimes a task will be independent and it won't resolve a requirement

---

## TASK-001 - REQ-001 Archived a List
Implementation :
- Implement ListID interface
- Refactor service Archived Service
- Refactor ListComponent
- Refactor BoardComponent collect whole list to service and sent it to ArchivedModalComponent
- Remove list visibility from BoardComponent

Done When :
- The list was took off from BoardComponent page
- The list was added to archived service 

---

## TASK-002 - REQ-002 Collecting archived lists
Implementation : 
- Collect each list whose id already is in the service and send them to archived service as a list in the loading of BoardComponent
- Make BoardComponent and ArchivedService only works saving list, not cards anymore
- Update ArchivedService if one list is updated because it was affected for labels updating 
- Prevents displayed in BoardComponent of any list who has an id in ArchivedService such in loading of BoardComponent and also a list who had been updated because of a label updating 

Done when : 
- Prevent rendering of those lists whose meet the conditions of have its id in the service 
- Collection of lists in the loading of BoardComponent or list whose have been affect by labels upload 

---

## TASK-003 - REQ-003 Management and showing archived lists
Implementation :
- Rendered each list from our ArchivedService in ArchivedModalComponent 
- Add layout specs in ArchivedModalComponent
- ArchivedModalComponent send recovered list to BoardComponent

Done when :
- List sended by ArchivedModalComponent was displayed in BoardComponent

