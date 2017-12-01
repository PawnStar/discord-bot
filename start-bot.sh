#Load bot key from file
if [ ! -f .botkey ]; then
	echo "No bot key defined in .botkey file!"
	exit 1;
fi
bot_key=$(cat .botkey)

# Make file for channels list
temp_dir=$(mktemp -d);
mkdir $temp_dir"/channels/"
channels_list=$temp_dir"/channels.txt"

echo "Starting in directory "$temp_dir

while sleep 1; do
	./update-channels.sh $bot_key $temp_dir

	while read -r channel; do
		if [ "$channel" == "" ]; then
			continue;
		fi

		temp_file="$temp_dir/channels/$channel"
		./get-messages.sh $bot_key $channel $temp_file
	done <<< "$(cat $channels_list)"
done;
