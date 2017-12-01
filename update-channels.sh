bot_key=$1
temp_dir=$2
output_file=$temp_dir"/channels.txt"
last_check=$temp_dir"/lastChannelCheck.txt"

#Check if necessary
prev_time=$(cat $last_check 2> /dev/null)
curr_time=$(date +%s)

if [ "$prev_time" != "" ]; then
  timeDiff=$(( $curr_time-$prev_time ))
  if [[ $timeDiff -lt 60 ]]; then
    exit 0;
  fi
fi

echo $curr_time > $last_check;

echo "" > $output_file;

# Get servers
guilds_info=$(curl -s -X GET \
  https://discordapp.com/api/users/@me/guilds \
  -H 'authorization: Bot '$bot_key \
  -H 'cache-control: no-cache')

guilds=$(echo $guilds_info | jq -r '[.[] | .id ] | .[]')

# Get all channels for those servers
while read -r guild; do
  echo "Loading channels for server \"$guild\""

  channels_info=$(curl -s -X GET \
    https://discordapp.com/api/guilds/$guild/channels \
    -H 'authorization: Bot '$bot_key \
    -H 'cache-control: no-cache')

  channels=$(echo $channels_info | jq -r '[.[] | select(.type == 0) | .id] | .[]');

  echo "$channels" >> $output_file

done <<< "$guilds"
