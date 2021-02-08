#!/bin/bash

# Bring up the CAN interfaces
#sudo ip link set can0 type can bitrate 125000
#sudo ip link set can0 up

#sudo ip link set can1 type can bitrate 125000
#sudo ip link set can1 up

#sudo ip link set can2 type can bitrate 125000
#sudo ip link set can2 up

#sudo ip link set can3 type can bitrate 125000
#sudo ip link set can4 up

#socketcand -i can0, can1, can2, can3 -v -l enp0s8

ip link add dev vcan0 type vcan
ip link set up vcan0

ip link add dev vcan1 type vcan
ip link set up vcan1

ip link add dev vcan2 type vcan
ip link set up vcan2

ip link add dev vcan3 type vcan
ip link set up vcan3

# Start generating test data
cangen -g 10 -I 01F -L 8 vcan0 &
cangen -g 10 -I 02F -L 8 vcan1 &
cangen -g 10 -I 03F -L 8 vcan2 &
cangen -g 10 -I 04F -L 8 vcan3 &

# Start up the socketcand server
# socketcand -i vcan0,vcan1,vcan2,vcan3 -v -l enp0s8
socketcand -i vcan0,vcan1,vcan2,vcan3 -v -l enp0s8

# Bring down the CAN interfaces
#sudo ip link set can0 down
#sudo ip link set can1 down
#sudo ip link set can2 down
#sudo ip link set can3 down

