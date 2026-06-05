Here’s the English translation:

# Bugs in our Members modal @src\app\modules\boards

> When we open our @src\app\modules\boards\components\invite-dialog, we always fetch all available users so they can be added to that board. We also fetch all the users that we have already added to the board via localStorage. The problem happens when our @src\app\modules\boards\components\card-modal loads its respective card: it simply takes the members from board.members, which was already loaded in @src\app\modules\boards\pages\board. We do not want the data source for the card modal members to be board.members, but instead the localStorage users saved in invite-dialog.

## Objectives

* First, review invite-dialog. You will see that our localStorage logic for the fetched users is stored there. We want you to extract that logic and move it into our @src\app\services\users.service.ts. Create methods to save users in localStorage and retrieve them, and also connect it to our @src\app\modules\boards\components\invite-dialog.

* In @src\app\modules\boards\components\card-modal, when we send the member data to @src\app\modules\boards\components\member-picker, that data must come from localStorage, retrieved through the users service in the ngOnInit of @src\app\modules\boards\components\card-modal. Also, do not forget to include our own user. To do this, in @src\app\modules\boards\pages\board, you will need to subscribe to this.authService.user$ and always send our profile when the card modal is opened so that it can render it.

* In @src\app\modules\boards\components\member-picker, we have a major issue: it allows us to select which users will be available to be added to our board.member. We do not want to select users; that logic must be removed.

* The user selection logic can be used in a better way: our memberSelect output should continue sending the member that was clicked, but when it is sent to @src\app\modules\boards\components\card-modal, it should render the user’s name as text inside the description textField, highlighting the name that was added. It should also be added like this: textField: text text @username.

* Improve the member picker. It should continue showing the available users, but we have an overflow issue in its layout. Find it and fix it.
