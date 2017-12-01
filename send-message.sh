if [ ! -f .webhook ]; then
	echo "No webhook defined in .webhook file!"
	exit 1;
fi

url=$(cat .webhook)

timeDiff=$(( $(date -d"next-thursday 18:30:00" +%s)-$(date +%s)))

# Seven days in seconds
if [[ $timeDiff -gt 604800 ]]; then
	timeDiff="$(( $timeDiff-604800))"
	echo $timeDiff
fi

message=$(echo $(time-countdown $timeDiff) from now at Kirk\'s place it is then)
data=$(echo {\"content\":\"$message \"})

curl -X POST $url \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d "$data"
