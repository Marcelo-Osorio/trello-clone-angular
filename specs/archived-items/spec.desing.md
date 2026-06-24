# Technical Design : System of archived **List**

## Data Models
```typescript 

// To save list use our already create interface -- session storage
interface List {...}

// To save ids -- local storage
interface ListID {
  listID : number
}
```

---

## Already implemented **needs a refactor**
### Components
> Only focus towards implement archived feature

#### BoardNavbarComponent
Responsibilities :
- Contains archived button
- Emit click event with output

#### ListComponent
Responsibilities:
- It has the option of archive whole list
- Emit output to send info to BoardComponent as list interface 
- Menu option to select archive list that will be disable if we click in something else

#### BoardComponent
Responsibilities :
- Before to render something, filter archive lists through comparison for the set of ids lists
- Every list who already is in ArchivedService, will be put in our ArchivedService in session storage and prevent to be rendered
- Event click BoardNavbarComponent will open a modal ArchivedModalComponent
- ArchivedModalComponent emits list to be recover
- Each list issued will display, include their cards
- NgOnInit has labelsService wired waiting to upload many list content and their cards cascading
- Whatever card that was archived and be updated because of labels, upload that list with changes using its ArchivedService, just the session storage 

#### ArchivedModalComponent
Responsibilities:
- This call in ngOnInit ArchivedService
- Obtains all archived lists
- Display as a preview all lists and their cards
- Recover button in each list will remove list from the modal preview 
- Recover button remove list from ArchivedService **list id, and the same list**
- Recover button send list to BoardComponent including their cards as list interface
- Close button 

---

### Services
> Only focus towards implement archived feature

#### **ArchivedService**
Responsibilities :
- Save ids lists in local storage
- Save lists in session storage
- Remove a list and ids from local storage and session storage
- Getters lists and ids
