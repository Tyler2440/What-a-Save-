import ballchasing
import json
import re

# Dictionary parser (when it includes lists)
# Function taken from answer "https://stackoverflow.com/a/21059941" by user 'falsetru', posted on Jan 11, 2014 at 7:45
# On question: "https://stackoverflow.com/questions/21059466/python-json-parser/21059941#21059941"
def iterparse(j):
    nonspace = re.compile(r'\S')
    decoder = json.JSONDecoder()
    pos = 0
    while True:
        matched = nonspace.search(j, pos)
        if not matched:
            break
        pos = matched.start()
        decoded, pos = decoder.raw_decode(j, pos)
        yield decoded

token = "dnMk6TfuPmJbQkBt7gBx61MvJlKnRGQ8AQnDDrsj"
api = ballchasing.Api(token)

# Gets x amount of games from the API
generator = api.get_replays(None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, 1000, None, None)

# Writes the games retrieved from above to data.json
with open("Data/data.json", "r+") as file:
    for replay in generator:
        #data = json.loads(replay)
        json.dump(replay, file)
        file.write("\n")

# Retrieves the actual match data (with game statistics) from the games retrieved from above and writes them to match_data.json
with open("Data/data.json", "r") as file:
    with open("Data/match_data.json", "a") as file2:
        for replay in file:
            data = json.loads(replay)
            match_data  = api.get_replay(data.get("id"))
            json.dump(match_data, file2)
            file2.write(",\n")

# Example of getting match data out of match_data.json
# with open("Data/match_data.json", 'r') as file:
#     for match in file:
#         data = list(iterparse(match))
#         data = data[0]
#         if data.get("blue").get("players") is not None:
#             for player in data.get("blue").get("players"):
#                 if player.get("car_name") is None:
#                     print("Player: " + player.get("name") + ", Car: Unknown" + ", BPM: " +  str(player.get("stats").get("boost").get("bpm")))
#                 else:
#                     print("Player: " + player.get("name") + ", Car: " + player.get("car_name") + ", BPM: " +  str(player.get("stats").get("boost").get("bpm")))
