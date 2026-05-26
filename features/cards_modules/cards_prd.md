# Product Required Document (Feature : List and Cards)
## Problem
Our real problem here is the users can't operate with their cards and list, because of the lack of implementation of endpoints cards and list.

---

## Goals

> First our main goal is to make functional to user use list and cards.
 
### Main page view of cards and list
- Implement api **(cards post, cards put)** and **(lists post)** and give a correct use to (**boards/id get**).
- We will have a navbar aside from the usually main which would be below from main navbar, button invite, name board capable to edit its name by click on it, search, and show all boards archived, and home icon to return boars preview page.
- Make each list able to drag and drop
- Create a way to save more options about our description in each card than just description text field. such as labels, mention, checklist, due dates.
- Whenever we load one board by its id, be sure that its load is inside of the component. not external. change our actual load that is in navbar and now should be when we open a board. 
- **Create design add list and add cards**.
  - ![add list](./assets/trello-card-list-creation.png) add a list
  - ![add cards|208](./assets/trello-add-card.png) add cards title, with empty description
- **Improve design card view inside of its modal.**
  - ![list](./assets/trello-list-preview.png) ->The image show us how a list it looks to be, if we have labels in a card show their color at the top of each card, and in the bottom if it has checklist put it there so for example if it was check 2/3 show it like in the image -> When press to 3 dots in each list we will have options in a mini pop-up (archive all cards in this list, archive list with cards)
  - ![seach](./assets/trello-list-search.png) Search By label, @member, a term in whatever card (title, description), due time, but not search in the list title -> When a search it's just done immediately keep showing every list, but will only show the cards that have any coincidence if the list doesn't have any cards to show, so keep showing the list empty. 
### Inside of each card modal : 

* ![Modal Card](./assets/trello-show-card.png) -> In the init modal of a card just we can see title, empty description in a textarea and the activity which be the comments we left to the card also when we click in the title list, that will allow us edit it, just there.
* Make button **Checklist works**, it will open a little modal that will ask us a name for the group of checklist. 
   * ![checklist format in description](./assets/trello-add-checklist.png)
   * In the image checklist format in description : 
   1. how we'll see checklist section in the card modal after putting the name of checklist group.
   2.  It could have hide checked items button
   3. It could delete the whole checklist group by a button
   4. Below of all items to check, we will find a button to add a new item.
   
* Make **Labels and Due Dates** buttons works, turn Dates into a Establish Due Date.
  * Labels when we click in label button this will open a modal, we will have just 6 labels of different colors to choose (green, yellow, orange, red, purple, blue), also if we click in whatever label there we could write its name above it.
  * Due Date, will open a modal that will show us the calendar by just the month ''month - year'', but if we click in the month will show us a different years to move us and as it is a due date the previous days and dates will be disable only available those are front of now, and a button to save (put due date in our main modal card) and a button to remove it or edit it. 
  * ![Label and dates](./assets/trello-card-dates.png) The imagen is how we'll see our LABELS and Due dates when we had finished to created in their modals.
  *  When we make whatever reference to other person by putting '@' that will open a mini pop-up where we can select a person we want to refer, those who was added to participate in the board.
  * When there's a click in members button show all people that was added to the board.

---

## Scope
> The main scope will be delimited at @app_trello\src\app\modules\boards/, but accessing other parts of the project is not prohibited.

---

## Functional requirements

### Main page view of cards and list
| *@app_trello\src\app\modules\boards\pages\board*
* The user should get in a board and see everything inside in it, including their list and cards
*  A user can touch and see the new navbar below of the normal, to access home icon to redirect home page preview boards, name board capable to edit its name when we click in it, button invite persons,  archived button, Search button)
#### Navbar 
> This will be a navbar just in this page, that would've below main navbar with the options in this order (Icon HOME to redirect home page preview boards, Name of board capable to edit when we click on it, button to invite persons, archived button, Search button).

 * **Invite persons** -> Only open a pop-up to add persons to the board, from endpoint users get.
  * When a person is added is saved in local storage, and available to be mention by '@'.
 * **Archived** -> We have two ways to save, 1. by the whole list and cards. 2. by just the cards in a list. Either way it would open a modal when we click in the button, a modal will show us a split of two sections, archived list with cards, and other just showing cards archived, in each of them it will has a button to recover it :
  * If it's a list with cards just will put it in the main page view of cards and list
  * If it's cards will ask us to select a list to put the cards in it.
  * The way we will save boards and list with boards is by local storage, but when we do that always when we render main page view cards and list, before to render anything will verify if we have something in the records archived and that doesn't has to be render.
* **Search** -> The mostly search will be inside of the cards, so for it will keep showing all list, but filtering the containing by just showing the cards that have any coincidence.  The position of this menu of searching will be at right top in the screen. Also don't forget put the number of coincidences in a searching in a Chips, in the navbar. Besides Will affect every card that are not archived.
 * Those filters aren't incremental, I mean that if we type something (only allow @members, text) in the text field and after we add a label to the filters, it won't be apply both filters just one so if we decide type in text field will deactivate all others filter such as label and due dates.
 * Search by label, we can choose the label that will put on the filter
 * Search by @member if we type @ immediately will show the users that are allow in this project in a pop-up, we can chose a user to filter.
 * Search by term, will search by the content of a card, (Title and description (that's include checklist and just text, but exclude labels and due dates)), this just will works by typing in the text field.
 * Search by term and @member just will filter those card that have that term in it and has that member too.
 * Search by due time, at the button of this menu of searching we will have chips as a buttons of all due dates that was we already implemented, if they're much we will have a button to show more that will open a pop-up that can show all due dates that we previously set up. ready to establish a filter.

#### Page all list with cards preview
> The main changes with the actual list preview will be enhance the design, and add some extra options.
* **Design Preview List** -> When it had added checklist or labels in a card, that has to be noted in the preview view.
 * Checklist put it in some part like, per each checklist group a (icon checklist) number of checks / total number. (In the card preview if has one put at the bottom)
 * Labels just show its label's color (In the card preview if has one at the top of the card preview with its color)
* **Options Preview list**  ->The option of archived, add another card, and the ability to make drag and drop to preview lists.
 * **Archived** ->  By pressing the three dots in the list will show a pop-up to select if we want to archived by just whole list with cards, or just cards in the list
  * *How it works ?* This system of archived is save by local storage and also we recover by the same way.
  * *How do we stop the rendering of archived items ?* Whenever it refresh the page it'll bring the cards and list and we compared to those ones we have in local storage and take off ones that are in local storage before to be rendering. 
 *  **Add another card** -> Will just add another card in the list, by only typing its title first in the preview list and when we finished it will send to endpoint (title:..., and an empty description) , but when we modify something inside of a card such as description or title, will be send to endpoint too.
 * **Drag and drop with list** -> We don't have drag and drop to list, build it.
### Inside of each card modal
> In each card just we have (title, description),  where mostly be focus towards is in description, where will be handle (Members, Labels, Checklist and Due dates).
#### But How?
If you look endpoint cards the description just can be create and update in a text field, so we don't have more choice to send an object as a string in description with this structure :
```json
{
 title : '...',
 description : {
 textField : string,
 checklist : [{
 groupName : string,
 list : [{
 item : string,
 checked : boolean
 }]
 }],
 labels : [{
 labelName : string,
 color : string,
 }],
 dueDates : [dateTime,dateTime,...]
 }
}
```
#### Buttons of options
* **Members.** So will open a mini pop-up, read only to see available users across the whole board ready to be mention in textField by @.
* **Labels.** So will open a modal, we will have just 6 labels of different colors to choose (green, yellow, orange, red, purple, blue), also if we click in whatever label, we could write its name above it. But when we reload the page again? it's still showing all labels in the modal but always putting label's name in those who already has one (that's even include labels that were modified in others cards modals). To remember all labels across the board always when from board preview get into a single board will load all its list and cards that are part of the board, when that's is loaded, so extract all labels of each list and each cards and put them in a session storage that also will be update when we create or modify a label. 
* **Checklist**. So it will open a little modal that will ask us a name for the group of checklist. 
* **Due Dates.** Just will open a modal and in it calendar where we could select a due date and a hour, but we just could select a date that is in future not in the past since now.
#### Functionality and representation in the card modal
Will be showing in this order :
*  **Title**. The card title, it can be rewrite if we click on it, also remark the list's name where belongs.
*  **Labels**. Pass the labels that belongs to this card, (name and color), and a button (+) to add more labels.
* **Due date**. Will show the due dates we've set, also if the click on it we could edit it.
* **Description**. Just text field, mark where @mention somebody, also put a button (Edit) to edit text. And a save button when we create the text field or edit the same text.
* **Checklist**. Here is where it has to be show the checklist group, (Title, Hide checked items, Delete, add items), make it be an accordion.
 * Title is also editable when we click on it.
 * Hide checked items as an accordion it could be hide 
 * In Delete just took off the checklist group from the object that will pass in the description.
 * All items from the checklist, (check button, and name).
 * Add item just will put an item below and will ask to be typed.
## Observations
1. When you have to build the card modal where you'll run into a lot of options to add in description, use react forms by angular.
2. Split the logic in cards modal because will have labels, due dates and so on, split them in other components and to each them give the capabilities of a react form, to from the component can send information to father components that is handling the entire logic of react forms
3. Whenever we change something in a card modal send to endpoint put card
4. Just to remember we have boards page preview @src\app\modules\boards\pages\boards/ from there we can access to see a single board deeply @src\app\modules\boards\pages\board/ with its list and cards, but this page only show a preview of list with cards (also don't forget the new navbar, the previous we still keeping) to be deeply go to click in a preview card and you'll see title of a card, and their description (text field, labels, checklist, due dates, members)



