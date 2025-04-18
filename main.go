/*
SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/Varu19Git/fabric-samples/evidence-tracking/simple-chaincode/chaincode"
)

func main() {
	evidenceChaincode, err := contractapi.NewChaincode(&chaincode.SmartContract{})
	if err != nil {
		log.Panicf("Error creating evidence-tracking chaincode: %v", err)
	}

	if err := evidenceChaincode.Start(); err != nil {
		log.Panicf("Error starting evidence-tracking chaincode: %v", err)
	}
} 