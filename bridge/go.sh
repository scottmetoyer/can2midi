#!/bin/bash
# Bring up the CAN interfaces
sudo ip link set can0 type can bitrate 125000
sudo ip link set can0 up

sudo ip link set can1 type can bitrate 125000
sudo ip link set can1 up

sudo ip link set can2 type can bitrate 125000
sudo ip link set can2 up

sudo ip link set can3 type can bitrate 125000
sudo ip link set can4 up

# Start recording the CAN data
#candump -g 10 -I 01F -L 8 vcan0 &
#candump -g 10 -I 02F -L 8 vcan1 &
#candump -g 10 -I 03F -L 8 vcan2 &
#candump -g 10 -I 04F -L 8 vcan3 &

# Start up the socketcand server
socketcand -i can0,can1,can2,can3 -l enp0s8 &

echo "Server is running..."
read -p "Press enter to stop"

pkill -P $$

# Bring down the CAN interfaces
sudo ip link set can0 down
sudo ip link set can1 down
sudo ip link set can2 down
sudo ip link set can3 down

