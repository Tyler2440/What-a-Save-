import ballchasing
import json

token = "dnMk6TfuPmJbQkBt7gBx61MvJlKnRGQ8AQnDDrsj"
api = ballchasing.Api(token)

generator = api.get_replays(None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, 7, None, None)

with open("Data/data.json", "a") as file:
    for replay in generator:
        json.dump(replay, file)
        file.write("\n")

