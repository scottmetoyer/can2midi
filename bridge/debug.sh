#!/bin/bash
ip link add dev vcan0 type vcan
ip link set up vcan0

ip link add dev vcan1 type vcan
ip link set up vcan1

ip link add dev vcan2 type vcan
ip link set up vcan2

ip link add dev vcan3 type vcan
ip link set up vcan3

# Start generating test data
#cangen -g 10 -I 01F -L 8 vcan0 &
#cangen -g 10 -I 02F -L 8 vcan1 &
#cangen -g 10 -I 03F -L 8 vcan2 &
#cangen -g 10 -I 04F -L 8 vcan3 &

# Start up the socketcand server
socketcand -i vcan0,vcan1,vcan2,vcan3 -l enp0s8 &

# Play the debug file
canplayer -l i -I candump-2021-03-07_132034.log vcan0=can0

echo "Server is running..."
read -p "Press enter to stop"

pkill -P $$

# Bring down the CAN interfaces
sudo ip link set vcan0 down