// UTIL JS for UPDATES and CLICKS

// BUTTON ROW HANDLER
function countBtn() {
    barCountBtn();          // function located at barChart.js
    forceCountBtn();        // function located at forceGraph.js
}
function commentBtn() {
    barCommentBtn();        // function located at barChart.js
    forceCommentBtn();      // function located at forceGraph.js
}
function answerBtn() {
    barAnswerBtn();         // function located at barChart.js
    forceAnswerBtn();       // function located at forceGraph.js
}
function favoriteBtn() {
    barFavoriteBtn();       // function located at barChart.js
    forceFavoriteBtn();     // function located at forceGraph.js
}  
function scoreBtn() {
    barScoreBtn();          // function located at barChart.js
    forceScoreBtn();        // function located at forceGraph.js
}
function viewBtn() {
    barViewBtn();           // function located at barChart.js
    forceViewBtn();         // function located at forceGraph.js
}
function deselect() {
    selectBar("");          // function located at barChart.js
    selectNode("");         // function located at forceGraph.js
}

// CHART INFORMATION BUTTON
function info() {
    alert("top 50 used tags on superuser.com (year 2016)\n\n" +

          "Count: How often a tag was used. \n" +
          "Comments: How many comments a tag got. \n" +
          "Answers: How many answers a tag got. \n" +
          "Favorites: How many favorites a tag got. \n" +
          "Score: The score a tag got. \n" +
          "Views: How many views a tag got. \n" +

          "\nand how often they appear with each other.");
}