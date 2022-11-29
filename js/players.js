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

        let aboutUsButton = d3.select(".collapsible");
        // When aboutUsButton is hovered, change its class to active
        aboutUsButton.on("mouseover", function() {
            aboutUsButton.classed("active", true);
        });
        // When aboutUsButton is not hovered, change its class to inactive
        aboutUsButton.on("mouseout", function() {
            aboutUsButton.classed("active", false);
        });     

        // Call initializer functions with initial data
        this.AddTableHeaders(this.data);
        this.AddSortingHandlers(this.data);
        this.FillPlayersTable(this.data);
        this.FillBeeSwarmChart(this.data);

        // Get first player name, get each of their games, an fill bubble chart
        let playerName = d3.select("#player-select  option:checked").property("label");
        let initialData = [];
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
                    if (game["orange"]["stats"]["core"]["goals"] != game["orange"]["stats"]["core"]["goals_against"])
                    {
                        initialData.push(game);
                    }       
                }
            }
        });
        this.FillBubbleChart(initialData, playerName);
    }

    GetPlayers(data) {
        // Gets all players (Set avoids duplicates)
        let players = new Set();
        data.forEach(function (game) {
            // let new_player = "";
            if (game["blue"]["players"] != undefined)
            {
                game["blue"]["players"].forEach(player => players.add(player["name"]));
            }
            
            if (game["orange"]["players"] != undefined && game["orange"]["stats"]["core"]["goals"] != game["orange"]["stats"]["core"]["goals_against"])
            {
                game["orange"]["players"].forEach(player => players.add(player["name"]));
            }
        });

        return players;
    }

    setupBrushes(data, x, y)
    {
        // Create each of the brush groups
        let brushSvg = d3.select("#brush-g")
        .call(d3.brushX()
        .extent([[0,0], [800,350]])
        .on("start brush end", brushed));

        // When the brush groups are clicked, reset the bubble chart and table
        d3.select("#bubble-chart").selectAll(".brush")
        .on("click", function() { 
            let circles = d3.select("#bubble-chart").selectAll("circle")["_groups"][0];
            
            circles.forEach(function(circle) {
                circle = d3.select(circle);
                circle.attr("fill", circle.attr("class")).attr("stroke", "black");
            })
            globalApplicationState.players.FillPlayersTable(data);
        })

        // Brush handler
        function brushed({selection}){
            // Get all circles
            let circles = d3.select("#bubble-chart").selectAll("circle");
                              
            // Get the left and right side of brush
            const [x0, x1] = selection; 

            // Fill all circles gray
            circles.attr("fill", "gray").attr("stroke", "black");
                            
            // We apply the filter to find the dots that are inside the brush
            let value = circles
            .filter(d => x0-30 <= x(d.value)
                && x(d.value) < x1-30)
                // && y0 <= y(d.value)
                // && y(d.value) < y1)
            .attr("fill", "white")
            .attr("stroke", "black").data();

            let tableData = [];

            value.forEach(function(key) {
                tableData.push(key.key);
            })

            // Redraw the table with the new, filtered data
            globalApplicationState.players.FillPlayersTable(tableData);
        }
    }

    FillBubbleChart(data, playerName) {
        // Get the svg
        let svg = d3.select("#bubble-chart");

        // Set x-axis groups
        let groups = ["Win", "Loss"];
    
        // Remove any previous items from the chart
        svg.selectAll("circle").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        // Add the player name to the header text
        svg.append("text")
        .attr('x', 240)
        .attr('y', 20)
        .text("List of Games Played by " + playerName)
        .style("fill", "white");

        // Add the x-axis label
        svg.append("text")
        .text("Score")
        .style("fill", "white")
        .attr("x", 390)
        .attr("y", 340);

        // Initialize arrays
        let winData = [];
        let lossData = [];
        let playersObj = this;
        let maxScore = 0;

        let playerData = [];
        let gameSet = new Set();

        // For each game in the data
        data.forEach(function (game) {
            let players = [];

            // If the game has not been scanned (avoid duplicate games)
            if (!gameSet.has(game["id"]))
            {
                // Add the game
                gameSet.add(game["id"]);

                // If there exist players on the blue team (freeplay games do not necessarily have both teams)
                if (game["blue"]["players"] != undefined)
                {
                    // Add each player on the blue team to players array
                    game["blue"]["players"].forEach(player => players.push(player["name"]));
                }
                
                // If there exists players on the orange team
                if (game["orange"]["players"] != undefined)
                {
                    // Add each player on the orange team to players array
                    game["orange"]["players"].forEach(player => players.push(player["name"]));
                }
    
                // If the player is on either of the teams, add the game to playerData
                if (players.includes(playerName))
                {
                    if (game["orange"]["stats"]["core"]["goals"] != game["orange"]["stats"]["core"]["goals_against"])
                    {
                        playerData.push(game);
                    }       
                }
            }
        });

        // For each game the player appears in
        playerData.forEach(function(game) {
            // Get the result of the game
            let result = playersObj.IsWin(game, playerName);
            let win = result[0];
            let score = result[1];

            // Keep track of the largest score
            if (score > maxScore)
            {
                maxScore = score;
            }
            // If the player won the game, push the game and the players score to winData
            if (win)
            {
                winData.push({
                    key: game,
                    value: score
                });
            }
            // Otherwise, push the game and the players score to lossData
            else
            {
                lossData.push({
                    key: game,
                    value: score
                });
            }
        });

        // Add x-axis
        var x = d3.scaleLinear()
        .domain([0, maxScore])
        .range([0,750]);
        x.nice();

        // Create x-axis
        svg.append("g")
        .attr("transform", "translate(30,300)")
        .call(d3.axisBottom(x));
        
        // Add y-axis
        let y = d3.scaleBand()
        .domain(groups)
        .range([0, 290])
        .padding([0.2]);
        
        // Setup the brush
        this.setupBrushes(playerData, x, y);
        
        // Create the y-axis
        svg.append("g")
        .attr("transform", "translate(30,10)")
        .call(d3.axisLeft(y).tickSize(0));
        
        // Create the subgroup that will control the text on the y-axis
        var ySubgroup = d3.scaleBand()
        .domain(groups)
        .range([0, 0]);

        // Move all text left
        svg.selectAll("text")
        .attr("transform", "translate(-5,0)");

        //Show the circles
        svg.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(winData)
        .enter()
        .selectAll("circle")
        .data(d => [d])
        .enter().append("circle")
            .attr("data", d=>d)
            .attr("class", "orange")
            .attr("type", "Win")
            .attr("cx", d => x(d.value)+30)
            .attr("cy", "90")
            .attr("r", 6)
            .attr("stroke", "black")
            .attr("fill", "orange");

        //Show the circles
        svg.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(lossData)
        .enter()
        .selectAll("circle")
        .data(d => [d])
        .enter().append("circle")
            .attr("data", d=>d)
            .attr("class", "blue")
            .attr("type", "Loss")
            .attr("cx", d => x(d.value)+30)
            .attr("cy", "220")
            .attr("r", 6)
            .attr("stroke", "black")
            .attr("fill", "blue");

        // Get all circles
        let circles = svg.selectAll("circle");

        // When the circles are hovered
        circles.on("mouseover", function() {
            // Set the stroke to white
            let circle = d3.select(this);
            circle.attr("stroke", "white");
        })
        // When the circles are no longer hovered
        .on("mouseout", function() {
            // Set the stroke to black
            let circle = d3.select(this);
            circle.attr("stroke", "black");
        })
        // When the circles are clicked
        .on("click", function() {
            // Get the game data from the circle element
            let circle = d3.select(this);
            let data = circle["_groups"][0][0]["__data__"].key;

            // Display the scoreboards if they were hidden
            d3.select("#scoreboards").style("display", "");
            // Reset all "selected" elements 
            d3.select("#player-table").selectAll(".selected").classed("selected", false);

            // Update all other charts to reflect the new game
            globalApplicationState.players.FillOrangeScoreBoard(data);
            globalApplicationState.players.FillBlueScoreBoard(data);
            globalApplicationState.players.AddGameCoreStatsCharts(data);
            globalApplicationState.players.AddButtonHandlers(data);
        });
    }

    FillBeeSwarmChart(data) {
        let beeSvg = d3.select("#beeswarm-chart");

        // Create players and games Set
        let players = new Set();
        let games = new Set();

        // For each game
        data.forEach(function (game) {
            // If there were players on the blue team
            if (game["blue"]["players"] != undefined)
            {
                // Add each player to the players set
                game["blue"]["players"].forEach(player => players.add(player["name"]));
            }
            
            // If there were players on the orange team and there was not a tie (rare occurence when games start/end incorrectly)
            else if (game["orange"]["players"] != undefined && game["orange"]["stats"]["core"]["goals"] != game["orange"]["stats"]["core"]["goals_against"])
            {
                // Add each player to the players set
                game["orange"]["players"].forEach(player => players.add(player["name"]));            
            }
            // Add the game to the games set
            games.add(game["id"]);
        });

        // Variable initializations
        let swarmData = [];
        let playersObj = this;
        let maxWL = 0; 
        let minWL = 1000000000;
        let maxTotal = 5;

        // Create x-axis scale
        let xScale = d3.scaleLinear()
            .domain([-1, 5])
            .range([30, 750]);
        
        // Create y-axis scale
        let yScale = d3.scaleLinear()
            .domain([0, 90])
            .range([0, 50]);

        // For each player
        players.forEach(function(player) {
            // Get the player's win/loss data
            let winData = playersObj.GetWinLoss(data, player);

            // If the player has won less than 5 games, prevent them from appearing on bee swarm chart
            if (winData.total < 5)
            {
                return;
            }

            // Keep track of maximum win/loss ratio
            if (winData.ratio > maxWL)
            {
                maxWL = winData.ratio;
            }

            // Keep track of minimum win/loss ratio
            if (winData.ratio < minWL) {
                minWL = winData.ratio;
            }

            // Keep track of maximum win total
            if (winData.total > maxTotal) {
                maxTotal = winData.total;
            }

            // Push the player's data to the swarmData array
            swarmData.push({
                player: player, 
                wl: winData.ratio,
                total: winData.total,
                x: xScale(winData.ratio),
                y: yScale(winData.total)
            });
        });

        // Filter the data
        swarmData = swarmData.filter(d => d.total >= 5);

        // Create the x-axis
        xScale = d3.scaleLinear()
            .domain([minWL - 0.1, maxWL])
            .range([30, 750]);
        xScale.nice();

        beeSvg.append("g")
        .attr("transform", "translate(0,35)")
        .call(d3.axisBottom(xScale));

        // Add the x-axis label
        beeSvg.append("text")
            .attr('x', 300)
            .attr('y', 20)
            .text("Win / Loss Ratio of Player")
            .style("fill", "white");

        // Create radius scaling
        let rScale = d3.scaleLinear()
            .domain([9, maxTotal])
            .range([4,10]);

        let object = this;
        let c = null;
        
        // Axis ticks
        beeSvg.selectAll("line").append("line")
            .data([-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50])
            .join("line")
            .attr("x1", d => xScale(d))
            .attr("x2", d => xScale(d))
            .attr("y1", 20)
            .attr("y2", 30)
            .style("stroke", "black")
            .style("stroke-width", 1);

        // Create force simulation
        d3.forceSimulation(swarmData)
            .force("x", d3.forceX(d => xScale(d.wl)).strength(.1))
            .force("y", d3.forceY(d => d.y+105).strength(0.05))
            .force("collide", d3.forceCollide(d => rScale(d.total) + 1))
            .alphaDecay(0)
            .alpha(0.3)
            .tick(1000)
            .stop();

        // Add the circles
        swarmData.forEach(function(d) {
            let id = d.player;
            c = beeSvg.append("circle")
                .attr('id', id)
                .attr('cx', xScale(d.wl))
                .attr('cy', d.y)
                .attr('r', rScale(d.total))
                .attr('stroke', 'black')
                .attr('fill', 'pink');

        // Tooltip handler
        let ttHTML = '<h6>' + d.player + '</h6><p>Win/Loss ratio: ' + d.wl + '</p><p>Total games: ' + d.total + '</p>';
        object.AddTooltipHandler(ttHTML, c);

        // When a bubble is clicked, update the games table and bubble chart
        c.on("click", function(event, d) {
            let dropdown = d3.select("#player-select");
            let name = d3.select(this).attr("id");

            let options = dropdown["_groups"][0][0];
            let index = 0;
            for (let i = 0; i < options.length; i++) {
                if (options[i].label == name)
                {
                    index = i;
                }
            }

            dropdown.property('selectedIndex', index);

            globalApplicationState.players.FillPlayersTable(data);
            //playerName = d3.select("#player-select  option:checked").property("label");
            globalApplicationState.players.FillBubbleChart(data, name);
        });
    });
    }

    GetWinLoss(data, player) {
        let games = [];
        let playerObj = this;
        // For each game
        data.forEach(function (game) {
            let players_temp = [];

            // If there were players on the blue team
            if (game["blue"]["players"] != undefined) {
                // For each player on the blue team
                game["blue"]["players"].forEach(function (p) {
                    // If the player was on the blue team, push the game to games array
                    if (player == p["name"])
                    {
                        games.push(game);
                    }
                });
            }
                
            // If there were players on the orange team
            else if (game["orange"]["players"] != undefined) {
                // For each player on the orange team
                game["orange"]["players"].forEach(function (p) {
                    // If the player was on the orange team, push the game to games array
                    if (player == p["name"])
                    {
                        games.push(game);
                    }
                });
            }
        });

        let wins = 0;
        let losses = 0;

        let temp = new Set();
        // For each game
        games.forEach(function(game) {
            // If the game has not been scanned
            if (!temp.has(game["id"]))
            {
                // Get the result of the game, and increment wins or losses
                let result = playerObj.IsWin(game, player);
                let win = result[0];
                let score = result[1];
                if (win)
                {
                    wins++;
                }
                else
                {
                    losses++;
                }
                temp.add(game["id"]);
            }
        });
        // Prevent infinity win/loss
        if (losses == 0) {
            losses = 1;
        }
        // Calculate the win/loss ratio
        let ratio = Math.round((wins / losses)*100)/100;
        // Return a tuple of ratio/total games
        return {
            ratio: ratio, 
            total: (wins + losses)
        };
       
    }

    IsWin(game, player)
    {
        let score = 0;
        // If there was a tie, return
        if (game["orange"]["stats"]["core"]["goals"] == game["orange"]["stats"]["core"]["goals_against"])
        {
            return [false, score];        
        }   

        let onOrange = false;

        // For each player on orange
        game["orange"]["players"].forEach(function(p) {
            // If the player was on the orange team, set onOrange to true and update score
            if (p["name"] == player)
            {
                onOrange = true;
                score = p["stats"]["core"]["score"];
            }
        });
        // If the player was on blue, there were players on the blue team
        if (!onOrange && game["blue"]["players"] != undefined && game["blue"]["players"].length > 0)
        {
            // For each player on blue
            game["blue"]["players"].forEach(function(p) {
                // If the player was on the blue team, update score
                if (p["name"] == player)
                {
                    score = p["stats"]["core"]["score"];
                }
            });
        }

        // If the player was on orange
        if (onOrange)
        {
            // If the orange team won
            if (game["orange"]["stats"]["core"]["goals"] > game["orange"]["stats"]["core"]["goals_against"])
            {
                return [true, score];        
            }   
            // If the orange team lost
            else 
            {
                return [false, score];
            }
        }
        // If the player was on blue
        else {
            // If the blue team won
            if (game["blue"]["stats"]["core"]["goals"] > game["blue"]["stats"]["core"]["goals_against"])
            {
                return [true, score];        
            }  
            // If the blue team lost 
            else 
            {
                return [false, score];
            }
        }
    }

    AddTableHeaders(data) {
        // Select the svg
        let svg = d3.select("#page-header");

        // Add the select player text
        svg.append("text")
        .text("Select Player: ")
        .style("margin-top", "95px")
        .style("margin-left", "10px")
        .style("color", "white");

        // Add the select a player dropdown
        let playerSelect = svg.append("select")
        .attr("id", "player-select")
        .attr("label", "Select Player: ")
        .style("margin-top", "50px");

        let playerData = [];
        let gameSet = new Set();

        // Add the or use chart below text
        svg.append("text")
        .text("--- or use chart below ---")
        .style("margin-left", "10px")
        .style("color", "white");

        let players = new Set();
        // For each game
        data.forEach(function (game) {
            // If there were players on blue
            if (game["blue"]["players"] != undefined)
            {
                // Add the players on blue to the players set
                game["blue"]["players"].forEach(player => players.add(player["name"]));
            }
            
            // If there were players on orange
            if (game["orange"]["players"] != undefined && game["orange"]["stats"]["core"]["goals"] != game["orange"]["stats"]["core"]["goals_against"])
            {
                // Add the players on orange to the players set
                game["orange"]["players"].forEach(player => players.add(player["name"]));
            }
        });

        // For each player, add them to the dropdown as an option
        players.forEach( function(player) {
            playerSelect.append("option")
            .attr("label", player);
        });

        // Get the current selected player
        let playerName = d3.select("#player-select  option:checked").property("label");
        
        // For each game
        data.forEach(function (game) {
            let players = [];

            // If the game has not yet been scanned
            if (!gameSet.has(game["id"]))
            {
                gameSet.add(game["id"]);

                // If there were players on blue
                if (game["blue"]["players"] != undefined)
                {
                    // Add each player on blue to the players array
                    game["blue"]["players"].forEach(player => players.push(player["name"]));
                }
                
                // If there were players on orange
                if (game["orange"]["players"] != undefined)
                {
                    // Add each player on orange to the players array
                    game["orange"]["players"].forEach(player => players.push(player["name"]));
                }
    
                // If the player appeared on either team in this game
                if (players.includes(playerName))
                {
                    // If there was not a tie, push the game to the playerData
                    if (game["orange"]["stats"]["core"]["goals"] != game["orange"]["stats"]["core"]["goals_against"])
                    {
                        playerData.push(game);
                    }       
                }
            }
        });
        
        // When the toggle group slider is clicked, redraw the charts
        playerSelect.on("change", function () {
           globalApplicationState.players.FillPlayersTable(data);
           playerName = d3.select("#player-select  option:checked").property("label");
           globalApplicationState.players.FillBubbleChart(data, playerName);
        });
    }

    AddSortingHandlers(data) {
        let headers = d3.select("#player-table");

        // When any of the headers are clicked
        headers.selectAll("th")
        .on("click", (d) => {
            let playerName = d3.select("#player-select  option:checked").property("label");
            // Set all column as not the sorting column
            d3.selectAll("th").classed("sorting", false); // ***
            // Reset the "i" element; essentially add no-display and remove sort-down and sort-up icons so they don't display
            d3.selectAll("i").attr("class", "fas no-display").classed("fa-solid fa-sort-down", false).classed("fa-solid fa-sort-up", false);

            if (d['srcElement'].innerText == "Game ")
            {          
                let source = d3.select(d.srcElement);
                source.classed("sorting", true);
                let i = source.select("i");
                // If this column is in ascending order     
                if (this.headerData[0].ascending)
                {
                    data.sort((x, y) => x["date"] < y["date"] ? 1 : -1); // Sort the data
                    i.classed("no-display", false); // Remove the "no-display" class
                    i.classed("fa-solid fa-sort-down", false); // Add the sort up icon
                    i.classed("fa-solid fa-sort-up", true); // Remove the sort up button
                }  
                else
                {                    
                    data.sort((x, y) => x["date"] < y["date"] ? -1 : 1); // Sort the data
                    i.classed("no-display", false); // Remove the "no-display" class
                    i.classed("fa-solid fa-sort-up", false); // Remove the sort up icon
                    i.classed("fa-solid fa-sort-down", true); // Add the sort up button
                }
                this.headerData[0].ascending = !this.headerData[0].ascending;
            }
            else if (d['srcElement'].innerText == "W/L  ")
            {
                let source = d3.select(d.srcElement);
                source.classed("sorting", true);
                let i = source.select("i");
                // If this column is in ascending order
                if (this.headerData[1].ascending)
                {           
                    data.sort(function(x, y) {
                            let isOrangeX = false;
                            let isOrangeY = false;

                            // Gets whether player was orange in game x
                            x["orange"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    isOrangeX = true;
                                }
                            });
                            // Gets whether player was orange in game y
                            y["orange"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    isOrangeY = true;
                                }
                            });

                            // If player is orange in X and blue in Y, check if orange won in X and orange won in Y
                            if(isOrangeX && !isOrangeY)
                            {
                                return (x["orange"]["stats"]["core"]["goals"] > x["blue"]["stats"]["core"]["goals"]) &&
                                (y["blue"]["stats"]["core"]["goals"] < y["orange"]["stats"]["core"]["goals"]) ? 1 : -1;
                            }
                            // If player is blue in X and orange in Y, check if blue won in X and blue won in Y
                            else if(!isOrangeX && isOrangeY)
                            {
                                return (x["orange"]["stats"]["core"]["goals"] < x["blue"]["stats"]["core"]["goals"]) &&
                                (y["blue"]["stats"]["core"]["goals"] > y["orange"]["stats"]["core"]["goals"]) ? 1 : -1;
                            }
                            // If player is blue in X and blue in Y, check if blue won in X and orange won in Y
                            else if(!isOrangeX && !isOrangeY)
                            {
                                return (x["orange"]["stats"]["core"]["goals"] < x["blue"]["stats"]["core"]["goals"]) &&
                                (y["blue"]["stats"]["core"]["goals"] < y["orange"]["stats"]["core"]["goals"]) ? 1 : -1;
                            }
                            // If the player is orange on X and orange on Y, check if orange won in X and blue won in Y
                            else if (isOrangeX && isOrangeY)
                            {
                                return (x["orange"]["stats"]["core"]["goals"] > x["blue"]["stats"]["core"]["goals"]) &&
                                (y["blue"]["stats"]["core"]["goals"] > y["orange"]["stats"]["core"]["goals"]) ? 1 : -1;
                            }

                            // Unreachable
                            return -1;
                    });
                    // Sort the data
                    // Get this element and set it to sorting column
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-down", false);
                    i.classed("fa-solid fa-sort-up", true);
                }
                else
                {
                    data.sort(function(x, y) {
                        let isOrangeX = false;
                        let isOrangeY = false;

                        // Gets whether player was orange in game x
                        x["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeX = true;
                            }
                        });
                        // Gets whether player was orange in game y
                        y["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeY = true;
                            }
                        });

                        // If player is orange in X and blue in Y, check if orange won in X and orange won in Y
                        if(isOrangeX && !isOrangeY)
                        {
                            return (x["orange"]["stats"]["core"]["goals"] > x["blue"]["stats"]["core"]["goals"]) &&
                            (y["blue"]["stats"]["core"]["goals"] < y["orange"]["stats"]["core"]["goals"]) ? -1 : 1;
                        }
                        // If player is blue in X and orange in Y, check if blue won in X and blue won in Y
                        else if(!isOrangeX && isOrangeY)
                        {
                            return (x["orange"]["stats"]["core"]["goals"] < x["blue"]["stats"]["core"]["goals"]) &&
                            (y["blue"]["stats"]["core"]["goals"] > y["orange"]["stats"]["core"]["goals"]) ? -1 : 1;
                        }
                        // If player is blue in X and blue in Y, check if blue won in X and orange won in Y
                        else if(!isOrangeX && !isOrangeY)
                        {
                            return (x["orange"]["stats"]["core"]["goals"] < x["blue"]["stats"]["core"]["goals"]) &&
                            (y["blue"]["stats"]["core"]["goals"] < y["orange"]["stats"]["core"]["goals"]) ? -1 : 1;
                        }
                        // If the player is orange on X and orange on Y, check if orange won in X and blue won in Y
                        else if (isOrangeX && isOrangeY)
                        {
                            return (x["orange"]["stats"]["core"]["goals"] > x["blue"]["stats"]["core"]["goals"]) &&
                            (y["blue"]["stats"]["core"]["goals"] > y["orange"]["stats"]["core"]["goals"]) ? -1 : 1;
                        }

                        // Unreachable
                        return 1;
                });      
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-up", false);
                    i.classed("fa-solid fa-sort-down", true);         
                }

                this.headerData[1].ascending = !this.headerData[1].ascending;
            }
            else if (d['srcElement'].innerText == "Goals  ")
            {
                let source = d3.select(d.srcElement);
                source.classed("sorting", true);
                let i = source.select("i");
                // If this column is in ascending order
                if (this.headerData[2].ascending)
                {                    
                    data.sort(function(x, y) {
                        let isOrangeX = false;
                        let orangeGoalsX = 0;
                        let blueGoalsX = 0;
                        let isOrangeY = false;
                        let orangeGoalsY = 0;
                        let blueGoalsY = 0;

                        // Gets whether player was orange in game x
                        x["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeX = true;
                                orangeGoalsX = player["stats"]["core"]["goals"];
                            }
                        });
                        // Gets whether player was orange in game y
                        y["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeY = true;
                                orangeGoalsY = player["stats"]["core"]["goals"];
                            }
                        });
                        // Gets goals of player if they were blue in game X
                        if (!isOrangeX && x["blue"]["players"] != undefined)
                        {
                            x["blue"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    blueGoalsX = player["stats"]["core"]["goals"];
                                }
                            });
                        }
                        if (!isOrangeY && y["blue"]["players"] != undefined)
                        {   
                            // Gets goals of player if they were blue in game Y
                            y["blue"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    blueGoalsY = player["stats"]["core"]["goals"];
                                }
                            });
                        }

                        // If player is orange in X and blue in Y, check if orange won in X and orange won in Y
                        if(isOrangeX && !isOrangeY)
                        {
                            return orangeGoalsX > blueGoalsY ? 1 : -1;
                        }
                        // If player is blue in X and orange in Y, check if blue won in X and blue won in Y
                        else if(!isOrangeX && isOrangeY)
                        {
                            return blueGoalsX > orangeGoalsY ? 1 : -1;
                        }
                        // If player is blue in X and blue in Y, check if blue won in X and orange won in Y
                        else if(!isOrangeX && !isOrangeY)
                        {
                            return blueGoalsX > blueGoalsY ? 1 : -1;
                        }
                        // If the player is orange on X and orange on Y, check if orange won in X and blue won in Y
                        else if (isOrangeX && isOrangeY)
                        {
                            return orangeGoalsX > orangeGoalsY ? 1 : -1;
                        }

                        // Unreachable
                        return -1;
                });
                    i.classed("fa-solid fa-sort-down", false);
                    i.classed("fa-solid fa-sort-up", true);
                }
                else
                {
                    data.sort(function(x, y) {
                        let isOrangeX = false;
                        let orangeGoalsX = 0;
                        let blueGoalsX = 0;
                        let isOrangeY = false;
                        let orangeGoalsY = 0;
                        let blueGoalsY = 0;

                        // Gets whether player was orange in game x
                        x["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeX = true;
                                orangeGoalsX = player["stats"]["core"]["goals"];
                            }
                        });
                        // Gets whether player was orange in game y
                        y["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeY = true;
                                orangeGoalsY = player["stats"]["core"]["goals"];
                            }
                        });
                        // Gets goals of player if they were blue in game X
                        if (!isOrangeX && x["blue"]["players"] != undefined)
                        {
                            x["blue"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    blueGoalsX = player["stats"]["core"]["goals"];
                                }
                            });
                        }
                        if (!isOrangeY && y["blue"]["players"] != undefined)
                        {   
                            // Gets goals of player if they were blue in game Y
                            y["blue"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    blueGoalsY = player["stats"]["core"]["goals"];
                                }
                            });
                        }

                        // If player is orange in X and blue in Y, check if orange won in X and orange won in Y
                        if(isOrangeX && !isOrangeY)
                        {
                            return orangeGoalsX > blueGoalsY ? -1 : 1;
                        }
                        // If player is blue in X and orange in Y, check if blue won in X and blue won in Y
                        else if(!isOrangeX && isOrangeY)
                        {
                            return blueGoalsX > orangeGoalsY ? -1 : 1;
                        }
                        // If player is blue in X and blue in Y, check if blue won in X and orange won in Y
                        else if(!isOrangeX && !isOrangeY)
                        {
                            return blueGoalsX > blueGoalsY ? -1 : 1;
                        }
                        // If the player is orange on X and orange on Y, check if orange won in X and blue won in Y
                        else if (isOrangeX && isOrangeY)
                        {
                            return orangeGoalsX > orangeGoalsY ? -1 : 1;
                        }

                        // Unreachable
                        return -1;
                });
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-up", false);
                    i.classed("fa-solid fa-sort-down", true);       
                }

                this.headerData[2].ascending = !this.headerData[2].ascending;
            }
            else if (d['srcElement'].innerText == "Assists  ")
            {
                let source = d3.select(d.srcElement);
                source.classed("sorting", true);
                let i = source.select("i");
                // If this column is in ascending order
                if (this.headerData[3].ascending)
                {                   
                    data.sort(function(x, y) {
                        let isOrangeX = false;
                        let orangeAssistsX = 0;
                        let blueAssistsX = 0;
                        let isOrangeY = false;
                        let orangeAssistsY = 0;
                        let blueAssistsY = 0;

                        // Gets whether player was orange in game x
                        x["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeX = true;
                                orangeAssistsX = player["stats"]["core"]["assists"];
                            }
                        });
                        // Gets whether player was orange in game y
                        y["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeY = true;
                                orangeAssistsY = player["stats"]["core"]["assists"];
                            }
                        });
                        // Gets goals of player if they were blue in game X
                        if (!isOrangeX && x["blue"]["players"] != undefined)
                        {
                            x["blue"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    blueAssistsX = player["stats"]["core"]["assists"];
                                }
                            });
                        }
                        if (!isOrangeY && y["blue"]["players"] != undefined)
                        {   
                            // Gets goals of player if they were blue in game Y
                            y["blue"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    blueAssistsY = player["stats"]["core"]["assists"];
                                }
                            });
                        }

                        // If player is orange in X and blue in Y, check if orange won in X and orange won in Y
                        if(isOrangeX && !isOrangeY)
                        {
                            return orangeAssistsX > blueAssistsY ? 1 : -1;
                        }
                        // If player is blue in X and orange in Y, check if blue won in X and blue won in Y
                        else if(!isOrangeX && isOrangeY)
                        {
                            return blueAssistsX > orangeAssistsY ? 1 : -1;
                        }
                        // If player is blue in X and blue in Y, check if blue won in X and orange won in Y
                        else if(!isOrangeX && !isOrangeY)
                        {
                            return blueAssistsX > blueAssistsY ? 1 : -1;
                        }
                        // If the player is orange on X and orange on Y, check if orange won in X and blue won in Y
                        else if (isOrangeX && isOrangeY)
                        {
                            return orangeAssistsX > orangeAssistsY ? 1 : -1;
                        }

                        // Unreachable
                        return -1;
                });
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-down", false);
                    i.classed("fa-solid fa-sort-up", true);
                }
                else
                {
                    data.sort(function(x, y) {
                        let isOrangeX = false;
                        let orangeAssistsX = 0;
                        let blueAssistsX = 0;
                        let isOrangeY = false;
                        let orangeAssistsY = 0;
                        let blueAssistsY = 0;

                        // Gets whether player was orange in game x
                        x["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeX = true;
                                orangeAssistsX = player["stats"]["core"]["assists"];
                            }
                        });
                        // Gets whether player was orange in game y
                        y["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeY = true;
                                orangeAssistsY = player["stats"]["core"]["assists"];
                            }
                        });
                        // Gets goals of player if they were blue in game X
                        if (!isOrangeX && x["blue"]["players"] != undefined)
                        {
                            x["blue"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    blueAssistsX = player["stats"]["core"]["assists"];
                                }
                            });
                        }
                        if (!isOrangeY && y["blue"]["players"] != undefined)
                        {   
                            // Gets goals of player if they were blue in game Y
                            y["blue"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    blueAssistsY = player["stats"]["core"]["assists"];
                                }
                            });
                        }

                        // If player is orange in X and blue in Y, check if orange won in X and orange won in Y
                        if(isOrangeX && !isOrangeY)
                        {
                            return orangeAssistsX > blueAssistsY ? -1 : 1;
                        }
                        // If player is blue in X and orange in Y, check if blue won in X and blue won in Y
                        else if(!isOrangeX && isOrangeY)
                        {
                            return blueAssistsX > orangeAssistsY ? -1 : 1;
                        }
                        // If player is blue in X and blue in Y, check if blue won in X and orange won in Y
                        else if(!isOrangeX && !isOrangeY)
                        {
                            return blueAssistsX > blueAssistsY ? -1 : 1;
                        }
                        // If the player is orange on X and orange on Y, check if orange won in X and blue won in Y
                        else if (isOrangeX && isOrangeY)
                        {
                            return orangeAssistsX > orangeAssistsY ? -1 : 1;
                        }

                        // Unreachable
                        return -1;
                }); 
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-up", false);
                    i.classed("fa-solid fa-sort-down", true);         
                }

                this.headerData[3].ascending = !this.headerData[3].ascending;
            }
            else if (d['srcElement'].innerText == "Saves  ")
            {
                let source = d3.select(d.srcElement);
                source.classed("sorting", true);
                let i = source.select("i");
                // If this column is in ascending order
                if (this.headerData[3].ascending)
                {                   
                    data.sort(function(x, y) {
                        let isOrangeX = false;
                        let orangeSavesX = 0;
                        let blueSavesX = 0;
                        let isOrangeY = false;
                        let orangeSavesY = 0;
                        let blueSavesY = 0;

                        // Gets whether player was orange in game x
                        x["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeX = true;
                                orangeSavesX = player["stats"]["core"]["saves"];
                            }
                        });
                        // Gets whether player was orange in game y
                        y["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeY = true;
                                orangeSavesY = player["stats"]["core"]["saves"];
                            }
                        });
                        // Gets goals of player if they were blue in game X
                        if (!isOrangeX && x["blue"]["players"] != undefined)
                        {
                            x["blue"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    blueSavesX = player["stats"]["core"]["saves"];
                                }
                            });
                        }
                        if (!isOrangeY && y["blue"]["players"] != undefined)
                        {   
                            // Gets goals of player if they were blue in game Y
                            y["blue"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    blueSavesY = player["stats"]["core"]["saves"];
                                }
                            });
                        }

                        // If player is orange in X and blue in Y, check if orange won in X and orange won in Y
                        if(isOrangeX && !isOrangeY)
                        {
                            return orangeSavesX > blueSavesY ? 1 : -1;
                        }
                        // If player is blue in X and orange in Y, check if blue won in X and blue won in Y
                        else if(!isOrangeX && isOrangeY)
                        {
                            return blueSavesX > orangeSavesY ? 1 : -1;
                        }
                        // If player is blue in X and blue in Y, check if blue won in X and orange won in Y
                        else if(!isOrangeX && !isOrangeY)
                        {
                            return blueSavesX > blueSavesY ? 1 : -1;
                        }
                        // If the player is orange on X and orange on Y, check if orange won in X and blue won in Y
                        else if (isOrangeX && isOrangeY)
                        {
                            return orangeSavesX > orangeSavesY ? 1 : -1;
                        }

                        // Unreachable
                        return -1;
                });
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-down", false);
                    i.classed("fa-solid fa-sort-up", true);
                }
                else
                {
                    data.sort(function(x, y) {
                        let isOrangeX = false;
                        let orangeAssistsX = 0;
                        let blueAssistsX = 0;
                        let isOrangeY = false;
                        let orangeAssistsY = 0;
                        let blueAssistsY = 0;

                        // Gets whether player was orange in game x
                        x["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeX = true;
                                orangeAssistsX = player["stats"]["core"]["saves"];
                            }
                        });
                        // Gets whether player was orange in game y
                        y["orange"]["players"].forEach(function(player) {
                            if (player["name"] == playerName)
                            {
                                isOrangeY = true;
                                orangeAssistsY = player["stats"]["core"]["saves"];
                            }
                        });
                        // Gets goals of player if they were blue in game X
                        if (!isOrangeX && x["blue"]["players"] != undefined)
                        {
                            x["blue"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    blueAssistsX = player["stats"]["core"]["saves"];
                                }
                            });
                        }
                        if (!isOrangeY && y["blue"]["players"] != undefined)
                        {   
                            // Gets goals of player if they were blue in game Y
                            y["blue"]["players"].forEach(function(player) {
                                if (player["name"] == playerName)
                                {
                                    blueAssistsY = player["stats"]["core"]["saves"];
                                }
                            });
                        }

                        // If player is orange in X and blue in Y, check if orange won in X and orange won in Y
                        if(isOrangeX && !isOrangeY)
                        {
                            return orangeAssistsX > blueAssistsY ? -1 : 1;
                        }
                        // If player is blue in X and orange in Y, check if blue won in X and blue won in Y
                        else if(!isOrangeX && isOrangeY)
                        {
                            return blueAssistsX > orangeAssistsY ? -1 : 1;
                        }
                        // If player is blue in X and blue in Y, check if blue won in X and orange won in Y
                        else if(!isOrangeX && !isOrangeY)
                        {
                            return blueAssistsX > blueAssistsY ? -1 : 1;
                        }
                        // If the player is orange on X and orange on Y, check if orange won in X and blue won in Y
                        else if (isOrangeX && isOrangeY)
                        {
                            return orangeAssistsX > orangeAssistsY ? -1 : 1;
                        }

                        // Unreachable
                        return -1;
                }); 
                    i.classed("no-display", false);
                    i.classed("fa-solid fa-sort-up", false);
                    i.classed("fa-solid fa-sort-down", true);         
                }

                this.headerData[3].ascending = !this.headerData[3].ascending;
            }
            // Redraw the table with the new sorted data
            this.FillPlayersTable(data);
        });
    }

    FillPlayersTable(data) {

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

        // For each game
        data.forEach(function (game) {
            let players = [];

            // If the game is yet to be scanned
            if (!gameSet.has(game["id"]))
            {
                gameSet.add(game["id"]);

                // If there were players on blue
                if (game["blue"]["players"] != undefined)
                {
                    // Add each player to the list of players
                    game["blue"]["players"].forEach(player => players.push(player["name"]));
                }
                
                // If there were players on orange
                if (game["orange"]["players"] != undefined)
                {
                    // Add each player to the list of players
                    game["orange"]["players"].forEach(player => players.push(player["name"]));
                }
    
                // If the player played in this game
                if (players.includes(playerName))
                {
                    // If there was not a tie, push the game to playerData
                    if (game["orange"]["stats"]["core"]["goals"] != game["orange"]["stats"]["core"]["goals_against"])
                    {
                        playerData.push(game);
                    }       
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

                row.style("background-color", "#292A2E");
            })
            .on("mouseout", function() {
                let row = d3.select(this).select("svg");
                row.style("background-color", "#212122");
            })
            .on("click", this.RowClickHandler);
        
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

            // If the player was on blue
            if (onBlue)
            {
                // Set row text to W if blue won, L if orange won
                if (blueGoals > orangeGoals)
                {
                    return "W";
                }
                else
                {
                    return "L";
                }
            }
            // If the player was on orange
            else
            {
                // Set row text to W if orange won, L if blue won
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
        .attr("transform", "translate(190,15)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player goals
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {
            let playerGameData = null;
            let orangePlayers = d["orange"]["players"];

            // For each player on orange, check if the player is the one we are looking for
            orangePlayers.forEach(function(player) {
                if (player["name"] == playerName)
                {
                    playerGameData = player;
                }
            });

            // If player was not found on orange
            if (playerGameData == null)
            {
                let bluePlayers = d["blue"]["players"];

                // For each player on blue, check if the player is the one we are looking for
                bluePlayers.forEach(function(player) {
                    if (player["name"] == playerName)
                    {
                        playerGameData = player;
                    }
                });
            }

            return playerGameData["stats"]["core"]["goals"];
        })
        .attr("transform", "translate(375,15)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player assists
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {
            let playerGameData = null;
            let orangePlayers = d["orange"]["players"];

            // For each player on orange, check if the player is the one we are looking for
            orangePlayers.forEach(function(player) {
                if (player["name"] == playerName)
                {
                    playerGameData = player;
                }
            });

            // If player was not found on orange
            if (playerGameData == null)
            {
                let bluePlayers = d["blue"]["players"];

                // For each player on blue, check if the player is the one we are looking for
                bluePlayers.forEach(function(player) {
                    if (player["name"] == playerName)
                    {
                        playerGameData = player;
                    }
                });
            }

            return playerGameData["stats"]["core"]["assists"];
        })
        .attr("transform", "translate(560,15)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player saves
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {
            let playerGameData = null;
            let orangePlayers = d["orange"]["players"];

            // For each player on orange, check if the player is the one we are looking for
            orangePlayers.forEach(function(player) {
                if (player["name"] == playerName)
                {
                    playerGameData = player;
                }
            });
            
            // If player was not found on orange
            if (playerGameData == null)
            {
                let bluePlayers = d["blue"]["players"];

                // For each player on blue, check if the player is the one we are looking for
                bluePlayers.forEach(function(player) {
                    if (player["name"] == playerName)
                    {
                        playerGameData = player;
                    }
                });
            }

            return playerGameData["stats"]["core"]["saves"];
        })
        .attr("transform", "translate(735,15)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");
    }

    RowClickHandler() {
        d3.select("#scoreboards").style("display", "");
        let data = d3.select(this)._groups["0"]["0"]["__data__"];
        
        // Reset all "selected" elements 
        d3.select("#player-table").selectAll(".selected").classed("selected", false);
        // Update selected row color
        let row = d3.select(this).select("svg");
        row.classed("selected", true);

        // Update charts
        globalApplicationState.players.FillOrangeScoreBoard(data);
        globalApplicationState.players.FillBlueScoreBoard(data);
        globalApplicationState.players.AddGameCoreStatsCharts(data);
        globalApplicationState.players.AddButtonHandlers(data);
    }

    FillOrangeScoreBoard(data) {
        // Reset table
        d3.select('#orange-table-body')
        .selectAll('tr')
        .remove();

        d3.select('#orange-table-body')
        .selectAll('td')
        .remove();
            
        let table = d3.select("#orange-table");

        let gameData = data;

        this.orangePlayerData = gameData["orange"]["players"];
            
        // Add table row data
        let trs = d3.select('#orange-table-body')
            .selectAll('tr')
            .data(this.orangePlayerData)
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
        .attr("transform", "translate(195,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player goals
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["goals"];
        })
        .attr("transform", "translate(310,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player assists
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["assists"];
        })
        .attr("transform", "translate(430,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player saves
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["saves"];
        })
        .attr("transform", "translate(540,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player shots
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["shots"];
        })
        .attr("transform", "translate(645,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player demos
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["demo"]["inflicted"];
        })
        .attr("transform", "translate(740,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");
    }

    FillBlueScoreBoard(data) {
        // Reset table
        d3.select('#blue-table-body')
        .selectAll('tr')
        .remove();

        d3.select('#blue-table-body')
        .selectAll('td')
        .remove();
            
        let table = d3.select("#blue-table");

        let gameData = data;

        this.bluePlayerData = gameData["blue"]["players"];
            
        // add table row data
        let trs = d3.select('#blue-table-body')
            .selectAll('tr')
            .data(this.bluePlayerData)
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
        .attr("transform", "translate(195,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player goals
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["goals"];
        })
        .attr("transform", "translate(310,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player assists
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["assists"];
        })
        .attr("transform", "translate(430,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player saves
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["saves"];
        })
        .attr("transform", "translate(540,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player shots
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["shots"];
        })
        .attr("transform", "translate(645,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player demos
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["demo"]["inflicted"];
        })
        .attr("transform", "translate(740,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");
    }

    AddButtonHandlers(data) {
        let coreButton = d3.select("#core-button");
        let boostButton = d3.select("#boost-button");

        // When either button is clicked, call their respective function
        boostButton.on("click", function() {globalApplicationState.players.AddBoostStatsCharts(data) });
        coreButton.on("click", function() { globalApplicationState.players.AddGameCoreStatsCharts(data) });
    }

    AddTooltipHandler(ttHTML, hoverObject) {
        // Create tooltip div
        let tt = d3.select("body")
            .append("div")
            .style("background-color", "white")
            .style("opacity", 0.8)
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("padding", "0px")
            .style("border-radius", "10px");
    
        // When the given object is hovered, set the tooltip to visible
        hoverObject.on("mouseover", function (event, d) {
            tt
                .style("visibility", "visible")
                .html(ttHTML);
            })
            // When the mouse moves, move the tooltip with it
            .on("mousemove", function (event, d) {
                tt
                    .style("top", (event.pageY + 8) + "px")
                    .style("left", (event.pageX + 8) + "px");
            })
            // When the mouse leaves, hide the tooltip
            .on("mouseout", function () {
                tt.style("visibility", "hidden");
            });
    }

    AddGameCoreStatsCharts(data) {      
        // Update the visibility of various charts    
        d3.select("#game-visualization-div").style("display", "");
        d3.select("#stat-visualization-div").style("display", "").style("margin-left", "400px");
        d3.select("#game-visualizations").style("position", "");
        d3.select("#stat-list").style("margin-top", "0px");
        d3.select("#stats-text").text("Core stats");
        
        // Show core stat charts
        d3.select("#core-stats").style("display", "").style("margin-left", "400px");
        d3.select("#score-stats").style("display", "");
        d3.select("#shotpercentage-stats").style("display", "");
        d3.select("#demos-stats").style("display", "");

        // Hide boost stat charts
        d3.select("#team-bpm-stats").style("display", "none");
        d3.select("#team-avg-boost-stats").style("display", "none");
        d3.select("#team-time-boost-stats").style("display", "none");

        let svg = d3.select("#core-stats")
        .attr("width", "1100px")
        .attr("height", "430px");

        svg.data(data);

        // Update the various charts
        globalApplicationState.players.AddCoreStatsChart(data);
        globalApplicationState.players.AddScoreChart(data);
        globalApplicationState.players.AddShootingPercentageChart(data);
        globalApplicationState.players.AddDemosChart(data);
    }

    AddCoreStatsChart(data) {
        // Set gameData variable
        let gameData = data;
        // Set the x-axis label groups
        let groups = ["Goals", "Shots", "Assists", "Saves"];

        // Select the svg
        let svg = d3.select("#core-stats")
        .attr("width", "1100px")
        .attr("height", "430px")
        .style("margin-left", "420px");

        // Remove all previous elements
        svg.selectAll("rect").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        // Get orange team data
        let orangeShotsData = gameData["orange"]["stats"]["core"]["shots"];
        let orangeGoalsData = gameData["orange"]["stats"]["core"]["goals"];
        let orangeAssistsData = gameData["orange"]["stats"]["core"]["assists"];
        let orangeSavesData = gameData["orange"]["stats"]["core"]["saves"];

        // Get blue team data
        let blueShotsData = gameData["blue"]["stats"]["core"]["shots"];
        let blueGoalsData = gameData["blue"]["stats"]["core"]["goals"];
        let blueAssistsData = gameData["blue"]["stats"]["core"]["assists"];
        let blueSavesData = gameData["blue"]["stats"]["core"]["saves"];

        // Add X axis
        var x = d3.scaleBand()
        .domain(groups)
        .range([0, 1000])
        .padding([0.2])
        svg.append("g")
        .attr("transform", "translate(30,410)")
        .call(d3.axisBottom(x).tickSize(0));

        // Add Y axis
        var y = d3.scaleLinear()
        .domain(d3.extent([0,Math.max(orangeShotsData, Math.max(blueShotsData, Math.max(orangeSavesData, blueSavesData))) + 3]))
        .range([ 400, 0 ]);
        svg.append("g")
        .attr("transform", "translate(30,10)")
        .call(d3.axisLeft(y));

        let orangeData = [];

        // Push goals, shots, assists, and saves data to orangeData as dictionary
        orangeData.push({
            key: "Goals",
            value: orangeGoalsData
        });
        orangeData.push({
            key: "Shots",
            value: orangeShotsData
        });
        orangeData.push({
            key: "Assists",
            value: orangeAssistsData
        });
        orangeData.push({
            key: "Saves",
            value: orangeSavesData
        });

        // Initialize subgroup scale
        var xSubgroup = d3.scaleBand()
        .domain(groups)
        .range([0, 0]);

        //Show the bars
        svg.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(orangeData)
        .enter()
        .append("g")
            .attr("transform", function(d) { return "translate(" + (x(d.key)+40) + ",10)"; })
        .selectAll("rect")
        .data(d => [d])
        .enter().append("rect")
            .attr("class", "orange-core-rect")
            .attr("team", "orange")
            .attr("type", function(d) {return d.key.toLowerCase()})
            .attr("x", function(d) { return xSubgroup(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", 75)
            .attr("height", function(d) { return 400 - y(d.value); })
            .attr("fill", function(d) { return "orange"; });


        // Add tooltip handlers
        let rect = d3.selectAll(".orange-core-rect");
        let types = ["goals", "shots", "assists", "saves"];
        let players = this.orangePlayerData;

        // Setup tooltip html
        for (var i = 0; i < 4; i++)
        {
            let rectFiltered = rect.filter(function() {
                return d3.select(this).attr("type") == types[i] && d3.select(this).attr("team") == "orange";
            });

            var tooltipHTML = '<center><h5>' + gameData["orange"]["stats"]["core"][types[i]] + ' '  + types[i] + '</h5></center>';
                //var tooltipHTML = '';
            players.forEach( (d) => {
                tooltipHTML += '<p>' + d["name"] + ': <b>' + d["stats"]["core"][types[i]] + ' </b></p>';
            });

            globalApplicationState.players.AddTooltipHandler.call(this, tooltipHTML, rectFiltered);
        }



        let blueData = [];

        // Push goals, shots, assists, and saves data to blueData as dictionary
        blueData.push({
            key: "Goals",
            value: blueGoalsData
        });
        blueData.push({
            key: "Shots",
            value: blueShotsData
        });
        blueData.push({
            key: "Assists",
            value: blueAssistsData
        });
        blueData.push({
            key: "Saves",
            value: blueSavesData
        });

        svg.data(blueData);

        // Initialize subgroup scale
        var xSubgroup = d3.scaleBand()
        .domain(groups)
        .range([0, 0]);

        //Show the bars
        svg.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(blueData)
        .enter()
        .append("g")
            .attr("transform", function(d) { return "translate(" + (x(d.key) + 140) + ",10)"; })
        .selectAll("rect")
        .data(d => [d])
        .enter().append("rect")
            .attr("class", "blue-core-rect")
            .attr("team", "blue")
            .attr("type", function(d) {return d.key.toLowerCase()})
            .attr("x", function(d) { return xSubgroup(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", 75)
            .attr("height", function(d) { return 400 - y(d.value); })
            .attr("fill", function(d) { return "blue"; });

        // Add tooltip handlers
        rect = d3.selectAll(".blue-core-rect");
        players = this.bluePlayerData;
        // Setup tooltip html
        for (var i = 0; i < 4; i++)
        {
            let rectFiltered = rect.filter(function() {
                return d3.select(this).attr("type") == types[i] && d3.select(this).attr("team") == "blue";
            });
    
            var tooltipHTML = '<center><h5>' + gameData["blue"]["stats"]["core"][types[i]] + ' '  + types[i] + '</h5></center>';
                //var tooltipHTML = '';
            players.forEach( (d) => {
                tooltipHTML += '<p>' + d["name"] + ': <b>' + d["stats"]["core"][types[i]] + '</b></p>';
            });
    
            globalApplicationState.players.AddTooltipHandler.call(this, tooltipHTML, rectFiltered);
        }
    }
    
    AddScoreChart(data) {
        // Set gameData variable
        let gameData = data;
        // Set x-axis group labels
        let groups = ["Orange", "Blue"];

        // Select svg
        let svg = d3.select("#score-stats")
        .attr("width", "350px")
        .attr("height", "500px");

        // Remove all previous elements
        svg.selectAll("rect").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        // Add score text
        svg.append("text")
        .attr("x", 140)
        .attr("y", 485)
        .text("Score");

        // Get orange data
        let orangeScoreData = gameData["orange"]["stats"]["core"]["score"];
        
        // Get blue data
        let blueScoreData = gameData["blue"]["stats"]["core"]["score"];

        // Add X axis
        var x = d3.scaleBand()
        .domain(groups)
        .range([0, 300])
        svg.append("g")
        .attr("transform", "translate(30, 450)")
        .call(d3.axisBottom(x).tickSize(0));

        let maxScore = Math.max(blueScoreData, orangeScoreData);

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([0, maxScore+100])
        .range([ 400, 0 ]);
        y.nice();

        // Add Y axis
        svg.append("g")
        .attr("transform", "translate(30, 50)")
        .call(d3.axisLeft(y))

        // Add orange bar
        let oRect = svg.append("rect")
            .attr("x", 50)
            .attr("y", y(orangeScoreData))
            .attr("width", 75)
            .attr("height", 400 - y(orangeScoreData))
            .attr("fill", "orange")
            .attr("transform", "translate(15, 50)");

        //tooltip html
        let players = this.orangePlayerData;
        let ttHTMLOrange = '<center><h5>' + orangeScoreData + ' '  + ' pts</h5></center>';
            //var tooltipHTML = '';
        players.forEach( (d) => {
            ttHTMLOrange += '<p>' + d["name"] + ': <b>' + d["stats"]["core"]["score"] + '</b></p>';
        });
       
        // Add blue bar
        let bRect = svg.append("rect")
            .attr("x", 50)
            .attr("y", y(blueScoreData))
            .attr("width", 75)
            .attr("height", 400 - y(blueScoreData))
            .attr("fill", "blue")
            .attr("transform", "translate(170, 50)");

        //tooltip html
        players = this.bluePlayerData;
        let ttHTMLBlue = '<center><h5>' + blueScoreData + ' '  + ' pts</h5></center>';
            //var tooltipHTML = '';
        players.forEach( (d) => {
            ttHTMLBlue += '<p>' + d["name"] + ': <b>' + d["stats"]["core"]["score"] + '</b></p>';
        });

        // Update tooltip handlers
        globalApplicationState.players.AddTooltipHandler.call(this, ttHTMLOrange, oRect);
        globalApplicationState.players.AddTooltipHandler.call(this, ttHTMLBlue, bRect);
    }

    AddShootingPercentageChart(data) {
        // Set gameData variable
        let gameData = data;
        // Set x-axis group labels
        let groups = ["Orange", "Blue"];

        // Select svg
        let svg = d3.select("#shotpercentage-stats")
        .attr("width", "350px")
        .attr("height", "500px");

        // Remove all previous elements
        svg.selectAll("rect").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        // Add shooting percentage text
        svg.append("text")
        .attr("x", 100)
        .attr("y", 485)
        .text("Shooting Percentage")

        // Get orange data
        let orangeShotsPercentageData = gameData["orange"]["stats"]["core"]["shooting_percentage"];
        
        // Get blue data
        let blueShotsPercentageData = gameData["blue"]["stats"]["core"]["shooting_percentage"];

        // Add X axis
        var x = d3.scaleBand()
        .domain(groups)
        .range([0, 300])
        svg.append("g")
        .attr("transform", "translate(30, 450)")
        .call(d3.axisBottom(x).tickSize(0));

        let maxScore = Math.max(orangeShotsPercentageData, blueShotsPercentageData);

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([0, 100])
        .range([ 400, 0 ]);
        y.nice();

        // Add Y axis
        svg.append("g")
        .attr("transform", "translate(30, 50)")
        .call(d3.axisLeft(y))

        // Add orange bar
        let oRect = svg.append("rect")
            .attr("x", 50)
            .attr("y", y(orangeShotsPercentageData))
            .attr("width", 75)
            .attr("height", 400 - y(orangeShotsPercentageData))
            .attr("fill", "orange")
            .attr("transform", "translate(15, 50)");

        //tooltip html
        let players = this.orangePlayerData;
        let ttHTMLOrange = '<center><h5>' + orangeShotsPercentageData + ' '  + ' %</h5></center>';
            //var tooltipHTML = '';
        players.forEach( (d) => {
            ttHTMLOrange += '<p>' + d["name"] + ': <b>' + d["stats"]["core"]["shooting_percentage"] + '%</b></p>';
        });
       
        // Add orange bar
        let bRect = svg.append("rect")
            .attr("x", 50)
            .attr("y", y(blueShotsPercentageData))
            .attr("width", 75)
            .attr("height", 400 - y(blueShotsPercentageData))
            .attr("fill", "blue")
            .attr("transform", "translate(170, 50)");

        //tooltip html
        players = this.bluePlayerData;
        let ttHTMLBlue = '<center><h5>' + blueShotsPercentageData + ' '  + ' %</h5></center>';
            //var tooltipHTML = '';
        players.forEach( (d) => {
            ttHTMLBlue += '<p>' + d["name"] + ': <b>' + d["stats"]["core"]["shooting_percentage"] + '%</b></p>';
        });

        // Update tooltip handlers
        globalApplicationState.players.AddTooltipHandler.call(this, ttHTMLOrange, oRect);
        globalApplicationState.players.AddTooltipHandler.call(this, ttHTMLBlue, bRect);
    }

    AddDemosChart(data) {
        // Set gameData variable
        let gameData = data;
        // Set x-axis group labels
        let groups = ["Orange", "Blue"];

        // Select svg
        let svg = d3.select("#demos-stats")
        .attr("width", "350px")
        .attr("height", "500px");

        // Remove all previous elements
        svg.selectAll("rect").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        // Add demos text
        svg.append("text")
        .attr("x", 140)
        .attr("y", 485)
        .text("Demos")

        // Get orange data
        let orangeDemosInflictedData = gameData["orange"]["stats"]["demo"]["inflicted"];
        
        // Get blue data
        let blueDemosInflictedData = gameData["blue"]["stats"]["demo"]["inflicted"];

        // Add X axis
        var x = d3.scaleBand()
        .domain(groups)
        .range([0, 300])
        svg.append("g")
        .attr("transform", "translate(30, 450)")
        .call(d3.axisBottom(x).tickSize(0));

        let maxScore = Math.max(orangeDemosInflictedData, blueDemosInflictedData);
        // Add Y axis
        var y = d3.scaleLinear()
        .domain([0, maxScore+5])
        .range([ 400, 0 ]);
        y.nice();

        // Add Y axis
        svg.append("g")
        .attr("transform", "translate(30, 50)")
        .call(d3.axisLeft(y))

        // Add orange bar
        let oRect = svg.append("rect")
        .attr("x", 50)
        .attr("y", y(orangeDemosInflictedData))
        .attr("width", 75)
        .attr("height", 400 - y(orangeDemosInflictedData))
        .attr("fill", "orange")
        .attr("transform", "translate(15, 50)");

        //tooltip html
        let players = this.orangePlayerData;
        let ttHTMLOrange = '<center><h5>' + orangeDemosInflictedData + ' '  + ' demos</h5></center>';
            //var tooltipHTML = '';
        players.forEach( (d) => {
            ttHTMLOrange += '<p>' + d["name"] + ': <b>' + d["stats"]["demo"]["inflicted"] + '</b></p>';
        });
       
        // Add orange bar
        let bRect = svg.append("rect")
        .attr("x", 50)
        .attr("y", y(blueDemosInflictedData))
        .attr("width", 75)
        .attr("height", 400 - y(blueDemosInflictedData))
        .attr("fill", "blue")
        .attr("transform", "translate(170, 50)");

        //tooltip html
        players = this.bluePlayerData;
        let ttHTMLBlue = '<center><h5>' + blueDemosInflictedData + ' '  + ' demos</h5></center>';
            //var tooltipHTML = '';
        players.forEach( (d) => {
            ttHTMLBlue += '<p>' + d["name"] + ': <b>' + d["stats"]["demo"]["inflicted"] + '</b></p>';
        });

        // Update tooltip handlers
        globalApplicationState.players.AddTooltipHandler.call(this, ttHTMLOrange, oRect);
        globalApplicationState.players.AddTooltipHandler.call(this, ttHTMLBlue, bRect);
    }

    AddBoostStatsCharts(data) {
        // Update visibility for various charts
        d3.select("#game-visualizations").style("position", "absolute");
        d3.select("#stat-list").style("margin-top", "440px");
        d3.select("#stats-text").text("Boost stats");

        // Hide core stat charts
        d3.select("#core-stats").style("display", "none");
        d3.select("#score-stats").style("display", "none");
        d3.select("#shotpercentage-stats").style("display", "none");
        d3.select("#demos-stats").style("display", "none");

        // Display boost stat charts
        d3.select("#players-bpm-stats").style("display", "");
        d3.select("#players-avg-boost-stats").style("display", "");
        d3.select("#team-bpm-stats").style("display", "");
        d3.select("#team-avg-boost-stats").style("display", "");
        d3.select("#team-time-boost-stats").style("display", "");
        d3.select("#boost-pads-stats").style("display", "");

        // Update boost stat charts
        globalApplicationState.players.AddTeamBPMChart(data);
        globalApplicationState.players.AddTeamAvgBoostChart(data);
        globalApplicationState.players.AddTeamTimeBoostChart(data);
    }

    AddTeamBPMChart(data) {
        // Set gameData variable
        let gameData = data;
        // Set x-axis group label
        let groups = ["Boost-Per-Minute"];

        // Select svg
        let svg = d3.select("#team-bpm-stats")
        .attr("width", "500px")
        .attr("height", "430px")
        .style("margin-left", "50px");

        // Remove all previous elements
        svg.selectAll("rect").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        // Get orange data
        let orangeBPMData = gameData["orange"]["stats"]["boost"]["bpm"];

        // Get blue data
        let blueBPMData = gameData["blue"]["stats"]["boost"]["bpm"];

        // Add X axis
        var x = d3.scaleBand()
        .domain(groups)
        .range([0, 450])
        svg.append("g")
        .attr("transform", "translate(40,410)")
        .call(d3.axisBottom(x).tickSize(0));

        // Add Y axis
        var y = d3.scaleLinear()
        .domain(d3.extent([0,Math.max(blueBPMData, orangeBPMData) + 100]))
        .range([ 400, 0 ]);
        y.nice();

        // Create Y axis
        svg.append("g")
        .attr("transform", "translate(40,10)")
        .call(d3.axisLeft(y));

        // Add orange bar
        let oRect = svg.append("rect")
        .attr("x", 65)
        .attr("y", y(orangeBPMData)+10)
        .attr("width", 150)
        .attr("height", 400-y(orangeBPMData))
        .attr("fill", "orange");

        // Tooltip html
        let players = this.orangePlayerData;
        let ttHTMLOrange = '<center><h5>' + Math.round(gameData["orange"]["stats"]["boost"]["bpm"]*100)/100 + ' '  + ' BPM</h5></center>';
        players.forEach( (d) => {
            ttHTMLOrange += '<p>' + d["name"] + ': <b>' + d["stats"]["boost"]["bpm"] + '</b></p>';
        });
        
        // Add blue bar
        let bRect = svg.append("rect")
        .attr("x", 215)
        .attr("y", y(blueBPMData)+10)
        .attr("width", 150)
        .attr("height", 400-y(blueBPMData))
        .attr("fill", "blue");

        // Tooltip html
        players = this.bluePlayerData;
        let ttHTMLBlue = '<center><h5>' + Math.round(gameData["blue"]["stats"]["boost"]["bpm"]*100)/100 + ' '  + ' BPM</h5></center>';
        players.forEach( (d) => {
            ttHTMLBlue += '<p>' + d["name"] + ': <b>' + d["stats"]["boost"]["bpm"] + '</b></p>';
        });

        // Update tooltip handlers
        globalApplicationState.players.AddTooltipHandler.call(this, ttHTMLOrange, oRect);
        globalApplicationState.players.AddTooltipHandler.call(this, ttHTMLBlue, bRect);
    }

    AddTeamAvgBoostChart(data) {
        // Set gameData variable
        let gameData = data;
        // Set x-axis group label
        let groups = ["Avg. Boost Amount"];

        // Select svg
        let svg = d3.select("#team-avg-boost-stats")
        .attr("width", "500px")
        .attr("height", "430px");

        // Remove all previous elements
        svg.selectAll("rect").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        // Get orange data
        let orangeAvgAmountData = gameData["orange"]["stats"]["boost"]["avg_amount"];

        // Get blue data
        let blueAvgAmountData = gameData["blue"]["stats"]["boost"]["avg_amount"];

        // Add X axis
        var x = d3.scaleBand()
        .domain(groups)
        .range([0, 450])
        svg.append("g")
        .attr("transform", "translate(40,410)")
        .call(d3.axisBottom(x).tickSize(0));

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([0, Math.max(orangeAvgAmountData, blueAvgAmountData)+30])
        .range([ 400, 0 ]);
        y.nice();

        // Create Y axis
        svg.append("g")
        .attr("transform", "translate(40,10)")
        .call(d3.axisLeft(y));

        // Add orange bar
        let oRect = svg.append("rect")
        .attr("x", 65)
        .attr("y", y(orangeAvgAmountData)+10)
        .attr("width", 150)
        .attr("height", 400-y(orangeAvgAmountData))
        .attr("fill", "orange");

        // Tooltip html
        let players = this.orangePlayerData;
        let ttHTMLOrange = '<center><h5>' + Math.round(gameData["orange"]["stats"]["boost"]["avg_amount"]*100)/100 + ' '  + ' Boost</h5></center>';
        players.forEach( (d) => {
            ttHTMLOrange += '<p>' + d["name"] + ': <b>' + d["stats"]["boost"]["avg_amount"] + '</b></p>';
        });

        // Add blue bar
        let bRect = svg.append("rect")
        .attr("x", 215)
        .attr("y", y(blueAvgAmountData)+10)
        .attr("width", 150)
        .attr("height", 400-y(blueAvgAmountData))
        .attr("fill", "blue");

        // Tooltip html
        players = this.bluePlayerData;
        let ttHTMLBlue = '<center><h5>' + Math.round(gameData["blue"]["stats"]["boost"]["avg_amount"]*100)/100 + ' '  + ' Boost</h5></center>';
        players.forEach( (d) => {
            ttHTMLBlue += '<p>' + d["name"] + ': <b>' + d["stats"]["boost"]["avg_amount"] + '</b></p>';
        });
        
        // Update tooltip handlers
        globalApplicationState.players.AddTooltipHandler.call(this, ttHTMLOrange, oRect);
        globalApplicationState.players.AddTooltipHandler.call(this, ttHTMLBlue, bRect);
    }

    AddTeamTimeBoostChart(data) {
        // Set gameData variable
        let gameData = data;
        // Set x-axis group label
        let groups = ["Time at 0 Boost", "Time at 100 Boost"];

        // Select svg
        let svg = d3.select("#team-time-boost-stats")
        .attr("width", "1100px")
        .attr("height", "430px");

        // Remove all previous elements
        svg.selectAll("rect").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        // Get orange data
        let orangeTimeZeroData = gameData["orange"]["stats"]["boost"]["time_zero_boost"];
        let orangeTimeFullData = gameData["orange"]["stats"]["boost"]["time_full_boost"];

        // Get blue data
        let blueTimeZeroData = gameData["blue"]["stats"]["boost"]["time_zero_boost"];
        let blueTimeFullData = gameData["blue"]["stats"]["boost"]["time_full_boost"];

        // Add X axis
        var x = d3.scaleBand()
        .domain(groups)
        .range([0, 1000])
        .padding([0.2])
        svg.append("g")
        .attr("transform", "translate(30,410)")
        .call(d3.axisBottom(x).tickSize(0));

        // Add Y axis
        var y = d3.scaleLinear()
        .domain(d3.extent([0,Math.max(orangeTimeFullData, blueTimeFullData) + 20]))
        .range([ 400, 0 ]);
        svg.append("g")
        .attr("transform", "translate(30,10)")
        .call(d3.axisLeft(y));

        let orangeData = [];

        // Push data as dictionary for time at 0 boost
        orangeData.push({
            key: "Time at 0 Boost",
            dataKey: "time_zero_boost",
            value: orangeTimeZeroData
        });
        // Push data as dictionary for time at 100 boost
        orangeData.push({
            key: "Time at 100 Boost",
            dataKey: "time_full_boost",
            value: orangeTimeFullData
        });

        // Add orange bars
        var xSubgroup = d3.scaleBand()
        .domain(groups)
        .range([0, 0]);

        //Show the bars
        svg.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(orangeData)
        .enter()
        .append("g")
            .attr("transform", function(d) { return "translate(" + (x(d.key)+60) + ",10)"; })
        .selectAll("rect")
        .data(d => [d])
        .enter().append("rect")
            .attr("class", "orange-boost-time-rect")
            .attr("team", "orange")
            .attr("type", function(d) {return d.dataKey.toLowerCase()})
            .attr("x", function(d) { return xSubgroup(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", 150)
            .attr("height", function(d) { return 400 - y(d.value); })
            .attr("fill", function(d) { return "orange"; });


        // Add tooltip handlers
        let rect = d3.selectAll(".orange-boost-time-rect");
        let types = ["time_zero_boost", "time_full_boost"];
        let players = this.orangePlayerData;

        for (var i = 0; i < 2; i++)
        {
            let rectFiltered = rect.filter(function() {
                return d3.select(this).attr("type") == types[i] && d3.select(this).attr("team") == "orange";
            });

            var tooltipHTML = '<center><h5>' + Math.round(gameData["orange"]["stats"]["boost"][types[i]]*100)/100 + ' '  + ' Seconds</h5></center>';
                //var tooltipHTML = '';
            players.forEach( (d) => {
                tooltipHTML += '<p>' + d["name"] + ': <b>' + d["stats"]["boost"][types[i]] + '</b></p>';
            });

            globalApplicationState.players.AddTooltipHandler.call(this, tooltipHTML, rectFiltered);
        }

        let blueData = [];

        // Push data as dictionary for time at 0 boost
        blueData.push({
            key: "Time at 0 Boost",
            dataKey: "time_zero_boost",
            value: blueTimeZeroData
        });
        // Push data as dictionary for time at 100 boost
        blueData.push({
            key: "Time at 100 Boost",
            dataKey: "time_full_boost",
            value: blueTimeFullData
        });

        //Show the bars
        svg.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(blueData)
        .enter()
        .append("g")
            .attr("transform", function(d) { return "translate(" + (x(d.key)+210) + ",10)"; })
        .selectAll("rect")
        .data(d => [d])
        .enter().append("rect")
            .attr("class", "blue-boost-time-rect")
            .attr("team", "blue")
            .attr("type", function(d) {return d.dataKey.toLowerCase()})
            .attr("x", function(d) { return xSubgroup(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", 150)
            .attr("height", function(d) { return 400 - y(d.value); })
            .attr("fill", function(d) { return "blue"; });

        // Add tooltip handlers
        rect = d3.selectAll(".blue-boost-time-rect");
        types = ["time_zero_boost", "time_full_boost"];
        players = this.bluePlayerData;

        for (var i = 0; i < 2; i++)
        {
            let rectFiltered = rect.filter(function() {
                return d3.select(this).attr("type") == types[i] && d3.select(this).attr("team") == "blue";
            });

            var tooltipHTML = '<center><h5>' + Math.round(gameData["blue"]["stats"]["boost"][types[i]]*100)/100 + ' '  + ' Seconds</h5></center>';
                //var tooltipHTML = '';
            players.forEach( (d) => {
                tooltipHTML += '<p>' + d["name"] + ': <b>' + d["stats"]["boost"][types[i]] + '</b></p>';
            });

            globalApplicationState.players.AddTooltipHandler.call(this, tooltipHTML, rectFiltered);
        }
    }
}