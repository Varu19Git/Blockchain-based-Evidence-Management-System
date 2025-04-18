/*
SPDX-License-Identifier: Apache-2.0
*/

package chaincode

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing an Asset
type SmartContract struct {
	contractapi.Contract
}

// Evidence describes the structure of an evidence record
type Evidence struct {
	ID          string `json:"ID"`
	Description string `json:"Description"`
	CaseID      string `json:"CaseID"`
	FileHash    string `json:"FileHash"`
	SubmittedBy string `json:"SubmittedBy"`
	Status      string `json:"Status"`
}

// InitLedger adds a base set of evidence records to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	evidences := []Evidence{
		{
			ID:          "EV001",
			Description: "Surveillance camera footage",
			CaseID:      "CASE1001",
			FileHash:    "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o",
			SubmittedBy: "officer1",
			Status:      "verified",
		},
		{
			ID:          "EV002",
			Description: "Fingerprint",
			CaseID:      "CASE1001",
			FileHash:    "QmXs5YtpYsLCYkioRFgRRYQTQ1E4Zpfpbj2GRLo4qJ8L9d",
			SubmittedBy: "officer2",
			Status:      "processing",
		},
	}

	for _, evidence := range evidences {
		evidenceJSON, err := json.Marshal(evidence)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(evidence.ID, evidenceJSON)
		if err != nil {
			return fmt.Errorf("failed to put to world state: %v", err)
		}
	}

	return nil
}

// CreateEvidence issues a new evidence to the world state with given details
func (s *SmartContract) CreateEvidence(ctx contractapi.TransactionContextInterface, id string, description string, caseID string, fileHash string, submittedBy string) error {
	exists, err := s.EvidenceExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the evidence %s already exists", id)
	}

	evidence := Evidence{
		ID:          id,
		Description: description,
		CaseID:      caseID,
		FileHash:    fileHash,
		SubmittedBy: submittedBy,
		Status:      "submitted",
	}
	evidenceJSON, err := json.Marshal(evidence)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, evidenceJSON)
}

// ReadEvidence returns the evidence stored in the world state with given id
func (s *SmartContract) ReadEvidence(ctx contractapi.TransactionContextInterface, id string) (*Evidence, error) {
	evidenceJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if evidenceJSON == nil {
		return nil, fmt.Errorf("the evidence %s does not exist", id)
	}

	var evidence Evidence
	err = json.Unmarshal(evidenceJSON, &evidence)
	if err != nil {
		return nil, err
	}

	return &evidence, nil
}

// UpdateEvidenceStatus updates the status of an existing evidence
func (s *SmartContract) UpdateEvidenceStatus(ctx contractapi.TransactionContextInterface, id string, newStatus string) error {
	evidence, err := s.ReadEvidence(ctx, id)
	if err != nil {
		return err
	}

	evidence.Status = newStatus
	evidenceJSON, err := json.Marshal(evidence)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, evidenceJSON)
}

// GetAllEvidence returns all evidence found in world state
func (s *SmartContract) GetAllEvidence(ctx contractapi.TransactionContextInterface) ([]*Evidence, error) {
	// range query with empty string for startKey and endKey does an
	// open-ended query of all evidence in the chaincode namespace.
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var evidences []*Evidence
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var evidence Evidence
		err = json.Unmarshal(queryResponse.Value, &evidence)
		if err != nil {
			return nil, err
		}
		evidences = append(evidences, &evidence)
	}

	return evidences, nil
}

// EvidenceExists returns true when evidence with given ID exists in world state
func (s *SmartContract) EvidenceExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	evidenceJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return evidenceJSON != nil, nil
} 