# Bug in the stack of cards
## Problem
Whenever we launch the app we always have our recent data from localstorage, but there's a problem when we make a login with other account the data of the previous user still there
## Resolution
When we make a login always reset our localstorage 

# Redesign boards preview @boards
## Bad using in the recently viewed
### Problem
It has to be show not by its id order, otherwise it could be better if we just bring the recently 4 viewed from the @recent-boards service
### Solution
Put a conditional if the stack in @recent-boards doesn't have anything don't show recently viewed (hide it) just show all boards directly, put verification in nginit component

## Reorganization boards
### Problem
We reorganize the way we show boards, it is inefficient for the user
### Solution 
So we have 'recently viewed' and 'all boards':
- Recently just it will be show if there's at least one board in the stack, when we have data in our stack from @recent-boards.service show recently viewed and put the data from the stack at least 4 boards and besides recently viewed should be there in an accordion from angular material but don't put all boards in an accordion

- when we don't have any data from our stack just hide recently viewed and show all board only not in an accordion, but if we visit at least one board that should be put in the stack and be rendered in recently viewed. all boards should be order by board id decrease and if we have nothing in all boards too just show message 'no boards yet'

- when we have data 'recently viewed' and 'all boards' show both, and only put in an accordion those are recently don't all boards

So for this you have to develop the conditionals also track the stack rencently viewed, you have to upload in nginit component, and change it to be track in @recent-boards.service so this turn into an observable the getting of the stack and suscribe to it, and also don't forget to update the way we get recent boards in @navbar.
Also the service @recent-boards needs to change because what happens when we save the same board again it will be appear repeat in the stack? we need to filtered if we get in a board already is in the stack verify that and if it yes don't put it just move that board to the recent position, and send the info to suscribers

## Use separate component to show preview boards
### problem
The way we show boards in @boards doesn't seem efficient because we are not using @boart-card component
### Solution
Attach this component and create the necessary functionalities needed when we show a board preview, in @boards
To recently boards, all boards and filtered boards

## repeating calling APi
### problem
we don't have a cache system to track the results from api
### solution
read mcp server POSTMAN > my_workspace > fake-trello api
We need a cache system to get board by id, and me boards , So when we make whatever request with those endpoints first we verify if we already have the result in our cache if it's true just load that, if not call api
Will be save in a session storage
get board by id -> save it by its id, but the hash of the session storage has to be 'detail_boards' and has to be an object {id:board, id2: board} so will be load more boards as long as we get in more boards and get its details
me boards -> save it everything 
Also don't forget that the cache will be reset to void when we use post or put endpoint depend of the endpoint but got both excluding users and auth endpoints
get board by id -> reset when we use whatever post or put across our app 
me boards -> just when we use boards, create board post and update board put
# Bug navbar 
## problem 
when we get down by scrolling our navbar can be see
## solution
Keep the navbar in the screen so use stick position
