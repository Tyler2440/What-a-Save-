async function loadData () {
    const data = await d3.json('/Data/match_data.json');
    return { data };
  }
 
  const globalApplicationState = {
    data: null,
    players: null,
    population: null,
  };
 
  loadData().then((loadedData) => {
   // Hold the data in globalApplicationState
   globalApplicationState.data = loadedData.data;
 
   // Initialize the table, and hold it in globalApplicationState
   const playersObj = new Players(globalApplicationState.data);
   globalApplicationState.players = playersObj;
})