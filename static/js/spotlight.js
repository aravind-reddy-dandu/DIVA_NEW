grid = d3.select("#spotlight-class")
        .append("div")
        .attr("id", "grid")
        .attr("class", "grid");

d3.json("/spotlight_data", function(error, data) {
    console.log(data);
    if (error) throw error;
    chars = grid
        .selectAll("div")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "char");
    chars
        .style("background", function(d){
            if (d.cat_parent == "games"){
                return 'linear-gradient(#13547a, #80d0c7)';
            }
            else if (d.cat_parent == "comics"){
                return 'linear-gradient(#a1c4fd, #c2e9fb)';
            }
            else if (d.cat_parent == "music"){
                return 'linear-gradient(#667eea, #764ba2)';
            }
            else if (d.cat_parent == "technology"){
                return 'linear-gradient(#ff9966, #ff5e62)';
            }
            else if (d.cat_parent == "film & video"){
                return 'linear-gradient(#ff9a9e, #fecfef)';
            }
            else if (d.cat_parent == "publishing"){
                return 'linear-gradient(#ffecd2, #fcb69f)';
            }
            else if (d.cat_parent == "fashion"){
                return 'linear-gradient(#c79081, #dfa579)';
            }
            else if (d.cat_parent == "dance"){
                return 'linear-gradient(#B7F8DB, #50A7C2)';
            }
            else if (d.cat_parent == "journalism"){
                return 'linear-gradient(#cc2b5e, #753a88)';
            }
            else if (d.cat_parent == "crafts"){
                return 'linear-gradient(#42275a, #734b6d)';
            }
            else if (d.cat_parent == "theater"){
                return 'linear-gradient(#4ca1af, #c4e0e5)';
            }
            else if (d.cat_parent == "photography"){
                return 'linear-gradient(#800080, #ffc0cb)';
            }
            else if (d.cat_parent == "design"){
                return 'linear-gradient(#ddd6f3, #faaca8)';
            }
            else if (d.cat_parent == "food"){
                return 'linear-gradient(#4568dc, #b06ab3)';
            }
            else {
                return 'linear-gradient(#ffd89b, #19547b)';
            }
        })
    ;
    content = chars
        .append("div")
        .attr("class", "charContent")
    ;
    content
        .append("h2")
        .text(function(d,i){
            return d.name + "-" + d.cat_parent;
        })
    ;
    chars
        .filter(function(d){ return d.priority < 1000; })
            .classed("size1", true)
        .filter(function(d){ return d.priority < 900; })
            .classed("size1", false)
            .classed("size2", true)
        .filter(function(d){ return d.priority < 600; })
            .classed("size2", false)
            .classed("size3", true)
        .filter(function(d){ return d.priority < 300; })
            .classed("size3", false)
            .classed("size4", true)
        .filter(function(d){ return d.priority < 100; })
            .classed("size4", false)
            .classed("size5", true)
    ;

    chars
        .on("click", function(d, i) {
        if(this.className.split(' ').indexOf('open') > -1 ){
            d3.select(this).classed("open", false);
        }else{
            gridColumns = window.getComputedStyle(this.parentElement).gridTemplateColumns.split(" ");
            gridRows = window.getComputedStyle(this.parentElement).gridTemplateRows.split(" ");
            numColumns = gridColumns.length;
            numRows = gridRows.length;
            xPosInGrid = this.getBoundingClientRect().left - this.parentElement.getBoundingClientRect().left;
            yPosInGrid = this.getBoundingClientRect().top - this.parentElement.getBoundingClientRect().top;
            gridRowHeight = parseFloat(gridRows[0]) + parseFloat(window.getComputedStyle(this.parentElement).gridRowGap);
            gridColumnWidth = parseFloat(gridColumns[0]) + parseFloat(window.getComputedStyle(this.parentElement).gridColumnGap);
            thisRow = Math.round(yPosInGrid/gridRowHeight) +1;
            thisColumn = Math.round(xPosInGrid/gridColumnWidth) +1;
            thisPortrait = this.getElementsByClassName("portrait")[0];
            if(thisPortrait)thisPortrait.setAttribute("src",thisPortrait.getAttribute("data-src"));
            chars.classed("open", false);
            chars.style("grid-row-start", "auto");
            chars.style("grid-column-start", "auto");
            d3.select(this).classed("open", true);
            divWidth = parseFloat(window.getComputedStyle(this).gridColumnEnd.split(" ")[1]);
            divHeight = parseFloat(window.getComputedStyle(this).gridRowEnd.split(" ")[1]);
            if(thisRow+divHeight>numRows)thisRow = 1 + numRows-divHeight;
            if(thisColumn+divWidth>numColumns)thisColumn = 1 + numColumns-divWidth;
            d3.select(this).style("grid-row-start", thisRow)
            d3.select(this).style("grid-column-start", thisColumn)
        }
        })
    ;

    details = content
        .append("div")
        .attr("class", "details")
    ;

    bio = details
        .append("div")
        .attr("class", "bio")
    ;
    bio
        .append("h2")
        .text(function(d,i){
        return d.name;
        })
    ;
    bio
        .filter(function(d){ return d.blurb != ""; })
        .append("h3")
        .text("Description:")
    ;
    bio
        .filter(function(d){ return d.blurb != ""; })
        .append("span")
        .text(function(d,i){
        return d.blurb;
    })
    ;
    bio
        .append("div")
        .attr("class", "bioLink")
        .append("a")
        .attr("href", function(d){ return d.projURL })
        .attr("target", "_blank")
        .text("More Details >>")
    ;

    d3
    .select("#orderAppearances")
    .on("click", function () {
        chars
            .sort(function(a, b) {
            return b["priority"] - a["priority"];
            })
        ;
        chars.classed("open", false);
        chars.style("grid-row-start", "auto");
        chars.style("grid-column-start", "auto");
        })
    ;

    d3
        .select("#orderSigil")
        .on("click", function () {
        chars
            .sort(function(a, b) { 
            return d3.ascending(b["cat_parent"], a["cat_parent"]);
        })
        ;
            chars.classed("open", false);
            chars.style("grid-row-start", "auto");
            chars.style("grid-column-start", "auto");
    })
    ;

    d3
        .select("#orderFirst")
        .on("click", function () {
            chars
            .sort(function(a, b) {
            return a["category"] - b["category"];
            })
        ;
            chars.classed("open", false);
            chars.style("grid-row-start", "auto");
            chars.style("grid-column-start", "auto");
        })
    ;
});