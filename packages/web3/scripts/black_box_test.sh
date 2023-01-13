#!/usr/bin/env bash

ORIGARGS=("$@")

. scripts/env.sh

helpFunction() {
	echo "Usage: $0 <ganache | geth | infura> <http | ws> <chrome | firefox | electron>"
	exit 1 # Exit script after printing help
}

BACKEND=${ORIGARGS[0]}
MODE=${ORIGARGS[1]}
BROWSER=${ORIGARGS[2]}

SUPPORTED_BACKENDS=("ganache" "geth" "infura")
SUPPORTED_MODE=("http" "ws")
SUPPORTED_BROWSERS=("chrome" "firefox" "electron")

if [[ ! " ${SUPPORTED_BACKENDS[*]} " =~ " ${BACKEND} " ]]; then
	helpFunction
fi

if [[ ! " ${SUPPORTED_MODE[*]} " =~ " ${MODE} " ]]; then
	helpFunction
fi

if [[ -n "${BROWSER}" && ! " ${SUPPORTED_BROWSERS[*]} " =~ " ${BROWSER} " ]]; then
	helpFunction
fi

echo "RPC client Provider: " $BACKEND
echo "RPC client Protocol: " $MODE

export WEB3_SYSTEM_TEST_PROVIDER="$MODE://localhost:$WEB3_SYSTEM_TEST_PORT"
export WEB3_SYSTEM_TEST_BACKEND=$BACKEND

cd test/black_box
yarn --update-checksums
yarn

if [[ ${BACKEND} == "infura" ]]
then
    if [ ! $INFURA_HTTP ] || [ ! $INFURA_WSS ]
    then
        echo "No Infura provider URL specified"
        exit 1
    elif [ $MODE == "http" ]
    then
        if [ -n "${BROWSER}" ]
        then
            WEB3_SYSTEM_TEST_PROVIDER=$INFURA_HTTP yarn "test:$BACKEND:$MODE:$BROWSER"
        else
            WEB3_SYSTEM_TEST_PROVIDER=$INFURA_HTTP yarn "test:$BACKEND:$MODE"
        fi
    else
        if [ -n "${BROWSER}" ]
        then
            WEB3_SYSTEM_TEST_PROVIDER=$INFURA_WSS yarn "test:$BACKEND:$MODE:$BROWSER"
        else
            WEB3_SYSTEM_TEST_PROVIDER=$INFURA_WSS yarn "test:$BACKEND:$MODE"
        fi
    fi
else
    if [ -n "${BROWSER}" ]
    then
        yarn "test:$BACKEND:$MODE:$BROWSER"
    else
        yarn "test:$BACKEND:$MODE"
    fi
fi