package chaincode_test

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/Varu19Git/fabric-samples/evidence-tracking/chaincode-go/chaincode"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// Rest of the file remains unchanged 