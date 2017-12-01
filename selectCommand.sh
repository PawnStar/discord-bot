message=$1
channel=$2

if [ "$message" == "!clock" ]; then
  ./commands/clock.sh
fi;

if [ "$message" == "!ping" ]; then
  ./send-message $channel "pong!"
fi;
