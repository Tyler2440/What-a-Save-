class Players {
    /**
     * Creates the Players object
     */
    constructor(data) { 
        this.data = data;

        // Initialize header data
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'game'
            },
            {
                sorted: false,
                ascending: false,
                key: 'w/l',
            },
            {
                sorted: false,
                ascending: false,
                key: 'goals',
            },
            {
                sorted: false,
                ascending: false,
                key: 'assists'
            },
            {
                sorted: false,
                ascending: false,
                key: 'saves'
            }
        ]
        
        console.log(data);

        this.AddTableHeaders();
        this.AddSortingHandlers();
        this.FillPlayersTable()
    }

    AddTableHeaders() {
        let svg = d3.select("#page-header");

        svg.append("text")
        .text("Select Player: ")
        .style("margin-top", "95px")
        .style("margin-left", "10px");

        let playerSelect = svg.append("select")
        .attr("id", "player-select")
        .attr("label", "Select Player: ")
        .style("margin-top", "50px");

        let players = new Set();
        this.data.forEach(function (game) {
            if (game["blue"]["players"] != undefined)
            {
                game["blue"]["players"].forEach(player => players.add(player["name"]));
            }
            
            if (game["orange"]["players"] != undefined)
            {
                game["orange"]["players"].forEach(player => players.add(player["name"]));
            }
        });

        players.forEach( function(player) {
            playerSelect.append("option")
            .attr("label", player);
        });

        svg.append("button")
        .text("Filter")
        .attr("id", "filter-table")
        .style("margin-top", "50px")
        .style("margin-left", "50px");
    }

    AddSortingHandlers() {
        let headers = d3.select("#player-table");

        // When any of the headers are clicked
        headers.selectAll("th")
        .on("click", (d) => {
            // Set all column as not the sorting column
            d3.selectAll("th").classed("sorting", false); // ***
            // Reset the "i" element; essentially add no-display and remove sort-down and sort-up icons so they don't display
            d3.selectAll("i").attr("class", "fas no-display").classed("fa-solid fa-sort-down", false).classed("fa-solid fa-sort-up", false);

            if (d['srcElement'].innerText == "Game ")
            {          
                // If this column is in ascending order     
                if (this.headerData[0].ascending)
                {
                    this.data.sort((x, y) => x["date"] < y["date"] ? 1 : -1); // Sort the data
                    let source = d3.select(d.srcElement); // Get the table header element we clicked on                  
                    let i = source.select("i"); // Grab the "i" element
                    i.classed("no-display", false); // Remove the "no-display" class
                    i.classed("fa-solid fa-sort-down", false); // Add the sort up icon
                    i.classed("fa-solid fa-sort-up", true); // Remove the sort up button
                }  
                else
                {                    
                    this.data.sort((x, y) => x["date"] < y["date"] ? -1 : 1); // Sort the data
                    let source = d3.select(d.srcElement); // Get the table header element we clicked on               
                    let i = source.select("i"); // Grab the "i" element
                    i.classed("no-display", false); // Remove the "no-display" class
                    i.classed("fa-solid fa-sort-up", false); // Remove the sort up icon
                    i.classed("fa-solid fa-sort-down", true); // Add the sort up button
                }
                this.headerData[0].ascending = !this.headerData[0].ascending;
            }
            else if (d['srcElement'].innerText == "W/L ")
            {
                let source = d3.select(d.srcElement);
                source.classed("sorting", true);
                let i = source.select("i");
                // If this column is in ascending order
                if (this.headerData[1].ascending)
                {           
                    this.data.sort((x, y) => x["blue"]["stats"]["core"]["goals"] > y["orange"]["stats"]["core"]["goals"] ? 1 : -1); // Sort the data
                    // Get this element and set it to sorting column
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-down", false);
                    i.classed("fa-solid fa-sort-up", true);
                }
                else
                {
                    this.data.sort((x, y) => x["blue"]["stats"]["core"]["goals"] > y["orange"]["stats"]["core"]["goals"] ? -1 : 1);      
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-up", false);
                    i.classed("fa-solid fa-sort-down", true);         
                }
                console.log(this.data);
                this.headerData[1].ascending = !this.headerData[1].ascending;
            }
            else if (d['srcElement'].innerText == "Goals ")
            {
                // If this column is in ascending order
                if (this.headerData[2].ascending)
                {                    
                    this.data.sort((x, y) => x.percent_of_d_speeches < y.percent_of_d_speeches ? 1 : -1); // Sort the data
                    // Get this element and set it to sorting column
                    let source = d3.select(d.srcElement);
                    let i = source.select("i");
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-down", false);
                    i.classed("fa-solid fa-sort-up", true);
                }
                else
                {
                    this.data.sort((x, y) => x.percent_of_d_speeches < y.percent_of_d_speeches ? -1 : 1); 
                    let source = d3.select(d.srcElement);
                    source.classed("sorting", true);
                    let i = source.select("i");
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-up", false);
                    i.classed("fa-solid fa-sort-down", true);       
                }

                this.headerData[2].ascending = !this.headerData[2].ascending;
            }
            else if (d['srcElement'].innerText == "Assists ")
            {
                // If this column is in ascending order
                if (this.headerData[3].ascending)
                {                   
                    this.data.sort((x, y) => x.total < y.total ? 1 : -1); // Sort the data
                    // Get this element and set it to sorting column
                    let source = d3.select(d.srcElement);
                    let i = source.select("i");
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-down", false);
                    i.classed("fa-solid fa-sort-up", true);
                }
                else
                {
                    this.data.sort((x, y) => x.total < y.total ? -1 : 1); 
                    let source = d3.select(d.srcElement);
                    source.classed("sorting", true);
                    let i = source.select("i");
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-up", false);
                    i.classed("fa-solid fa-sort-down", true);         
                }

                this.headerData[3].ascending = !this.headerData[3].ascending;
            }
            else if (d['srcElement'].innerText == "Saves ")
            {
                // If this column is in ascending order
                if (this.headerData[3].ascending)
                {                   
                    this.data.sort((x, y) => x.total < y.total ? 1 : -1); // Sort the data
                    // Get this element and set it to sorting column
                    let source = d3.select(d.srcElement);
                    let i = source.select("i");
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-down", false);
                    i.classed("fa-solid fa-sort-up", true);
                }
                else
                {
                    this.data.sort((x, y) => x.total < y.total ? -1 : 1); 
                    let source = d3.select(d.srcElement);
                    source.classed("sorting", true);
                    let i = source.select("i");
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-up", false);
                    i.classed("fa-solid fa-sort-down", true);         
                }

                this.headerData[3].ascending = !this.headerData[3].ascending;
            }
            // Redraw the table with the new sorted data
            this.FillPlayersTable();
        });
    }

    FillPlayersTable() {
        // Reset table
        d3.select('#table-body')
            .selectAll('tr')
            .remove();
        d3.select('#table-body')
            .selectAll('td')
            .remove();
        
        let table = d3.select("#player-table");
        let playerName = d3.select("#player-select  option:checked").property("label");

        let playerData = [];
        let gameSet = new Set();

        this.data.forEach(function (game) {
            let players = [];

            if (!gameSet.has(game["id"]))
            {
                gameSet.add(game["id"]);

                if (game["blue"]["players"] != undefined)
                {
                    game["blue"]["players"].forEach(player => players.push(player["name"]));
                }
                
                if (game["orange"]["players"] != undefined)
                {
                    game["orange"]["players"].forEach(player => players.push(player["name"]));
                }
    
                if (players.includes(playerName))
                {
                    playerData.push(game);
                }
            }
        });
        
        // add table row data
        let trs = d3.select('#table-body')
            .selectAll('tr')
            .data(playerData)
            .join("tr")
            .on("mouseover", function() {
                let row = d3.select(this).select("svg");

                row.style("background-color", "white");
            })
            .on("mouseout", function() {
                let row = d3.select(this).select("svg");
                row.style("background-color", "lightgray");
            })
            .on("click", this.FillOrangeScoreBoard);
        
        // Add a td in each tr
        let rowSelection = trs.selectAll("td")
        .data(d => [d])
        .join("td");

        // Add an svg in each td
        let svgSelect = rowSelection.selectAll("svg")
        .data(d => [d])
        .join("svg")
        .attr("width", 783)
        .attr("height", 30);

        // Format the dates in format m/d/y h:mm AM/PM (ex. 11/1/22 12:15 PM)
        let dateFormat = d3.timeFormat("%m/%d/%y %I:%M %p");

        // Add the game date/time
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {
            let gameDate = Date.parse(d["date"]);
            return dateFormat(gameDate);
        })
        .attr("transform", "translate(0,15)")
        .style("font-size", "14px");

        // Add the game W/L
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {
            let onBlue = false;
            d["blue"]["players"].forEach(function(player) {
                if (player["name"] == playerName)
                {
                    onBlue = true;
                }
            });

            let orangeGoals = d["orange"]["stats"]["core"]["goals"];
            let blueGoals = d["blue"]["stats"]["core"]["goals"];

            if (onBlue)
            {
                if (blueGoals > orangeGoals)
                {
                    return "W";
                }
                else
                {
                    return "L";
                }
            }
            else
            {
                if (orangeGoals > blueGoals)
                {
                    return "W";
                }
                else
                {
                    return "L";
                }
            }
            
        })
        .attr("transform", "translate(175,15)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player goals
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {
            let playerGameData = null;
            let orangePlayers = d["orange"]["players"];

            orangePlayers.forEach(function(player) {
                if (player["name"] == playerName)
                {
                    playerGameData = player;
                }
            });

            if (playerGameData == null)
            {
                let bluePlayers = d["blue"]["players"];

                bluePlayers.forEach(function(player) {
                    if (player["name"] == playerName)
                    {
                        playerGameData = player;
                    }
                });
            }

            return playerGameData["stats"]["core"]["goals"];
        })
        .attr("transform", "translate(335,15)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player assists
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {
            let playerGameData = null;
            let orangePlayers = d["orange"]["players"];

            orangePlayers.forEach(function(player) {
                if (player["name"] == playerName)
                {
                    playerGameData = player;
                }
            });

            if (playerGameData == null)
            {
                let bluePlayers = d["blue"]["players"];

                bluePlayers.forEach(function(player) {
                    if (player["name"] == playerName)
                    {
                        playerGameData = player;
                    }
                });
            }

            return playerGameData["stats"]["core"]["assists"];
        })
        .attr("transform", "translate(500,15)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player saves
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {
            let playerGameData = null;
            let orangePlayers = d["orange"]["players"];

            orangePlayers.forEach(function(player) {
                if (player["name"] == playerName)
                {
                    playerGameData = player;
                }
            });

            if (playerGameData == null)
            {
                let bluePlayers = d["blue"]["players"];

                bluePlayers.forEach(function(player) {
                    if (player["name"] == playerName)
                    {
                        playerGameData = player;
                    }
                });
            }

            return playerGameData["stats"]["core"]["saves"];
        })
        .attr("transform", "translate(650,15)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");
    }

    FillOrangeScoreBoard() {
        // Reset all "selected" elements 
        d3.select("#player-table").selectAll(".selected").classed("selected", false);

        // Update selected row color
        let row = d3.select(this).select("svg");
        row.classed("selected", true);

        // Reset table
        d3.select('#orange-table-body')
        .selectAll('tr')
        .remove();

        d3.select('#orange-table-body')
        .selectAll('td')
        .remove();
            
        let table = d3.select("#orange-table");

        let gameData = d3.select(this)._groups["0"]["0"]["__data__"];

        let playerData = gameData["orange"]["players"];
        console.log(playerData);
            
        // add table row data
        let trs = d3.select('#orange-table-body')
            .selectAll('tr')
            .data(playerData)
            .join("tr");
            
        // Add a td in each tr
        let rowSelection = trs.selectAll("td")
        .data(d => [d])
        .join("td");
    
        // Add an svg in each td
        let svgSelect = rowSelection.selectAll("svg")
        .data(d => [d])
        .join("svg")
        .attr("width", 800)
        .attr("height", 30);

        // Add player names
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["name"];
        })
        .attr("transform", "translate(10,20)")
        .style("font-size", "15px")
        .attr("color", "white");

        // Add player score
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["score"];
        })
        .attr("transform", "translate(180,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player goals
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["goals"];
        })
        .attr("transform", "translate(280,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player assists
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["assists"];
        })
        .attr("transform", "translate(380,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player saves
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["saves"];
        })
        .attr("transform", "translate(480,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player shots
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["shots"];
        })
        .attr("transform", "translate(590,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player demos
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["demo"]["inflicted"];
        })
        .attr("transform", "translate(710,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        globalApplicationState.players.FillBlueScoreBoard.call(this);
    }

    FillBlueScoreBoard() {
        // Reset all "selected" elements 
        d3.select("#player-table").selectAll(".selected").classed("selected", false);

        // Update selected row color
        let row = d3.select(this).select("svg");
        row.classed("selected", true);

        // Reset table
        d3.select('#blue-table-body')
        .selectAll('tr')
        .remove();

        d3.select('#blue-table-body')
        .selectAll('td')
        .remove();
            
        let table = d3.select("#blue-table");

        let gameData = d3.select(this)._groups["0"]["0"]["__data__"];

        let playerData = gameData["blue"]["players"];
        console.log(playerData);
            
        // add table row data
        let trs = d3.select('#blue-table-body')
            .selectAll('tr')
            .data(playerData)
            .join("tr");
            
        // Add a td in each tr
        let rowSelection = trs.selectAll("td")
        .data(d => [d])
        .join("td");
    
        // Add an svg in each td
        let svgSelect = rowSelection.selectAll("svg")
        .data(d => [d])
        .join("svg")
        .attr("width", 800)
        .attr("height", 30);

        // Add player names
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["name"];
        })
        .attr("transform", "translate(10,20)")
        .style("font-size", "15px")
        .attr("color", "white");

        // Add player score
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["score"];
        })
        .attr("transform", "translate(180,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player goals
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["goals"];
        })
        .attr("transform", "translate(280,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player assists
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["assists"];
        })
        .attr("transform", "translate(380,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player saves
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["saves"];
        })
        .attr("transform", "translate(480,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player shots
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["shots"];
        })
        .attr("transform", "translate(590,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player demos
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["demo"]["inflicted"];
        })
        .attr("transform", "translate(710,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");
    }
}