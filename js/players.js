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
        this.FillPlayersTable();
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
            
            if (game["orange"]["players"] != undefined && game["orange"]["stats"]["core"]["goals"] != game["orange"]["stats"]["core"]["goals_against"])
            {
                game["orange"]["players"].forEach(player => players.add(player["name"]));
            }
        });

        players.forEach( function(player) {
            playerSelect.append("option")
            .attr("label", player);
        });
    }

    AddSortingHandlers() {
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
                    this.data.sort((x, y) => x["date"] < y["date"] ? 1 : -1); // Sort the data
                    i.classed("no-display", false); // Remove the "no-display" class
                    i.classed("fa-solid fa-sort-down", false); // Add the sort up icon
                    i.classed("fa-solid fa-sort-up", true); // Remove the sort up button
                }  
                else
                {                    
                    this.data.sort((x, y) => x["date"] < y["date"] ? -1 : 1); // Sort the data
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
                    this.data.sort(function(x, y) {
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
                    this.data.sort(function(x, y) {
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
            else if (d['srcElement'].innerText == "Goals ")
            {
                let source = d3.select(d.srcElement);
                source.classed("sorting", true);
                let i = source.select("i");
                // If this column is in ascending order
                if (this.headerData[2].ascending)
                {                    
                    this.data.sort(function(x, y) {
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
                    this.data.sort(function(x, y) {
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
            else if (d['srcElement'].innerText == "Assists ")
            {
                let source = d3.select(d.srcElement);
                source.classed("sorting", true);
                let i = source.select("i");
                // If this column is in ascending order
                if (this.headerData[3].ascending)
                {                   
                    this.data.sort(function(x, y) {
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
                    this.data.sort(function(x, y) {
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
            else if (d['srcElement'].innerText == "Saves ")
            {
                let source = d3.select(d.srcElement);
                source.classed("sorting", true);
                let i = source.select("i");
                // If this column is in ascending order
                if (this.headerData[3].ascending)
                {                   
                    this.data.sort(function(x, y) {
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
                    this.data.sort(function(x, y) {
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

                row.style("background-color", "white");
            })
            .on("mouseout", function() {
                let row = d3.select(this).select("svg");
                row.style("background-color", "lightgray");
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

            if (onBlue)
            {
                if (blueGoals > orangeGoals)
                {
                    return "W";
                }
                else if (blueGoals == orangeGoals)
                {
                    return "T";
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

    RowClickHandler() {
        globalApplicationState.players.FillOrangeScoreBoard.call(this);
        globalApplicationState.players.FillBlueScoreBoard.call(this);
        globalApplicationState.players.AddGameCoreStatsCharts.call(this);
        globalApplicationState.players.AddButtonHandlers.call(this);
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
        .attr("transform", "translate(470,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player shots
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["shots"];
        })
        .attr("transform", "translate(563,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player demos
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["demo"]["inflicted"];
        })
        .attr("transform", "translate(645,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");
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
        .attr("transform", "translate(470,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player shots
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["core"]["shots"];
        })
        .attr("transform", "translate(563,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");

        // Add player demos
        svgSelect
        .data(d => [d])
        .append("text")
        .text(function(d) {   
            return d["stats"]["demo"]["inflicted"];
        })
        .attr("transform", "translate(645,20)")
        .style("font-size", "15px")
        .style("text-anchor", "middle");
    }

    AddButtonHandlers() {
        let coreButton = d3.select("#core-button");
        let boostButton = d3.select("#boost-button");
        let otherButton = d3.select("#other-button");

        boostButton.on("click", function() {globalApplicationState.players.AddBoostStatsCharts.call(this) });
        coreButton.on("click", function() { globalApplicationState.players.AddGameCoreStatsCharts.call(this) });
        //otherButton.on("click", globalApplicationState.players.AddGameOtherStatsCharts.call(this));
        console.log(boostButton);
    }

    AddGameCoreStatsCharts() {          
        d3.select("#game-visualization-div").style("display", "");
        d3.select("#stat-visualization-div").style("display", "");
        
        d3.select("#core-stats").style("display", "");
        d3.select("#score-stats").style("display", "");
        d3.select("#shotpercentage-stats").style("display", "");
        d3.select("#demos-stats").style("display", "");

        d3.select("#players-bpm-stats").style("display", "none");
        d3.select("#players-avg-boost-stats").style("display", "none");
        d3.select("#team-bpm-stats").style("display", "none");
        d3.select("#team-avg-boost-stats").style("display", "none");
        d3.select("#boost-pads-stats").style("display", "none");

        let svg = d3.select("#core-stats")
        .attr("width", "1100px")
        .attr("height", "430px");

        svg.data(d3.select(this)._groups["0"]["0"]["__data__"]);

        globalApplicationState.players.AddCoreStatsChart.call(this);
        globalApplicationState.players.AddScoreChart.call(this);
        globalApplicationState.players.AddShootingPercentageChart.call(this);
        globalApplicationState.players.AddDemosChart.call(this);
    }

    AddCoreStatsChart() {
        let gameData = d3.select(this)._groups["0"]["0"]["__data__"];
        let groups = ["Goals", "Shots", "Assists", "Saves"];

        let svg = d3.select("#core-stats")
        .attr("width", "1100px")
        .attr("height", "430px");

        svg.selectAll("rect").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        // Orange
        let orangeShotsData = gameData["orange"]["stats"]["core"]["shots"];
        let orangeGoalsData = gameData["orange"]["stats"]["core"]["goals"];
        let orangeAssistsData = gameData["orange"]["stats"]["core"]["assists"];
        let orangeSavesData = gameData["orange"]["stats"]["core"]["saves"];

        // Blue
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
            .attr("x", function(d) { return xSubgroup(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", 75)
            .attr("height", function(d) { return 400 - y(d.value); })
            .attr("fill", function(d) { return "orange"; });

        let blueData = [];

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
            .attr("transform", function(d) { console.log(d.key); return "translate(" + (x(d.key) + 140) + ",10)"; })
        .selectAll("rect")
        .data(d => [d])
        .enter().append("rect")
            .attr("x", function(d) { return xSubgroup(d.key); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", 75)
            .attr("height", function(d) { return 400 - y(d.value); })
            .attr("fill", function(d) { return "blue"; });
    }

    AddScoreChart() {
        let gameData = d3.select(this)._groups["0"]["0"]["__data__"];
        let groups = ["Orange", "Blue"];

        let svg = d3.select("#score-stats")
        .attr("width", "350px")
        .attr("height", "500px");

        svg.selectAll("rect").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        svg.append("text")
        .attr("x", 140)
        .attr("y", 485)
        .text("Score")

        // Orange
        let orangeScoreData = gameData["orange"]["stats"]["core"]["score"];
        let orangeShotsPercentageData = gameData["orange"]["stats"]["core"]["shooting_percentage"];
        let orangeDemosInflictedData = gameData["orange"]["stats"]["demo"]["inflicted"];
        
        // Blue
        let blueScoreData = gameData["blue"]["stats"]["core"]["score"];
        let blueShotsPercentageData = gameData["blue"]["stats"]["core"]["shooting_percentage"];
        let blueDemosInflictedData = gameData["blue"]["stats"]["demo"]["inflicted"];

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

        svg.append("g")
        .attr("transform", "translate(30, 50)")
        .call(d3.axisLeft(y))

        // Add orange bar
        svg.append("rect")
        .attr("x", 50)
        .attr("y", y(orangeScoreData))
        .attr("width", 75)
        .attr("height", 400 - y(orangeScoreData))
        .attr("fill", "orange")
        .attr("transform", "translate(15, 50)");
       
        // Add orange bar
        svg.append("rect")
        .attr("x", 50)
        .attr("y", y(blueScoreData))
        .attr("width", 75)
        .attr("height", 400 - y(blueScoreData))
        .attr("fill", "blue")
        .attr("transform", "translate(170, 50)");
    }

    AddShootingPercentageChart() {
        let gameData = d3.select(this)._groups["0"]["0"]["__data__"];
        let groups = ["Orange", "Blue"];

        let svg = d3.select("#shotpercentage-stats")
        .attr("width", "350px")
        .attr("height", "500px");

        svg.selectAll("rect").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        svg.append("text")
        .attr("x", 100)
        .attr("y", 485)
        .text("Shooting Percentage")

        // Orange
        let orangeShotsPercentageData = gameData["orange"]["stats"]["core"]["shooting_percentage"];
        
        // Blue
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

        svg.append("g")
        .attr("transform", "translate(30, 50)")
        .call(d3.axisLeft(y))

        // Add orange bar
        svg.append("rect")
        .attr("x", 50)
        .attr("y", y(orangeShotsPercentageData))
        .attr("width", 75)
        .attr("height", 400 - y(orangeShotsPercentageData))
        .attr("fill", "orange")
        .attr("transform", "translate(15, 50)");
       
        // Add orange bar
        svg.append("rect")
        .attr("x", 50)
        .attr("y", y(blueShotsPercentageData))
        .attr("width", 75)
        .attr("height", 400 - y(blueShotsPercentageData))
        .attr("fill", "blue")
        .attr("transform", "translate(170, 50)");
    }

    AddDemosChart() {
        let gameData = d3.select(this)._groups["0"]["0"]["__data__"];
        let groups = ["Orange", "Blue"];

        let svg = d3.select("#demos-stats")
        .attr("width", "350px")
        .attr("height", "500px");

        svg.selectAll("rect").remove();
        svg.selectAll("text").remove();
        svg.selectAll("line").remove();

        svg.append("text")
        .attr("x", 140)
        .attr("y", 485)
        .text("Demos")

        // Orange
        let orangeDemosInflictedData = gameData["orange"]["stats"]["demo"]["inflicted"];
        
        // Blue
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

        svg.append("g")
        .attr("transform", "translate(30, 50)")
        .call(d3.axisLeft(y))

        // Add orange bar
        svg.append("rect")
        .attr("x", 50)
        .attr("y", y(orangeDemosInflictedData))
        .attr("width", 75)
        .attr("height", 400 - y(orangeDemosInflictedData))
        .attr("fill", "orange")
        .attr("transform", "translate(15, 50)");
       
        // Add orange bar
        svg.append("rect")
        .attr("x", 50)
        .attr("y", y(blueDemosInflictedData))
        .attr("width", 75)
        .attr("height", 400 - y(blueDemosInflictedData))
        .attr("fill", "blue")
        .attr("transform", "translate(170, 50)");
    }

    AddBoostStatsCharts() {
        let gameData = d3.select(this)._groups["0"]["0"]["__data__"];
        let groups = ["Goals", "Shots", "Assists", "Saves"];

        // Hide other svgs
        d3.select("#core-stats").style("display", "none");
        d3.select("#score-stats").style("display", "none");
        d3.select("#shotpercentage-stats").style("display", "none");
        d3.select("#demos-stats").style("display", "none");

        // Display only boost stats
        d3.select("#players-bpm-stats").style("display", "");
        d3.select("#players-avg-boost-stats").style("display", "");
        d3.select("#team-bpm-stats").style("display", "");
        d3.select("#team-avg-boost-stats").style("display", "");
        d3.select("#boost-pads-stats").style("display", "");

        // let svg = d3.select("#core-stats")
        // .attr("width", "1100px")
        // .attr("height", "430px");

        // svg.selectAll("rect").remove();
        // svg.selectAll("text").remove();
        // svg.selectAll("line").remove();

        // // Orange
        // let orangeShotsData = gameData["orange"]["stats"]["core"]["shots"];
        // let orangeGoalsData = gameData["orange"]["stats"]["core"]["goals"];
        // let orangeAssistsData = gameData["orange"]["stats"]["core"]["assists"];
        // let orangeSavesData = gameData["orange"]["stats"]["core"]["saves"];

        // // Blue
        // let blueShotsData = gameData["blue"]["stats"]["core"]["shots"];
        // let blueGoalsData = gameData["blue"]["stats"]["core"]["goals"];
        // let blueAssistsData = gameData["blue"]["stats"]["core"]["assists"];
        // let blueSavesData = gameData["blue"]["stats"]["core"]["saves"];

        // // Add X axis
        // var x = d3.scaleBand()
        // .domain(groups)
        // .range([0, 1000])
        // .padding([0.2])
        // svg.append("g")
        // .attr("transform", "translate(30,410)")
        // .call(d3.axisBottom(x).tickSize(0));

        // // Add Y axis
        // var y = d3.scaleLinear()
        // .domain(d3.extent([0,Math.max(orangeShotsData, Math.max(blueShotsData, Math.max(orangeSavesData, blueSavesData))) + 3]))
        // .range([ 400, 0 ]);
        // svg.append("g")
        // .attr("transform", "translate(30,10)")
        // .call(d3.axisLeft(y));

        // let orangeData = [];

        // orangeData.push({
        //     key: "Goals",
        //     value: orangeGoalsData
        // });
        // orangeData.push({
        //     key: "Shots",
        //     value: orangeShotsData
        // });
        // orangeData.push({
        //     key: "Assists",
        //     value: orangeAssistsData
        // });
        // orangeData.push({
        //     key: "Saves",
        //     value: orangeSavesData
        // });

        // svg.data(orangeData);

        // var xSubgroup = d3.scaleBand()
        // .domain(groups)
        // .range([0, 0]);

        // //Show the bars
        // svg.append("g")
        // .selectAll("g")
        // // Enter in data = loop group per group
        // .data(orangeData)
        // .enter()
        // .append("g")
        //     .attr("transform", function(d) { return "translate(" + (x(d.key)+40) + ",10)"; })
        // .selectAll("rect")
        // .data(d => [d])
        // .enter().append("rect")
        //     .attr("x", function(d) { return xSubgroup(d.key); })
        //     .attr("y", function(d) { return y(d.value); })
        //     .attr("width", 75)
        //     .attr("height", function(d) { return 400 - y(d.value); })
        //     .attr("fill", function(d) { return "orange"; });

        // let blueData = [];

        // blueData.push({
        //     key: "Goals",
        //     value: blueGoalsData
        // });
        // blueData.push({
        //     key: "Shots",
        //     value: blueShotsData
        // });
        // blueData.push({
        //     key: "Assists",
        //     value: blueAssistsData
        // });
        // blueData.push({
        //     key: "Saves",
        //     value: blueSavesData
        // });

        // svg.data(blueData);

        // var xSubgroup = d3.scaleBand()
        // .domain(groups)
        // .range([0, 0]);

        // //Show the bars
        // svg.append("g")
        // .selectAll("g")
        // // Enter in data = loop group per group
        // .data(blueData)
        // .enter()
        // .append("g")
        //     .attr("transform", function(d) { console.log(d.key); return "translate(" + (x(d.key) + 140) + ",10)"; })
        // .selectAll("rect")
        // .data(d => [d])
        // .enter().append("rect")
        //     .attr("x", function(d) { return xSubgroup(d.key); })
        //     .attr("y", function(d) { return y(d.value); })
        //     .attr("width", 75)
        //     .attr("height", function(d) { return 400 - y(d.value); })
        //     .attr("fill", function(d) { return "blue"; });
    }

    AddGameOtherStatsCharts() {

    }
}