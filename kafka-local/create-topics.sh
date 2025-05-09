#!/bin/bash

echo "Creating Kafka topics..."

kafka-topics --create --if-not-exists \
    --topic booking-created \
    --partitions 1 \
    --replication-factor 1 \
    --bootstrap-server localhost:9092

kafka-topics --create --if-not-exists \
    --topic payment-processed \
    --partitions 1 \
    --replication-factor 1 \
    --bootstrap-server localhost:9092

kafka-topics --create --if-not-exists \
    --topic seat-reserved \
    --partitions 1 \
    --replication-factor 1 \
    --bootstrap-server localhost:9092

kafka-topics --create --if-not-exists \
    --topic booking-confirmed \
    --partitions 1 \
    --replication-factor 1 \
    --bootstrap-server localhost:9092

kafka-topics --create --if-not-exists \
    --topic booking-cancelled \
    --partitions 1 \
    --replication-factor 1 \
    --bootstrap-server localhost:9092

echo "Listing created topics:"
kafka-topics --list --bootstrap-server localhost:9092
