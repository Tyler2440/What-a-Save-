class Players {
    /**
     * Creates the Players object
     */
    constructor(data) { 
        this.data = data;
        
        console.log(data);

        this.AddTableHeaders();
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

        console.log(playerData);
        
        // add table row data
        let trs = d3.select('#table-body')
            .selectAll('tr')
            .data(playerData)
            .join("tr");

        // // add table data data
        // let tds = trs.selectAll('td')
        //     .data(this.rowToCellDataTransform)
        //     .join('td')

        // Set up text cells
        // let textSelection = tds.filter(d => d.type === 'text')
        // textSelection.selectAll("tr")
        //     .data(d => [d])
        //     .join("text")
        //     .text(d => (d.value))
    }


    // rowToCellDataTransform(d) {
    //     return [
    //         {type: 'text', value: d.phrase},
    //         {type: 'text', value: d.phrase},
    //         {type: 'text', value: d.phrase},
    //         {type: 'text', value: d.phrase},
    //         {type: 'text', value: d.phrase}
    //     ];
    // }
}