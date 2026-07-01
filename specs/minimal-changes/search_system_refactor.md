# Refactor : Search System

## Problem
Our main problem is the display of active filter by the use of chips has problems

## Entities
- **SearchService**
- **SearchPanelComponent**
- **BoardComponent**
- **BoardNavbarComponent**
- **ListComponent**
## Solution
* SearchPanelComponent, When we select a label or write a text to filter that will display our chips of active filters [label | color] [search | text]. So those chips doesn't have to look like that it was just to you understand the order not the design, so give them a design if it's a label paint the whole chip with its color, if it's just text only put the content how i've tell you in the specs
* So it has to look like this :
  * Search : content (default color)
  * Label : content (label color)
  * Color words : white
* Each chip component will be more useful and reusable if is put in @shared/components
* We need to have chips filter section above of search text section SearchPanelComponent so in this order:
  * Active Filter
  * Search Text 
  * Labels
* BoardNavbarComponent also has to have access to active filters to show them in the navbar as chips :
  * After home icon, and board title just there put option active filters, as long as filters to this board are active by SearchService
  * In the option of see filters also it has the number of filters applied to this board
  * If we press there, will open an overlay from angular material or cdk, about each filter as chips read from SearchService
  * If we deleted some chips in our overlay by pressing x in it has to affect our SearchPanelComponent too.
  * To affect SearchPanelComponent by changes in overlay use the SearchService to notify SearchPanelComponent
  * If we delete all chips filter in overlay took off mode filter and deactive filter true to board using SearchService
* We have a bug when we choose to search something and our filter are applied, we can't select options in our ListComponent :
  * This only happen when there's at least one filter applied to board
  * It's because we sent from BoardComponent to ListComponent to deactive their select options to each list
  * When there's filters applied and our  BoardNavbarComponent is closed, it should be active lists options like add a card, archive list, and drag and drop in cards and lists 

