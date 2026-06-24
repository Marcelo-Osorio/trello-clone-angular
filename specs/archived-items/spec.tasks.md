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
- Refactor BoardComponent
- Collect each list whose id already is in the service and send them to archived service as a list 

Done when : 
- Prevent rendering of that list itself

---

## TASK-003 - REQ-003 Management and showing archived lists
Implementation :
- Refactor ArchivedModalComponent
- Add layout specs in ArchivedModalComponent
- ArchivedModalComponent send recovered list to BoardComponent

Done when :
- List sended by ArchivedModalComponent was displayed in BoardComponent
d
