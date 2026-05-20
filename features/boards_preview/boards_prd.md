# Product Required Document (Feature : boards)
## Problem
The main issue is terminate with the implementation of boards and me endpoints across the app, include a better design in the boards module 
## Important
If you need more information of apis make a request mcp postman in my workspace and in collection Fake Trello API 

## Goals
- Endpoints /api/v1/boards/{id} get, /api/v1/boards post, put /api/v1/boards{id} of boards collection should be are finish with their implementation
- Endpoints /api/v1/me/profile get, /api/v1/me/boards get should be are finished
- We have to use frontend and tailwind skill to improve our rendering and performance in the boards module 
- We have to add more components in @src\app\modules\boards/  folder to allow users a better interaction with the app like search, add boards, update boards
- Our endpoint (/api/v1/me/profile get) has to replace our actual profile getting that is in @src\app\services\auth.service.ts 
- Search boards feature
- Gain responsive design 

## Scope
The scope is limited in the @src\app\modules\boards/ module with an allow of access to another resources like services, shared modules, guards, interceptors and so on. but don't go to another modules that it doesn't have anything to be with our boards module.
Please mind these : 
- Don't modify the component that only show a board separately don't write it, just read only @src\app\modules\boards\pages\board/
- You're available to modified the @src\app\modules\layout folder 
- Unless you've don't see more options you can actually modify other files

## User Stories 
The user can interact when :
- open a board that will redirect him to see his board separately
- create a new board only with the available colors that is in the @src\app\models\board.model.ts
- we have "recently viewed", so here we just going to show the 4 recently created boards  
- if the user wants to see all his boards, he can click in a new option below of recently viewed a option that will bring his all boards witch also will bring infinite scroll 
- A user can search a board if he decide
- A user can update a board by an icon of modify

## Functional requirements
### principal requirement
make useful @src\app\modules\boards\pages\boards/  through endpoints board and me, also enhance the design of the page by using angular material, angular cdk or just tailwind
### secondary requirements
* Create the component that allow user create a new board also it has to be a modal
* Take off My workspace accordion is unuseless 
* Add capacity of update boards look in the api
* Improve the design of @boards.component, such as the representation of the boards and the list of links it contains.
* Add capacity of see the recently boards you can show them ordering by its id in descending order just 4 by /api/v1/me/boards get
* Add capacity of see all user's boards by /api/v1/me/boards get, and infinite scroll if they're too much
* Add capacity of loading skeleton of boards 
* Add capacity of search boards by relationship of the title and mark over the title syllables board if it was found 
* Enhance @src\app\modules\layout\components\navbar/, in the navbar if the user select boards he can see the most 3 recently boards that has been use but in this case will show the 3 boards that actually recently has been open, you may use a stack data structure, when he click in create also change it to 'create board ' he will open the modal of creation board
*  @src\app\modules\layout\components\navbar/ he can click to see his profile in here if he hasn't any profile photo show a default icon of user 
* A user can update a board by an icon of modify at the right top of every board 
* It has to be responsive 

