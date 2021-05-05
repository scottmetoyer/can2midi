#!/bin/bash
# Bring up the CAN interfaces
# HYBRID
sudo ip link set can0 type can bitrate 500000
sudo ip link set can0 up

# BODY
sudo ip link set can1 type can bitrate 250000
sudo ip link set can1 up

# HMI
sudo ip link set can2 type can bitrate 500000
sudo ip link set can2 up

sudo ip link set can3 type can bitrate 125000
sudo ip link set can3 up

# Start recording the CAN data
candump -l can0 &
candump -l can1 &
candump -l can2 &
candump -l can3 &

# Start up the socketcand server
socketcand -i can0,can1,can2,can3 -l enp0s8 &

echo "Server is running..."
read -p "Press enter to stop"

pkill -P $$

cp ./*.log ./dumps

# Bring down the CAN interfaces
sudo ip link set can0 down
sudo ip link set can1 down
sudo ip link set can2 down
sudo ip link set can3 down

