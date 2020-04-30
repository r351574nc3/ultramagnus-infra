#!/bin/sh

mkdir -p ${HOME}/.aws
cp /workspace/credentials ${HOME}/.aws

exec node "$@"