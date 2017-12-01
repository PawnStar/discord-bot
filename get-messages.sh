bot_key=$1
channel_id=$2
temp_file=$3

# Get last message in channel
if [ ! -f $temp_file ]; then
  channel_info=$(curl -s -X GET \
    https://discordapp.com/api/channels/$channel_id \
    -H 'authorization: Bot '$bot_key \
    -H 'cache-control: no-cache')

  last_message=$(echo $channel_info | grep -o '"last_message_id": "[^"]*"' | grep -o '[^"]*"$' | grep -o '[^"]*')
  echo "[$channel_id] Starting from message $last_message"
  echo "$last_message" > $temp_file
fi

last_message=$(cat $temp_file)

messages_info=$(curl -s -X GET \
  'https://discordapp.com/api/channels/'$channel_id'/messages?after='$last_message \
  -H 'authorization: Bot '$bot_key \
  -H 'cache-control: no-cache' );

if [ "$messages_info" == "" ] || [ $(echo "$messages_info" | jq length) == 0 ]; then
	exit 0;
fi

echo Message string:
echo $messages_info

# TODO: Move content extraction into loop to get user out of it
messages=$(echo $messages_info | jq -r '[.[] | .content ] | .[]')

while read -r message; do
	echo "[$channel_id] Processing message \"$message\""

  if [[ $message == !* ]]; then
    ./selectCommand.sh "$message" "$channel_id"
  fi
done <<< "$messages"

#Update last message seen
echo $messages_info | jq -r '.[0].id' > $temp_file
