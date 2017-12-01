if [ ! -f .webhook ]; then
	echo "No webhook defined in .webhook file!"
	exit 1;
fi

function displaytime {
  local T=$1
  local D=$((T/60/60/24))
  local H=$((T/60/60%24))
  local M=$((T/60%60))
  local S=$((T%60))
  (( $D > 0 )) && printf '%d days ' $D
  (( $H > 0 )) && printf '%d hours ' $H
  (( $M > 0 )) && printf '%d minutes ' $M
  (( $D > 0 || $H > 0 || $M > 0 )) && printf 'and '
  printf '%d seconds\n' $S
}

url=$(cat .webhook)

timeDiff=$(( $(date -d"next-thursday 18:30:00" +%s)-$(date +%s)))

# Seven days in seconds
if [[ $timeDiff -gt 604800 ]]; then
	timeDiff="$(( $timeDiff-604800))"
	echo $timeDiff
fi

message=$(echo $(displaytime $timeDiff) from now at Kirk\'s place it is then)
data=$(echo {\"content\":\"$message \"})

curl -X POST $url \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d "$data"
