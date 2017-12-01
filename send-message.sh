channel=$1
message=$2

if [ ! -f .botkey ]; then
	echo "No bot key defined in .botkey file!"
	exit 1;
fi
bot_key=$(cat .botkey)
