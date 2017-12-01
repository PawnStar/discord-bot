bot_key=$1
output_file=$2

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
